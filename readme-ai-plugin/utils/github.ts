const GITHUB_API = 'https://api.github.com';

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface FileInfo {
  name: string;
  path: string;
  sha?: string;
  content?: string;
}

export async function getToken(): Promise<string | null> {
  const result = await browser.storage.local.get('github_token');
  return result.github_token || null;
}

export async function setToken(token: string): Promise<void> {
  await browser.storage.local.set({ github_token: token });
}

export async function getUser(token: string): Promise<{ login: string }> {
  const response = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!response.ok) throw new Error('Invalid token');
  return response.json();
}

export async function getRepos(token: string): Promise<{ name: string; owner: { login: string } }[]> {
  const response = await fetch(`${GITHUB_API}/user/repos?per_page=100&sort=updated`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch repos');
  const repos = await response.json();
  return repos.map((r: any) => ({ name: r.name, owner: { login: r.owner.login } }));
}

export async function getFile(token: string, owner: string, repo: string, path: string): Promise<FileInfo | null> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch file');
  const data = await response.json();
  return {
    name: data.name,
    path: data.path,
    sha: data.sha,
    content: atob(data.content),
  };
}

export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: btoa(content),
      sha,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update file');
  }
}