browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLONE_REPO') {
    handleCloneRepo(message.payload).then(sendResponse);
    return true;
  }
  if (message.type === 'GIT_CLONE') {
    handleGitClone(message.payload).then(sendResponse);
    return true;
  }
  if (message.type === 'PUSH_CHANGES') {
    handlePushChanges(message.payload).then(sendResponse);
    return true;
  }
  if (message.type === 'GET_CLONED_PATH') {
    getClonedPath().then(sendResponse);
    return true;
  }
  return false;
});

let clonedRepos = {};

async function handleCloneRepo({ repoUrl, token }) {
  try {
    const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([^\.]+)/);
    if (!match) {
      return { success: false, error: 'Invalid GitHub URL' };
    }

    const [, owner, repo] = match;
    const folderName = `${owner}-${repo}`;

    const downloads = await browser.downloads.download({
      url: `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`,
      filename: `${folderName}.zip`,
      conflictAction: 'overwrite'
    });

    const id = Date.now();
    clonedRepos[id] = { owner, repo, folderName, url: repoUrl };

    return { 
      success: true, 
      path: folderName,
      id: id,
      downloadId: downloads
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function handleGitClone({ repoUrl, token }) {
  try {
    const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([^\.]+)/);
    if (!match) {
      return { success: false, error: 'Invalid GitHub URL' };
    }

    if (!token) {
      return { success: false, error: 'GitHub token required for git clone' };
    }

    const [, owner, repo] = match;
    const folderName = `${owner}-${repo}`;
    const cloneUrl = `https://${token}@github.com/${owner}/${repo}.git`;
    const targetDir = '~/Projects';
    const command = `git clone ${cloneUrl} ${targetDir}/${folderName}`;

    console.log('Git clone with PAT:', cloneUrl.replace(token, '<TOKEN>'));

    return { 
      success: true, 
      command: command,
      cloneUrl: cloneUrl,
      folderName: folderName,
      message: 'Скопируйте команду ниже и выполните в терминале'
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function handlePushChanges({ repoUrl, token, message, files }) {
  try {
    const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([^\.]+)/);
    if (!match) {
      return { success: false, error: 'Invalid GitHub URL' };
    }

    const [, owner, repo] = match;
    const branch = 'main';

    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!refResponse.ok) {
      return { success: false, error: 'Failed to get branch info' };
    }

    const refData = await refResponse.json();
    const commitSha = refData.object.sha;

    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const treeData = await treeResponse.json();
    const existingFiles = {};
    
    if (treeData.tree) {
      for (const item of treeData.tree) {
        if (item.type === 'blob') {
          existingFiles[item.path] = item.sha;
        }
      }
    }

    const newBlobs = [];
    const updates = [];

    for (const file of files) {
      let sha = existingFiles[file.path];
      
      if (!sha) {
        const blobResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
          {
            method: 'POST',
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              content: btoa(unescape(encodeURIComponent(file.content))), 
              encoding: 'base64' 
            }),
          }
        );
        
        const blobData = await blobResponse.json();
        sha = blobData.sha;
      } else {
        const content = btoa(unescape(encodeURIComponent(file.content)));
        sha = existingFiles[file.path];
      }
      
      updates.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: sha
      });
    }

    if (updates.length === 0) {
      return { success: false, error: 'No files to commit' };
    }

    const newTreeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_tree: commitSha,
          tree: updates,
        }),
      }
    );

    const newTree = await newTreeResponse.json();

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
          message: message,
          tree: newTree.sha,
          parents: [commitSha],
        }),
      }
    );

    const commitData = await commitResponse.json();

    await fetch(
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

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function getClonedPath() {
  return { paths: clonedRepos };
}