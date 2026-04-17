import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../services/config';
import { RepomixService } from '../services/repomix';
import { AiService } from '../services/ai';
import { TokenService } from '../services/token';

const configService = new ConfigService();
const repomixService = new RepomixService();
const aiService = new AiService();
const tokenService = new TokenService();

function getPromptContent(promptFile: string): string {
  const ext = vscode.extensions.getExtension('readme-ai.readme-ai');
  if (!ext) throw new Error('Extension not found');
  
  const promptsPath = path.join(ext.extensionPath, 'src', 'prompts', promptFile);
  return fs.readFileSync(promptsPath, 'utf-8');
}

function getPromptType(promptFile: string): string {
  return getPromptContent(promptFile);
}

export function registerGenerateCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('readme-ai.generate', async (promptFile?: string) => {
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
      const tokenCount = tokenService.countForQwen(repomixContent);
      
      vscode.window.showInformationMessage(`Token count (Qwen): ${tokenCount.toLocaleString()}`);

      let promptType = 'Создай README.md для моего проекта';
      if (promptFile) {
        promptType = getPromptType(promptFile);
      }

      vscode.window.showInformationMessage('Sending to AI...');
      
      const readmeContent = await aiService.generateReadme(
        config.apiUrl,
        config.apiKey,
        config.model,
        repomixContent,
        promptType
      );

      let outputFileName = 'README.md';
      if (promptFile) {
        const baseName = promptFile.replace('.md', '');
        outputFileName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + '.md';
      }

      let readmePath = path.join(workspacePath, outputFileName);
      if (fs.existsSync(readmePath)) {
        const ext = path.extname(outputFileName);
        const base = path.basename(outputFileName, ext);
        let counter = 1;
        do {
          outputFileName = `${base}_${counter}${ext}`;
          readmePath = path.join(workspacePath, outputFileName);
          counter++;
        } while (fs.existsSync(readmePath));
      }

      fs.writeFileSync(readmePath, readmeContent);

      const timestamp = new Date().toLocaleString('ru-RU');
      fs.appendFileSync(readmePath, `\n\n---\nGenerated: ${timestamp}`);

      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      vscode.window.showInformationMessage(`${outputFileName} created successfully!`);
      
      const doc = await vscode.workspace.openTextDocument(readmePath);
      await vscode.window.showTextDocument(doc);

    } catch (error: any) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  });
}