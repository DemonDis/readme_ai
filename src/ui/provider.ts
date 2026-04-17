import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function getPromptFiles(): string[] {
  const ext = vscode.extensions.getExtension('readme-ai.readme-ai');
  if (!ext) return [];
  
  const promptsPath = path.join(ext.extensionPath, 'src', 'prompts');
  try {
    const files = fs.readdirSync(promptsPath).filter(f => f.endsWith('.md'));
    return files;
  } catch (e) {
    console.error('Error reading prompts:', e);
    return [];
  }
}

export class ReadmeAiTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
    if (element) {
      if (element.label === 'Generate') {
        return getPromptFiles().map(file => {
          const item = new vscode.TreeItem(file.replace('.md', ''), vscode.TreeItemCollapsibleState.None);
          item.iconPath = new vscode.ThemeIcon('file-text');
          item.command = {
            command: 'readme-ai.generate',
            title: file,
            arguments: [file]
          };
          return item;
        });
      }
      return [];
    }

    const setupItem = new vscode.TreeItem('Setup', vscode.TreeItemCollapsibleState.None);
    setupItem.iconPath = new vscode.ThemeIcon('gear');
    setupItem.command = {
      command: 'readme-ai.setup',
      title: 'Setup'
    };

    const generateItem = new vscode.TreeItem('Generate', vscode.TreeItemCollapsibleState.Expanded);
    generateItem.iconPath = new vscode.ThemeIcon('files');
    (generateItem as vscode.TreeItem & { children?: vscode.TreeItem[] }).children = getPromptFiles().map(file => {
      const item = new vscode.TreeItem(file.replace('.md', ''), vscode.TreeItemCollapsibleState.None);
      item.iconPath = new vscode.ThemeIcon('file-text');
      item.command = {
        command: 'readme-ai.generate',
        title: file,
        arguments: [file]
      };
      return item;
    });

    return [setupItem, generateItem];
  }
}