// components/ZoomPanControls.jsx
import { useState, useRef } from 'react';

export default function ZoomPanControls() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const zoomIn = () => {
    setScale(Math.min(scale + 0.1, 3));
    console.log(`Zoom in: ${scale} - Welcome to SyncSpace`);
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.3));
    console.log(`Zoom out: ${scale} - Welcome to SyncSpace`);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    console.log('Zoom reset - Welcome to SyncSpace');
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    console.log('Pan - Welcome to SyncSpace');
  };

  return (
    <div>
      <h3>Zoom/Pan Controls</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={zoomIn}>🔍 Zoom In (+)</button>
        <button onClick={zoomOut}>🔍 Zoom Out (-)</button>
        <button onClick={resetZoom}>⟲ Reset</button>
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>Scale:</strong> {(scale * 100).toFixed(0)}%
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>Position:</strong> X: {position.x.toFixed(0)}, Y: {position.y.toFixed(0)}
      </div>
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '120px',
          background: '#f0f0f0',
          border: '2px dashed #999',
          borderRadius: '8px',
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'all 0.3s ease',
          background: '#10b981',
          color: '#fff',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Welcome to SyncSpace
        </div>
      </div>
      <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        Drag the box to pan • Scroll to zoom (demo)
      </p>
    </div>
  );
}