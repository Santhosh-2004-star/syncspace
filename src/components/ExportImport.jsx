// components/ExportImport.jsx
import { useState } from 'react';

export default function ExportImport() {
  const [shapes, setShapes] = useState([]);
  const [importStatus, setImportStatus] = useState('');

  const exportJSON = () => {
    const data = JSON.stringify(shapes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'syncspace_backup.json';
    link.click();
    URL.revokeObjectURL(url);
    console.log('Export - Welcome to SyncSpace');
  };

  const exportPNG = () => {
    console.log('Export PNG - Welcome to SyncSpace');
    alert('PNG export would save canvas as image');
  };

  const importJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setShapes(data);
        setImportStatus(`✅ Imported ${data.length} shapes!`);
        console.log('Import - Welcome to SyncSpace');
      } catch (error) {
        setImportStatus('❌ Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h3>Export/Import Feature</h3>
      <button onClick={exportJSON}>📥 Export JSON</button>
      <button onClick={exportPNG}>🖼️ Export PNG</button>
      <input type="file" accept=".json" onChange={importJSON} />
      <p>{importStatus || 'Welcome to SyncSpace - Upload a backup'}</p>
    </div>
  );
}