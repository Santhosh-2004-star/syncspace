// components/FileTabs.jsx
import { useState } from 'react';

const INITIAL_FILES = [
  { id: 1, name: 'App.jsx', content: '// Welcome to SyncSpace\nconsole.log("Hello!");' },
  { id: 2, name: 'styles.css', content: '/* Welcome to SyncSpace */\nbody { margin: 0; }' },
  { id: 3, name: 'utils.js', content: '// Welcome to SyncSpace\nexport const greet = () => "Hello";' },
];

export default function FileTabs() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState(1);
  const [newFileName, setNewFileName] = useState('');

  const activeFile = files.find(f => f.id === activeFileId);

  const addFile = () => {
    if (!newFileName.trim()) return;
    const newFile = {
      id: Date.now(),
      name: newFileName,
      content: `// Welcome to SyncSpace\n// New file: ${newFileName}`
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName('');
    console.log('New file added - Welcome to SyncSpace');
  };

  const deleteFile = (id) => {
    if (files.length <= 1) return alert('Cannot delete last file');
    setFiles(files.filter(f => f.id !== id));
    if (activeFileId === id) setActiveFileId(files[0].id);
    console.log('File deleted - Welcome to SyncSpace');
  };

  return (
    <div>
      <h3>File Tabs</h3>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', borderBottom: '2px solid #ddd', paddingBottom: '8px' }}>
        {files.map(file => (
          <button
            key={file.id}
            onClick={() => setActiveFileId(file.id)}
            style={{
              padding: '6px 12px',
              background: activeFileId === file.id ? '#6c5ce7' : '#eee',
              color: activeFileId === file.id ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📄 {file.name}
            <span onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} style={{ cursor: 'pointer' }}>✕</span>
          </button>
        ))}
        <input
          type="text"
          placeholder="new file.js"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          style={{ padding: '4px 8px', width: '100px' }}
        />
        <button onClick={addFile}>➕</button>
      </div>
      <div style={{ padding: '12px', background: '#f9f9f9', marginTop: '8px', borderRadius: '4px', minHeight: '60px' }}>
        <strong>{activeFile?.name}</strong>
        <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>{activeFile?.content}</pre>
      </div>
      <p>Welcome to SyncSpace - {files.length} files open</p>
    </div>
  );
}