import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  name: 'Readme AI',
  title: 'Readme AI',
  description: 'Browser extension for GitHub repository management',
  browser: {
    chrome: { manifestVersion: 3 },
    firefox: { manifestVersion: 2 },
  },
  manifest: {
    permissions: [
      'storage',
      'tabs',
      'activeTab',
      'scripting',
    ],
  },
});