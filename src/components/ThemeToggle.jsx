// components/ThemeToggle.jsx
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('syncspace_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('syncspace_theme', theme);
    document.body.style.backgroundColor = theme === 'dark' ? '#1e1e2e' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#cdd6f4' : '#1e1e2e';
    console.log(`Theme changed to ${theme} - Welcome to SyncSpace`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#2a2a3e' : '#f4f4f6',
      borderRadius: '8px',
      transition: 'all 0.3s'
    }}>
      <h3>Theme Toggle</h3>
      <button onClick={toggleTheme} style={{ fontSize: '24px', padding: '10px 20px' }}>
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
      <p style={{ marginTop: '10px' }}>
        Current: <strong>{theme}</strong> mode
      </p>
      <p>Monaco Theme: <strong>{editorTheme}</strong></p>
      <p>Welcome to SyncSpace - Theme switcher</p>
    </div>
  );
}