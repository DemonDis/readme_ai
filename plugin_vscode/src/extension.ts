import * as vscode from 'vscode';
import { workspace, ConfigurationTarget } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const config = workspace.getConfiguration('readme-ai');
  
  const setupCommand = vscode.commands.registerCommand('readme-ai.setup', async () => {
    const apiUrl = await vscode.window.showInputBox({
      prompt: 'Enter API URL',
      placeHolder: 'https://api.example.com/v1/',
    });
    
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter API Key',
      password: true,
    });
    
    const model = await vscode.window.showInputBox({
      prompt: 'Enter Model Name',
      placeHolder: 'gpt-4',
    });

    if (apiUrl && apiKey && model) {
      await config.update('apiUrl', apiUrl, ConfigurationTarget.Global);
      await config.update('apiKey', apiKey, ConfigurationTarget.Global);
      await config.update('model', model, ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Settings saved!');
    }
  });

  const generateCommand = vscode.commands.registerCommand('readme-ai.generate', async () => {
    const apiUrl = config.get<string>('apiUrl');
    const apiKey = config.get<string>('apiKey');
    const model = config.get<string>('model');

    if (!apiUrl || !apiKey || !model) {
      const answer = await vscode.window.showWarningMessage(
        'Please configure readme-ai settings first.',
        'Open Settings'
      );
      if (answer === 'Open Settings') {
        vscode.commands.executeCommand('readme-ai.setup');
      }
      return;
    }

    const workspaceFolder = workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    vscode.window.showInformationMessage('Generating README with repomix...');
    vscode.window.showInformationMessage(`Config: url=${apiUrl}, model=${model}`);
  });

  context.subscriptions.push(setupCommand, generateCommand);
}

export function deactivate() {}
