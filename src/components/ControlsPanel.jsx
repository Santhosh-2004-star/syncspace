// components/ControlsPanel.jsx
import { useState } from 'react';

export default function ControlsPanel() {
  const [penWidth, setPenWidth] = useState(3);
  const [fontSize, setFontSize] = useState(18);
  const [borderWidth, setBorderWidth] = useState(2);

  return (
    <div>
      <h3>Drawing Controls</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label>✏️ Pen Width: {penWidth}px</label>
          <input
            type="range"
            min="1"
            max="20"
            value={penWidth}
            onChange={(e) => {
              setPenWidth(Number(e.target.value));
              console.log(`Pen width: ${e.target.value} - Welcome to SyncSpace`);
            }}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>🔤 Font Size: {fontSize}px</label>
          <input
            type="range"
            min="10"
            max="48"
            value={fontSize}
            onChange={(e) => {
              setFontSize(Number(e.target.value));
              console.log(`Font size: ${e.target.value} - Welcome to SyncSpace`);
            }}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>▭ Border Width: {borderWidth}px</label>
          <input
            type="range"
            min="1"
            max="10"
            value={borderWidth}
            onChange={(e) => {
              setBorderWidth(Number(e.target.value));
              console.log(`Border width: ${e.target.value} - Welcome to SyncSpace`);
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <p style={{ marginTop: '10px' }}>Welcome to SyncSpace - Controls active</p>
    </div>
  );
}