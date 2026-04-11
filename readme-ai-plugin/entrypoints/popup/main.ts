import './styles.css';
import { renderMarkdown } from '../../utils/markdown.ts';
import {
  getToken,
  setToken,
  getUser,
  getRepos,
  getFile,
  createOrUpdateFile,
  type GitHubRepo,
} from '../../utils/github.ts';

let selectedRepo: GitHubRepo | null = null;
let currentSha: string | undefined;

async function init() {
  const token = await getToken();
  if (!token) {
    showSettings();
    return;
  }

  try {
    const user = await getUser(token);
    document.getElementById('user-login')!.textContent = user.login;
    showApp();
    loadRepos(token);
  } catch {
    showSettings();
  }
}

function showSettings() {
  document.getElementById('settings-view')!.classList.remove('hidden');
  document.getElementById('app-view')!.classList.add('hidden');
}

function showApp() {
  document.getElementById('settings-view')!.classList.add('hidden');
  document.getElementById('app-view')!.classList.remove('hidden');
}

async function loadRepos(token: string) {
  const select = document.getElementById('repo-select') as HTMLSelectElement;
  select.innerHTML = '<option value="">Loading...</option>';

  try {
    const repos = await getRepos(token);
    select.innerHTML = '<option value="">Select repository</option>' +
      repos.map(r => `<option value="${r.owner.login}/${r.name}">${r.owner.login}/${r.name}</option>`).join('');
  } catch (e) {
    select.innerHTML = '<option value="">Failed to load repos</option>';
  }
}

async function loadReadme() {
  const repo = (document.getElementById('repo-select') as HTMLSelectElement).value;
  if (!repo) return;

  const [owner, name] = repo.split('/');
  selectedRepo = { owner, repo: name };

  const token = await getToken();
  if (!token) return;

  const file = await getFile(token, owner, name, 'README.md');
  const editor = document.getElementById('markdown-editor') as HTMLTextAreaElement;
  
  if (file) {
    currentSha = file.sha;
    editor.value = file.content || '';
  } else {
    currentSha = undefined;
    editor.value = '# Project Name\n\nAdd your description here.\n';
  }

  updatePreview();
}

function updatePreview() {
  const markdown = (document.getElementById('markdown-editor') as HTMLTextAreaElement).value;
  const preview = document.getElementById('preview')!;
  preview.innerHTML = renderMarkdown(markdown);
}

async function publish() {
  if (!selectedRepo) {
    alert('Please select a repository');
    return;
  }

  const token = await getToken();
  if (!token) {
    alert('Please set your GitHub token');
    return;
  }

  const content = (document.getElementById('markdown-editor') as HTMLTextAreaElement).value;
  const publishBtn = document.getElementById('publish-btn') as HTMLButtonElement;
  publishBtn.disabled = true;
  publishBtn.textContent = 'Publishing...';

  try {
    await createOrUpdateFile(
      token,
      selectedRepo.owner,
      selectedRepo.repo,
      'README.md',
      content,
      'Update README.md',
      currentSha
    );
    alert('Published successfully!');
    loadReadme();
  } catch (e) {
    alert((e as Error).message);
  } finally {
    publishBtn.disabled = false;
    publishBtn.textContent = 'Publish to GitHub';
  }
}

document.getElementById('save-token')!.addEventListener('click', async () => {
  const tokenInput = document.getElementById('token-input') as HTMLInputElement;
  const token = tokenInput.value.trim();
  if (!token) return;

  try {
    const user = await getUser(token);
    await setToken(token);
    document.getElementById('user-login')!.textContent = user.login;
    showApp();
    loadRepos(token);
  } catch {
    alert('Invalid token');
  }
});

document.getElementById('logout')!.addEventListener('click', async () => {
  await browser.storage.local.remove('github_token');
  showSettings();
});

document.getElementById('repo-select')!.addEventListener('change', loadReadme);
document.getElementById('markdown-editor')!.addEventListener('input', updatePreview);
document.getElementById('publish-btn')!.addEventListener('click', publish);

document.addEventListener('DOMContentLoaded', init);