import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../services/config';
import { RepomixService } from '../services/repomix';
import { AiService } from '../services/ai';

const configService = new ConfigService();
const repomixService = new RepomixService();
const aiService = new AiService();

export function registerGenerateCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('readme-ai.generate', async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    const workspacePath = workspaceFolder.uri.fsPath;
    const wasCreated = configService.checkOrCreateRepomixConfig(workspacePath);
    if (wasCreated) {
      vscode.window.showInformationMessage('Created repomix.config.json');
    }

    let config = configService.readIlnskConfig(workspacePath);
    if (!config) {
      config = configService.createIlnskConfig(workspacePath);
      vscode.window.showWarningMessage('Created default .ilnsk config. Please configure and run again.');
      return;
    }

    if (!config.apiUrl || !config.apiKey || !config.model) {
      vscode.window.showWarningMessage('Please configure .ilnsk settings first.');
      vscode.commands.executeCommand('readme-ai.setup');
      return;
    }

    try {
      vscode.window.showInformationMessage('Running repomix...');
      
      const outputPath = await repomixService.run(workspacePath);
      vscode.window.showInformationMessage('Repomix completed');

      const repomixContent = repomixService.readOutput(outputPath);

      vscode.window.showInformationMessage('Sending to AI...');
      
      const readmeContent = await aiService.generateReadme(
        config.apiUrl,
        config.apiKey,
        config.model,
        repomixContent
      );

      const readmePath = path.join(workspacePath, 'README.md');
      fs.writeFileSync(readmePath, readmeContent);

      vscode.window.showInformationMessage('README.md created successfully!');
      
      const doc = await vscode.workspace.openTextDocument(readmePath);
      await vscode.window.showTextDocument(doc);

    } catch (error: any) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  });
}