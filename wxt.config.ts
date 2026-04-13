import { defineConfig } from 'wxt';

export default defineConfig({
  name: 'Readme AI',
  title: 'Readme AI',
  manifest: {
    id: 'readmeai@github',
    background: {
      scripts: ['background.js'],
    },
    permissions: [
      'storage',
      'tabs',
      'activeTab',
      'scripting',
      'downloads',
      'nativeMessaging',
      '*://*.github.com/*',
    ],
    content_scripts: [
      {
        matches: ['*://*.github.com/*'],
        js: ['github-detector.js'],
        run_at: 'document_idle'
      }
    ],
    web_accessible_resources: [
      {
        resources: ['popup.html'],
        matches: ['<all_urls>']
      }
    ]
  },
});