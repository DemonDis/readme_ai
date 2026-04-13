const url = window.location.href;
const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);

if (repoMatch && !url.includes('/pull/') && !url.includes('/issues/')) {
  const owner = repoMatch[1];
  const repo = repoMatch[2];
  const repoUrl = `https://github.com/${owner}/${repo}`;
  
  browser.runtime.sendMessage({
    type: 'CURRENT_REPO_DETECTED',
    payload: { repoUrl, owner, repo }
  });
}