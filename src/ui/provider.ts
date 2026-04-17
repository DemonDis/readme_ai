import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function getPromptFiles(folder: string = ''): string[] {
  const ext = vscode.extensions.getExtension('readme-ai.readme-ai');
  if (!ext) return [];
  
  const promptsPath = folder 
    ? path.join(ext.extensionPath, 'src', 'prompts', folder)
    : path.join(ext.extensionPath, 'src', 'prompts');
  try {
    const files = fs.readdirSync(promptsPath).filter(f => f.endsWith('.md'));
    return files;
  } catch (e) {
    console.error('Error reading prompts:', e);
    return [];
  }
}

function createTreeItem(label: string, command: string, icon: string, args?: string[]): vscode.TreeItem {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.iconPath = new vscode.ThemeIcon(icon);
  item.command = {
    command,
    title: label,
    arguments: args ? [args[0]] : undefined
  };
  return item;
}

export class ReadmeAiTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
    if (element) {
      if (element.label === 'Generate') {
        return getPromptFiles().map(file => 
          createTreeItem(file.replace('.md', ''), 'readme-ai.generate', 'file-text', [file])
        );
      }
      if (element.label === 'Update') {
        return getPromptFiles('update').map(file => 
          createTreeItem(file.replace('.md', ''), 'readme-ai.update', 'file-text', [file])
        );
      }
      return [];
    }

    const setupItem = createTreeItem('Setup', 'readme-ai.setup', 'gear');
    const generateItem = new vscode.TreeItem('Generate', vscode.TreeItemCollapsibleState.Expanded);
    generateItem.iconPath = new vscode.ThemeIcon('files');
    (generateItem as vscode.TreeItem & { children?: vscode.TreeItem[] }).children = getPromptFiles().map(file => 
      createTreeItem(file.replace('.md', ''), 'readme-ai.generate', 'file-text', [file])
    );

    const updateItem = new vscode.TreeItem('Update', vscode.TreeItemCollapsibleState.Expanded);
    updateItem.iconPath = new vscode.ThemeIcon('sync');
    (updateItem as vscode.TreeItem & { children?: vscode.TreeItem[] }).children = getPromptFiles('update').map(file => 
      createTreeItem(file.replace('.md', ''), 'readme-ai.update', 'file-text', [file])
    );

    return [setupItem, generateItem, updateItem];
  }
}