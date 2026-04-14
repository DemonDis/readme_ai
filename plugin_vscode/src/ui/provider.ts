import * as vscode from 'vscode';

export class ReadmeAiTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    const items = [
      { label: 'Setup', command: 'readme-ai.setup' },
      { label: 'Generate README', command: 'readme-ai.generate' }
    ];
    return items.map(item => {
      const treeItem = new vscode.TreeItem(item.label);
      treeItem.command = {
        command: item.command,
        title: item.label
      };
      return treeItem;
    });
  }
}