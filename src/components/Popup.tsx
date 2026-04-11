import React, { useState } from 'react';
import './styles.css';

export default function Popup() {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');

  const handleClone = async () => {
    if (!repoUrl || !token) {
      setStatus('Введите URL репозитория и токен');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus('Клонирование репозитория...');
    setStatusType('info');

    try {
      const response = await browser.runtime.sendMessage({
        type: 'CLONE_REPO',
        payload: { repoUrl, token }
      });
      
      if (response.success) {
        setStatus(`Клонировано: ${response.path}`);
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

  const handlePush = async () => {
    if (!repoUrl || !token) {
      setStatus('Введите URL репозитория и токен');
      setStatusType('error');
      return;
    }

    const message = prompt('Введите сообщение коммита:');
    if (!message) return;

    setLoading(true);
    setStatus('Пушинг изменений...');
    setStatusType('info');

    try {
      const response = await browser.runtime.sendMessage({
        type: 'PUSH_CHANGES',
        payload: { repoUrl, token, message, files: [] }
      });
      
      if (response.success) {
        setStatus('Изменения успешно запушены!');
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
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_..."
        />
      </div>
      
      <button onClick={handleClone} disabled={loading}>
        {loading ? 'Загрузка...' : 'Clone Repository'}
      </button>
      
      <button onClick={handlePush} disabled={loading} className="push-btn">
        Push Changes
      </button>
      
      <p className={`status ${statusType}`}>{status}</p>
    </div>
  );
}