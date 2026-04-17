import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../services/config';
import { DEFAULT_TREE_EXCLUDE, TREE_CONFIG_FILE } from '../config/tree';

const configService = new ConfigService();

function matchPattern(filename: string, pattern: string): boolean {
  if (pattern.startsWith('*.')) {
    const ext = pattern.slice(1);
    return filename.endsWith(ext);
  }
  if (pattern.endsWith('/')) {
    return filename === pattern.slice(0, -1);
  }
  return filename === pattern;
}

function generateTree(workspacePath: string): string {
  const excludeSet = new Set(DEFAULT_TREE_EXCLUDE);
  
  const gitignorePath = path.join(workspacePath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    const gitignorePatterns = gitignoreContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    for (const pattern of gitignorePatterns) {
      excludeSet.add(pattern);
    }
  }
  
  function walk(dir: string, prefix: string = '', isLast: boolean = true): string {
    let result = '';
    
    try {
      const entries = fs.readdirSync(dir).sort();
      const dirs: string[] = [];
      const files: string[] = [];
      
      for (const entry of entries) {
        if (entry.startsWith('.')) continue;
        
        let isExcluded = false;
        for (const pattern of excludeSet) {
          if (matchPattern(entry, pattern)) {
            isExcluded = true;
            break;
          }
        }
        if (isExcluded) continue;
        
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          dirs.push(entry);
        } else {
          files.push(entry);
        }
      }
      
      const allEntries = [...dirs, ...files];
      
      for (let i = 0; i < allEntries.length; i++) {
        const entry = allEntries[i];
        const isLastEntry = i === allEntries.length - 1;
        const entryPath = path.join(dir, entry);
        const stat = fs.statSync(entryPath);
        
        if (stat.isDirectory()) {
          result += prefix + (isLastEntry ? '└── ' : '├── ') + entry + '/\n';
          result += walk(entryPath, prefix + (isLastEntry ? '    ' : '│   '), isLastEntry);
        } else {
          result += prefix + (isLastEntry ? '└── ' : '├── ') + entry + '\n';
        }
      }
    } catch (e) {
      // skip inaccessible dirs
    }
    
    return result;
  }
  
  return walk(workspacePath);
}

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
    const treePath = path.join(workspacePath, TREE_CONFIG_FILE);

    vscode.window.showInformationMessage('Generating project tree...');

    const treeContent = generateTree(workspacePath);
    fs.writeFileSync(treePath, treeContent);
    vscode.window.showInformationMessage(`${TREE_CONFIG_FILE} created`);

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