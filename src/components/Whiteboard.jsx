import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Text as KonvaText } from 'react-konva';

const STORAGE_KEY = 'syncspace_whiteboard_v1';
const TOOLS = ['pen', 'rect', 'text', 'eraser'];

function loadShapes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Whiteboard() {
  const [shapes, setShapes] = useState(loadShapes);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#1e1e2e');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  // Persist to localStorage whenever shapes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
  }, [shapes]);

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = useCallback((e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();

    if (tool === 'pen' || tool === 'eraser') {
      setShapes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'line',
          points: [pos.x, pos.y],
          color: tool === 'eraser' ? '#ffffff' : color,
          strokeWidth: tool === 'eraser' ? 20 : 3,
        },
      ]);
    } else if (tool === 'rect') {
      setShapes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'rect',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          color,
        },
      ]);
    } else if (tool === 'text') {
      const value = prompt('Text:');
      if (value) {
        setShapes((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: 'text',
            x: pos.x,
            y: pos.y,
            text: value,
            color,
          },
        ]);
      }
      isDrawing.current = false;
    }
  }, [tool, color]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    setShapes((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      const updated = { ...last };

      if (updated.type === 'line') {
        updated.points = updated.points.concat([point.x, point.y]);
      } else if (updated.type === 'rect') {
        updated.width = point.x - updated.x;
        updated.height = point.y - updated.y;
      }
      return [...prev.slice(0, -1), updated];
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const clearBoard = () => {
    if (confirm('Clear the whole whiteboard?')) {
      setShapes([]);
    }
  };

  return (
    <div className="pane whiteboard-pane">
      <div className="toolbar">
        <span className="pane-title">🖌 Whiteboard</span>
        <div className="tool-group">
          {TOOLS.map((t) => (
            <button
              key={t}
              className={tool === t ? 'active' : ''}
              onClick={() => setTool(t)}
              title={t}
            >
              {t === 'pen' && '✏️'}
              {t === 'rect' && '▭'}
              {t === 'text' && 'T'}
              {t === 'eraser' && '🧽'}
            </button>
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Color"
          />
          <button onClick={clearBoard} title="Clear">🗑</button>
        </div>
      </div>
      <div className="canvas-wrap" ref={containerRef}>
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ background: '#fff' }}
        >
          <Layer>
            {shapes.map((shape) => {
              if (shape.type === 'line') {
                return (
                  <Line
                    key={shape.id}
                    points={shape.points}
                    stroke={shape.color}
                    strokeWidth={shape.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                );
              }
              if (shape.type === 'rect') {
                return (
                  <Rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    stroke={shape.color}
                    strokeWidth={2}
                  />
                );
              }
              if (shape.type === 'text') {
                return (
                  <KonvaText
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    text={shape.text}
                    fill={shape.color}
                    fontSize={18}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}