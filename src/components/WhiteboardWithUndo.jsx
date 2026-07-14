// components/WhiteboardWithUndo.jsx
import { useState } from 'react';

export default function WhiteboardWithUndo() {
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [shapes, setShapes] = useState([]);

  const addShape = (shape) => {
    const newShapes = [...shapes, shape];
    setShapes(newShapes);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
    console.log('Welcome to SyncSpace - Undo/Redo Feature');
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
      console.log('Undo - Welcome to SyncSpace');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
      console.log('Redo - Welcome to SyncSpace');
    }
  };

  return (
    <div>
      <h3>Undo/Redo Feature</h3>
      <button onClick={undo}>↩️ Undo (Ctrl+Z)</button>
      <button onClick={redo}>↪️ Redo (Ctrl+Y)</button>
      <p>Welcome to SyncSpace - Shapes: {shapes.length}</p>
    </div>
  );
}