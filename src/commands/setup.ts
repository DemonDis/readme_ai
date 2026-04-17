import * as vscode from 'vscode';
import { ConfigService } from '../services/config';

const configService = new ConfigService();

export function registerSetupCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('readme-ai.setup', async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    const workspacePath = workspaceFolder.uri.fsPath;
    const ilnskPath = configService.getIlnskPath(workspacePath);
    const repomixPath = configService.getRepomixConfigPath(workspacePath);

    if (!configService.fileExists(ilnskPath)) {
      configService.createIlnskConfig(workspacePath);
      vscode.window.showInformationMessage('.ilnsk created. Please configure it manually.');
    } else {
      vscode.window.showInformationMessage('.ilnsk already exists');
    }

    if (!configService.fileExists(repomixPath)) {
      configService.createRepomixConfig(workspacePath);
      vscode.window.showInformationMessage('repomix.config.json created');
    }
  });
}