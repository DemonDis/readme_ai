import * as vscode from 'vscode';

export function registerUpdateCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('readme-ai.update', async (promptFile?: string) => {
    vscode.window.showInformationMessage('Update в разработке...');
  });
}