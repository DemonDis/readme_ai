import { simpleGit, SimpleGit } from 'simple-git';

export interface GitDiffSummary {
  isGitRepo: boolean;
  changedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  renamedFiles: string[];
  rawDiff: string;
  hasChanges: boolean;
  baseRef: string;
}

export class GitService {
  private git: SimpleGit;

  constructor(workspacePath: string) {
    this.git = simpleGit(workspacePath);
  }

  async isGitRepository(): Promise<boolean> {
    try {
      return await this.git.checkIsRepo();
    } catch {
      return false;
    }
  }

  async getDiff(baseRef: string = 'HEAD'): Promise<GitDiffSummary> {
    const isGitRepo = await this.isGitRepository();
    if (!isGitRepo) {
      return {
        isGitRepo: false,
        changedFiles: [],
        addedFiles: [],
        deletedFiles: [],
        renamedFiles: [],
        rawDiff: '',
        hasChanges: false,
        baseRef,
      };
    }

    try {
      const rawDiff = await this.git.diff([baseRef]);
      const nameStatus = await this.git.diff(['--name-status', baseRef]);

      const addedFiles: string[] = [];
      const deletedFiles: string[] = [];
      const renamedFiles: string[] = [];
      const changedFiles: string[] = [];

      for (const line of nameStatus.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('A\t')) {
          addedFiles.push(trimmed.slice(2));
        } else if (trimmed.startsWith('D\t')) {
          deletedFiles.push(trimmed.slice(2));
        } else if (trimmed.startsWith('M\t') || trimmed.startsWith('C\t')) {
          changedFiles.push(trimmed.slice(2));
        } else if (trimmed.startsWith('R')) {
          const parts = trimmed.split('\t');
          if (parts.length >= 3) {
            renamedFiles.push(`${parts[1]} -> ${parts[2]}`);
          }
        }
      }

      return {
        isGitRepo: true,
        changedFiles,
        addedFiles,
        deletedFiles,
        renamedFiles,
        rawDiff,
        hasChanges: rawDiff.trim().length > 0,
        baseRef,
      };
    } catch {
      return {
        isGitRepo: true,
        changedFiles: [],
        addedFiles: [],
        deletedFiles: [],
        renamedFiles: [],
        rawDiff: '',
        hasChanges: false,
        baseRef,
      };
    }
  }

  async getRecentTags(limit: number = 5): Promise<string[]> {
    try {
      const tags = await this.git.tags();
      return tags.all.slice(-limit);
    } catch {
      return [];
    }
  }

  async getLastCommitHash(): Promise<string> {
    try {
      const log = await this.git.log({ maxCount: 1 });
      return log.latest?.hash || '';
    } catch {
      return '';
    }
  }

  formatDiffForAI(diff: GitDiffSummary, maxLength: number = 8000): string {
    let diffText = diff.rawDiff;
    if (diffText.length > maxLength) {
      diffText = diffText.slice(0, maxLength) + '\n... (truncated)';
    }

    return [
      `## Git Diff Summary (base: ${diff.baseRef})`,
      `- Changed files: ${diff.changedFiles.length}`,
      `- Added files: ${diff.addedFiles.length}`,
      `- Deleted files: ${diff.deletedFiles.length}`,
      `- Renamed files: ${diff.renamedFiles.length}`,
      '',
      '### Diff:',
      '```diff',
      diffText,
      '```',
    ].join('\n');
  }

  async getFormattedCommitHistory(baseRef: string, maxLength: number = 8000): Promise<string> {
    try {
      const log = await this.git.log({ from: baseRef, to: 'HEAD' });
      const parts: string[] = ['## Commit History', ''];

      for (const commit of log.all) {
        const header = `### ${commit.hash} ${commit.message}`;
        const date = commit.date ? `*Date: ${commit.date}*` : '';
        const body = commit.body ? `\n${commit.body}` : '';

        const section = [header, date, body].filter(Boolean).join('\n');
        const currentTotal = parts.join('\n\n').length + section.length;

        if (currentTotal > maxLength) {
          parts.push(`... (${log.all.length - parts.length + 1} more commits omitted)`);
          break;
        }
        parts.push(section);
      }

      return parts.join('\n\n');
    } catch {
      return '';
    }
  }
}
