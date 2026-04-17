import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../services/config';

const configService = new ConfigService();
const AI_SERVICE_NAME = 'readme-ai.edit-prompt';

export function registerEditPromptCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand(AI_SERVICE_NAME, async (promptFile: string, folder: string = '') => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    const ext = vscode.extensions.getExtension('readme-ai.readme-ai');
    if (!ext) {
      vscode.window.showErrorMessage('Extension not found');
      return;
    }

    const promptsPath = folder
      ? path.join(ext.extensionPath, 'src', 'prompts', folder, promptFile)
      : path.join(ext.extensionPath, 'src', 'prompts', promptFile);

    if (!fs.existsSync(promptsPath)) {
      vscode.window.showErrorMessage(`Prompt file not found: ${promptFile}`);
      return;
    }

    const doc = await vscode.workspace.openTextDocument(promptsPath);
    const editor = await vscode.window.showTextDocument(doc);

    const saveListener = vscode.workspace.onDidSaveTextDocument(async (savedDoc) => {
      if (savedDoc.uri.fsPath === promptsPath) {
        vscode.window.showInformationMessage(`Prompt saved: ${promptFile}`);
      }
    });

    context.subscriptions.push(saveListener);
  });
}