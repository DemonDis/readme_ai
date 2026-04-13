import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

export default function Popup() {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [files, setFiles] = useState<{path: string; content: string}[]>([]);
  const [clonedPath, setClonedPath] = useState('');

  useEffect(() => {
    async function detectRepo() {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        
        if (currentTab?.url?.includes('github.com')) {
          const url = currentTab.url;
          const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          
          if (match && !url.includes('/pull/') && !url.includes('/issues/')) {
            const owner = match[1];
            const repo = match[2];
            setRepoUrl(`https://github.com/${owner}/${repo}`);
          }
        }
      } catch (e) {
        console.log('Error detecting repo:', e);
      }

      const result = await browser.storage.local.get(['currentOpenRepo', 'githubToken', 'lastCloned']);
      if (result.currentOpenRepo?.url) {
        setRepoUrl(result.currentOpenRepo.url);
      }
      if (result.githubToken) {
        setToken(result.githubToken);
      }
      if (result.lastCloned) {
        setClonedPath(result.lastCloned);
      }
    }
    
    detectRepo();
  }, []);

  const handleClone = async () => {
    if (!repoUrl || !token) {
      setStatus('Введите URL репозитория и токен');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus('Скачивание репозитория...');
    setStatusType('info');

    try {
      const response = await browser.runtime.sendMessage({
        type: 'CLONE_REPO',
        payload: { repoUrl, token }
      });
      
      if (response.success) {
        setClonedPath(response.path);
        await browser.storage.local.set({ lastCloned: response.path });
        setStatus(`Скачано в: Downloads/${response.path}.zip\nРаспаковать и редактировать`);
        setStatusType('success');
      } else {
        setStatus(`Ошибка: ${response.error}`);
        setStatusType('error');
      }
    } catch (error) {
      setStatus(`Ошибка: ${error}`);
      setStatusType('error');
    }
    
    setLoading(false);
  };

  const [gitCloneCommand, setGitCloneCommand] = useState('');

  const handleGitClone = async () => {
    if (!repoUrl || !token) {
      setStatus('Введите URL репозитория и токен');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus('Создание команды git clone...');
    setStatusType('info');

    try {
      const response = await browser.runtime.sendMessage({
        type: 'GIT_CLONE',
        payload: { repoUrl, token }
      });
      
      if (response.success) {
        setGitCloneCommand(response.command);
        setStatus(response.message || 'Скопируйте команду ниже');
        setStatusType('success');
      } else {
        setStatus(`Ошибка: ${response.error}`);
        setStatusType('error');
      }
    } catch (error) {
      setStatus(`Ошибка: ${error}`);
      setStatusType('error');
    }
    
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const content = await file.text();
      newFiles.push({ path: file.name, content });
    }

    setFiles([...files, ...newFiles]);
    setStatus(`Выбрано файлов: ${newFiles.length}`);
    setStatusType('info');
  };

  const handlePush = async () => {
    if (!repoUrl || !token) {
      setStatus('Введите URL репозитория и токен');
      setStatusType('error');
      return;
    }

    if (files.length === 0) {
      setStatus('Выберите файлы для загрузки');
      setStatusType('error');
      return;
    }

    const message = prompt('Введите сообщение коммита:', 'Update files');
    if (!message) return;

    setLoading(true);
    setStatus('Загрузка файлов...');
    setStatusType('info');

    try {
      const response = await browser.runtime.sendMessage({
        type: 'PUSH_CHANGES',
        payload: { repoUrl, token, message, files }
      });
      
      if (response.success) {
        setStatus('Загружено!');
        setStatusType('success');
        setFiles([]);
      } else {
        setStatus(`Ошибка: ${response.error}`);
        setStatusType('error');
      }
    } catch (error) {
      setStatus(`Ошибка: ${error}`);
      setStatusType('error');
    }
    
    setLoading(false);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="popup">
      <h2>Readme AI</h2>
      
      <div className="form-group">
        <label>URL репозитория:</label>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/user/repo"
        />
      </div>
      
      <div className="form-group">
        <label>GitHub Token:</label>
        <input
          type="password"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            browser.storage.local.set({ githubToken: e.target.value });
          }}
          placeholder="ghp_..."
        />
      </div>

      <div className="buttons-row">
        <button onClick={handleClone} disabled={loading}>
          {loading ? 'Загрузка...' : 'Скачать ZIP'}
        </button>
        <button onClick={handleGitClone} disabled={loading || !repoUrl || !token} className="git-btn">
          Git Clone
        </button>
      </div>

      {gitCloneCommand && (
        <div className="git-command-box">
          <label>Команда для терминала:</label>
          <code>{gitCloneCommand}</code>
        </div>
      )}

      <div className="divider"></div>

      <div className="form-group">
        <label>Выбрать измененные файлы:</label>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input"
        />
      </div>

      {files.length > 0 && (
        <div className="files-list">
          <label>Файлы ({files.length}):</label>
          {files.map((f, i) => (
            <div key={i} className="file-item">
              <span>{f.path}</span>
              <button onClick={() => removeFile(i)} className="remove-btn">×</button>
            </div>
          ))}
        </div>
      )}

      <button onClick={handlePush} disabled={loading || files.length === 0} className="push-btn">
        {loading ? 'Загрузка...' : 'Загрузить на GitHub'}
      </button>

      <button 
        onClick={() => window.open(browser.runtime.getURL('popup.html'), '_blank')} 
        className="open-tab-btn"
      >
        Открыть в новой вкладке
      </button>
      
      <p className={`status ${statusType}`}>{status}</p>
    </div>
  );
}