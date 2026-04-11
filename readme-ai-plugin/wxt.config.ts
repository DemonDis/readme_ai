import { defineConfig } from 'wxt';

export default defineConfig({
  name: 'README AI',
  description: 'GitHub README generator with preview and publish',
  version: '1.0.0',
  browsers: ['chrome', 'firefox', 'safari', 'edge'],
  browserApi: 'chrome',
  permissions: ['storage'],
  action: {
    default_title: 'README AI',
  },
  imports: [
    'utils/github.ts',
    'utils/markdown.ts',
  ],
});