import { defineBackground } from 'wxt/background';

export default defineBackground({
  main(ctx) {
    ctx.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'CLONE_REPO') {
        handleCloneRepo(message.payload).then(sendResponse);
        return true;
      }
      if (message.type === 'PUSH_CHANGES') {
        handlePushChanges(message.payload).then(sendResponse);
        return true;
      }
      if (message.type === 'GET_REPO_PATH') {
        getRepoPath(message.payload).then(sendResponse);
        return true;
      }
      return false;
    });
  },
});

interface ClonePayload {
  repoUrl: string;
  token: string;
}

interface PushPayload {
  repoUrl: string;
  token: string;
  message: string;
  files: { path: string; content: string }[];
}

async function handleCloneRepo({ repoUrl, token }: ClonePayload) {
  try {
    const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([^\.]+)/);
    if (!match) {
      return { success: false, error: 'Invalid GitHub URL' };
    }

    const [_match, owner, repo] = match;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/zipball`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `GitHub API error: ${errorText}` };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    const rootDir = zipEntries[0]?.entryName || '';
    const tempDir = `${await getTempDir()}/${repo}-${Date.now()}`;
    zip.extractAllTo(tempDir, true);

    const actualPath = tempDir;

    await browser.storage.local.set({
      currentRepo: { path: actualPath, owner, repo, url: repoUrl }
    });

    return { success: true, path: actualPath };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function getTempDir(): Promise<string> {
  const result = await browser.storage.local.get('tempDir');
  return result.tempDir || '/tmp/readme-ai';
}

async function handlePushChanges({ repoUrl, token, message, files }: PushPayload) {
  try {
    const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([^\.]+)/);
    if (!match) {
      return { success: false, error: 'Invalid GitHub URL' };
    }

    const [_match, owner, repo] = match;
    const branch = 'main';

    const getRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!getRefResponse.ok) {
      return { success: false, error: 'Failed to get branch info' };
    }

    const refData = await getRefResponse.json();
    const latestCommitSha = refData.object.sha;

    const updates: { path: string; mode: string; type: string; sha: string }[] = [];

    for (const file of files) {
      const content = btoa(unescape(encodeURIComponent(file.content)));
      
      const blobResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, encoding: 'base64' }),
        }
      );

      const blobData = await blobResponse.json();
      
      updates.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    const treeResponse2 = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_tree: latestCommitSha,
          tree: updates,
        }),
      }
    );

    const treeResult = await treeResponse2.json();

    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          tree: treeResult.sha,
          parents: [latestCommitSha],
        }),
      }
    );

    const commitData = await commitResponse.json();

    const updateRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sha: commitData.sha }),
      }
    );

    if (!updateRefResponse.ok) {
      return { success: false, error: 'Failed to update branch' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function getRepoPath({ repoUrl }: { repoUrl: string }) {
  const result = await browser.storage.local.get('currentRepo');
  if (result.currentRepo?.url === repoUrl) {
    return { path: result.currentRepo.path };
  }
  return { path: null };
}