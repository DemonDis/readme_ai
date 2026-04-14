import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { IlnskConfig, DEFAULT_ILNSK_CONFIG } from '../config/types';
import { DEFAULT_REPOMIX_CONFIG } from '../config/repomix';

export class ConfigService {
  private getIlnskPath(workspacePath: string): string {
    return path.join(workspacePath, '.ilnsk');
  }

  private getRepomixConfigPath(workspacePath: string): string {
    return path.join(workspacePath, 'repomix.config.json');
  }

  readIlnskConfig(workspacePath: string): IlnskConfig | null {
    const configPath = this.getIlnskPath(workspacePath);
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error reading .ilnsk: ${error}`);
    }
    return null;
  }

  createIlnskConfig(workspacePath: string): IlnskConfig {
    const configPath = this.getIlnskPath(workspacePath);
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_ILNSK_CONFIG, null, 2));
    return DEFAULT_ILNSK_CONFIG;
  }

  saveIlnskConfig(workspacePath: string, config: IlnskConfig): void {
    const configPath = this.getIlnskPath(workspacePath);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  checkOrCreateRepomixConfig(workspacePath: string): boolean {
    const configPath = this.getRepomixConfigPath(workspacePath);
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(DEFAULT_REPOMIX_CONFIG, null, 2));
      return true;
    }
    return false;
  }
}