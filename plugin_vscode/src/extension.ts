import * as vscode from 'vscode';
import { registerSetupCommand, registerGenerateCommand } from './commands';
import { ReadmeAiTreeProvider } from './ui/provider';

export function activate(context: vscode.ExtensionContext) {
  const treeView = vscode.window.createTreeView('readme-ai-sidebar', {
    treeDataProvider: new ReadmeAiTreeProvider()
  });

  const setupCommand = registerSetupCommand(context);
  const generateCommand = registerGenerateCommand(context);

  context.subscriptions.push(treeView, setupCommand, generateCommand);
}

export function deactivate() {}