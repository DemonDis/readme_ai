export const DEFAULT_REPOMIX_CONFIG = {
  input: {
    maxFileSize: 50000000
  },
  output: {
    filePath: 'repomix-output.xml',
    style: 'xml',
    parsableStyle: false,
    compress: false,
    headerText: '',
    fileSummary: true,
    directoryStructure: true,
    files: true,
    removeComments: false,
    removeEmptyLines: false,
    topFilesLength: 5,
    showLineNumbers: false,
    truncateBase64: false,
    copyToClipboard: false,
    includeEmptyDirectories: false,
    git: {
      sortByChanges: true,
      sortByChangesMaxCommits: 100,
      includeDiffs: false,
      includeLogs: false,
      includeLogsCount: 50
    }
  },
  include: ['**/*'],
  ignore: {
    useGitignore: true,
    useDefaultPatterns: true,
    customPatterns: [
      'additional-folder',
      '**/*.log'
    ]
  },
  security: {
    enableSecurityCheck: true
  },
  tokenCount: {
    encoding: 'o200k_base'
  }
};