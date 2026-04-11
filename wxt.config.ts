import { defineConfig } from 'wxt';

export default defineConfig({
  name: 'Readme AI',
  title: 'Readme AI',
  manifest: {
    permissions: [
      'storage',
      'tabs',
      'activeTab',
      'scripting',
    ],
  },
});