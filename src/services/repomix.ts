import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);

export class RepomixService {
  private repomixPath: string;

  constructor() {
    this.repomixPath = path.join(__dirname, '..', 'node_modules', 'repomix', 'bin', 'repomix.cjs');
  }

  async run(workspacePath: string): Promise<string> {
    try {
      await execAsync(`node "${this.repomixPath}"`, {
        cwd: workspacePath
      });

      const outputPath = path.join(workspacePath, 'repomix-output.xml');
      if (fs.existsSync(outputPath)) {
        return outputPath;
      }
      throw new Error('Repomix output not found');
    } catch (error: any) {
      throw new Error(`Repomix error: ${error.message}`);
    }
  }

  readOutput(outputPath: string): string {
    return fs.readFileSync(outputPath, 'utf-8');
  }
}