// components/AutoSaveStatus.jsx
import { useState, useRef } from 'react';

export default function AutoSaveStatus() {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('💾 Saved');
  const [lastSaved, setLastSaved] = useState(new Date());
  const saveTimeout = useRef(null);

  const handleChange = (value) => {
    setContent(value);
    setSaveStatus('⏳ Saving...');
    console.log('Typing - Welcome to SyncSpace');

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem('autosave_demo', value);
      setLastSaved(new Date());
      setSaveStatus('✅ Saved');
      console.log('Auto-saved - Welcome to SyncSpace');
    }, 500);
  };

  return (
    <div>
      <h3>Auto-Save Status</h3>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '20px' }}>{saveStatus}</span>
        <span style={{ fontSize: '12px', color: '#666' }}>
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      </div>
      <textarea
        placeholder="Type something... Welcome to SyncSpace"
        onChange={(e) => handleChange(e.target.value)}
        value={content}
        rows={3}
        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
      />
      <p>Welcome to SyncSpace - Auto-save demo</p>
    </div>
  );
}