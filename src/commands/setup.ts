import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../services/config';

const configService = new ConfigService();

export function registerSetupCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('readme-ai.setup', async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    let config = configService.readIlnskConfig(workspaceFolder.uri.fsPath);
    if (!config) {
      config = configService.createIlnskConfig(workspaceFolder.uri.fsPath);
    }

    configService.checkOrCreateRepomixConfig(workspaceFolder.uri.fsPath);
    vscode.window.showInformationMessage('Created repomix.config.json');

    const apiUrl = await vscode.window.showInputBox({
      prompt: 'Enter API URL',
      value: config.apiUrl,
    });
    
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter API Key',
      value: config.apiKey,
    });
    
    const model = await vscode.window.showInputBox({
      prompt: 'Enter Model Name',
      value: config.model,
    });

    if (apiUrl && apiKey && model) {
      const newConfig = {
        apiUrl,
        apiKey,
        model,
        prompt: config.prompt,
        gitmoji: config.gitmoji
      };
      configService.saveIlnskConfig(workspaceFolder.uri.fsPath, newConfig);
      vscode.window.showInformationMessage('Settings saved to .ilnsk!');
    }
  });
}