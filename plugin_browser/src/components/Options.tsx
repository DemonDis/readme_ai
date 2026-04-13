import React, { useState, useEffect } from 'react';
import './styles.css';

export default function Options() {
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    browser.storage.local.get('githubToken').then(result => {
      if (result.githubToken) {
        setToken(result.githubToken);
      }
    });
  }, []);

  const handleSave = async () => {
    await browser.storage.local.set({ githubToken: token });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="options">
      <h1>Readme AI - Настройки</h1>
      
      <div className="form-group">
        <label>GitHub Personal Access Token:</label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_..."
        />
        <p className="hint">Токен нужен scope `repo` для приватных репозиториев</p>
      </div>
      
      <button onClick={handleSave}>
        {saved ? 'Сохранено!' : 'Сохранить токен'}
      </button>
    </div>
  );
}