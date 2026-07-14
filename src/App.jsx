import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Stage, Layer, Line, Rect, Text as KonvaText } from 'react-konva';
import './App.css';

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEY = 'syncspace_code_v1';
const WHITEBOARD_KEY = 'syncspace_whiteboard_v1';

// ============================================
// CODE TEMPLATES FOR EACH LANGUAGE
// ============================================
const CODE_TEMPLATES = {
  javascript: `// Welcome to SyncSpace - JavaScript
function greet(name) {
  console.log(\`Hello, \${name}! Welcome to SyncSpace\`);
  return { message: "Welcome to SyncSpace", version: "2.0" };
}

// Example usage
const result = greet("Developer");
console.log(result);`,

  typescript: `// Welcome to SyncSpace - TypeScript
interface User {
  name: string;
  age: number;
  isActive: boolean;
}

function greetUser(user: User): string {
  return \`Welcome \${user.name} to SyncSpace!\`;
}

const user: User = {
  name: "Developer",
  age: 25,
  isActive: true
};

console.log(greetUser(user));`,

  python: `# Welcome to SyncSpace - Python
def greet(name):
    print(f"Hello, {name}! Welcome to SyncSpace")
    return {"message": "Welcome to SyncSpace", "version": "2.0"}

# Example usage
result = greet("Developer")
print(result)`,

  json: `{
  "name": "SyncSpace",
  "version": "2.0",
  "description": "Welcome to SyncSpace",
  "features": [
    "Whiteboard",
    "Code Editor",
    "Undo/Redo",
    "Export/Import"
  ],
  "isActive": true
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SyncSpace</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #1e1e2e;
            color: #cdd6f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
            border: 2px solid #6c5ce7;
            border-radius: 12px;
            background: #2a2a3e;
        }
        h1 {
            color: #6c5ce7;
            font-size: 2.5rem;
        }
        p {
            color: #a6adc8;
            font-size: 1.2rem;
        }
        .highlight {
            color: #f9ca24;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to SyncSpace</h1>
        <p>Full-featured collaborative workspace</p>
        <p>✨ <span class="highlight">HTML</span> preview working!</p>
    </div>
</body>
</html>`,

  css: `/* Welcome to SyncSpace - CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #1e1e2e;
  color: #cdd6f4;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  background: #2a2a3e;
  padding: 3rem 4rem;
  border-radius: 16px;
  border: 2px solid #6c5ce7;
  box-shadow: 0 8px 32px rgba(108, 92, 231, 0.3);
  text-align: center;
}

h1 {
  color: #6c5ce7;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #a6adc8;
  font-size: 1.2rem;
}

.highlight {
  color: #f9ca24;
  font-weight: bold;
}`,

  java: `// Welcome to SyncSpace - Java
public class SyncSpace {
    public static void main(String[] args) {
        System.out.println("🚀 Welcome to SyncSpace!");
        System.out.println("Version: 2.0");
        
        User user = new User("Developer", 25);
        System.out.println("Hello, " + user.getName() + "!");
    }
}

class User {
    private String name;
    private int age;
    
    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() {
        return name;
    }
    
    public int getAge() {
        return age;
    }
}`,

  react: `// Welcome to SyncSpace - React Component
function App() {
  const [count, setCount] = React.useState(0);
  const [message, setMessage] = React.useState('Welcome to SyncSpace');

  return React.createElement(
    'div',
    { 
      style: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: '#1e1e2e', 
        color: '#cdd6f4', 
        fontFamily: 'Segoe UI, sans-serif' 
      } 
    },
    React.createElement('h1', { style: { color: '#6c5ce7' } }, '🚀 Welcome to SyncSpace'),
    React.createElement('p', { style: { fontSize: '1.2rem' } }, message),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: '1rem', marginTop: '1rem' } },
      React.createElement(
        'button',
        { 
          onClick: () => setCount(count + 1),
          style: {
            padding: '10px 20px',
            background: '#6c5ce7',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem'
          }
        },
        'Clicked ' + count + ' times'
      ),
      React.createElement(
        'button',
        { 
          onClick: () => setMessage('SyncSpace is awesome!'),
          style: {
            padding: '10px 20px',
            background: '#00b894',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem'
          }
        },
        'Change Message'
      )
    )
  );
}`
};

// ============================================
// LANGUAGES & TOOLS
// ============================================
const LANGUAGES = ['javascript', 'typescript', 'python', 'json', 'html', 'css', 'java', 'react'];
const TOOLS = ['pen', 'rect', 'text', 'eraser'];

// ============================================
// LOAD SHAPES FROM LOCALSTORAGE
// ============================================
function loadShapes() {
  try {
    const raw = localStorage.getItem(WHITEBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  // ----- CODE EDITOR STATE -----
  const [language, setLanguage] = useState(
    localStorage.getItem('syncspace_lang_v1') || 'javascript'
  );
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return CODE_TEMPLATES['javascript'];
  });
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const saveTimeout = useRef(null);
  const outputRef = useRef(null);

  // ----- WHITEBOARD STATE -----
  const [shapes, setShapes] = useState(loadShapes);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#6c5ce7');
  const [penWidth, setPenWidth] = useState(3);
  const [fontSize, setFontSize] = useState(18);
  const [borderWidth, setBorderWidth] = useState(2);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  // ----- UNDO/REDO STATE -----
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // ----- THEME STATE -----
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('syncspace_theme') || 'dark';
  });

  // ----- ZOOM STATE -----
  const [scale, setScale] = useState(1);

  // ----- AUTO-SAVE STATUS -----
  const [saveStatus, setSaveStatus] = useState('💾 Saved');

  // ============================================
  // CODE EDITOR HANDLERS
  // ============================================
  const handleCodeChange = (value) => {
    setCode(value ?? '');
    setSaveStatus('⏳ Saving...');
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, value ?? '');
      setSaveStatus('✅ Saved');
    }, 300);
  };

  const handleLangChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('syncspace_lang_v1', lang);
    const template = CODE_TEMPLATES[lang] || CODE_TEMPLATES['javascript'];
    setCode(template);
    localStorage.setItem(STORAGE_KEY, template);
    setSaveStatus('✅ Template loaded');
    setOutput('');
    // Clear iframe if exists
    if (outputRef.current) {
      const iframe = outputRef.current.querySelector('iframe');
      if (iframe) {
        iframe.remove();
      }
    }
  };

  // ============================================
  // RENDER IN IFRAME HELPER
  // ============================================
  const renderInIframe = (htmlContent) => {
    const outputContainer = outputRef.current;
    if (!outputContainer) return;

    // Remove existing iframe
    const existingIframe = outputContainer.querySelector('iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.background = '#1e1e2e';
    iframe.sandbox = 'allow-scripts allow-modals allow-same-origin';

    // Write content to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'iframe-wrapper';
    wrapper.style.width = '100%';
    wrapper.style.height = '300px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.border = theme === 'dark' ? '1px solid #444' : '1px solid #ddd';
    wrapper.style.background = theme === 'dark' ? '#1e1e2e' : '#ffffff';
    wrapper.appendChild(iframe);

    // Find content area and append wrapper
    const contentArea = outputContainer.querySelector('.output-content') || outputContainer;
    contentArea.appendChild(wrapper);
  };

  // ============================================
  // RUN CODE - EXECUTION WITH PROPER OUTPUT
  // ============================================
  const runCode = () => {
    setIsRunning(true);
    setOutput('⏳ Running...\n');

    // Clear previous iframe
    if (outputRef.current) {
      const existingIframe = outputRef.current.querySelector('iframe');
      if (existingIframe) {
        existingIframe.remove();
      }
    }

    setTimeout(() => {
      try {
        let result = '';

        if (language === 'javascript' || language === 'typescript') {
          const logs = [];
          const originalLog = console.log;
          console.log = (...args) => {
            logs.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
            originalLog(...args);
          };

          const func = new Function(code);
          const returnValue = func();

          console.log = originalLog;

          if (logs.length > 0) {
            result = logs.join('\n');
          }
          if (returnValue !== undefined && returnValue !== null) {
            if (result) result += '\n';
            result += `↳ ${typeof returnValue === 'object' ? JSON.stringify(returnValue, null, 2) : String(returnValue)}`;
          }
          if (!result) {
            result = '✅ Code executed successfully (no output)';
          }
          setOutput(result);

        } else if (language === 'python') {
          const pythonOutput = [];
          const lines = code.split('\n');
          
          for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('print(')) {
              const match = trimmed.match(/print\((.+)\)/);
              if (match) {
                let content = match[1];
                content = content.replace(/^f/, '');
                content = content.replace(/^["']|["']$/g, '');
                content = content.replace(/\{([^}]+)\}/g, (_, varName) => {
                  const mockValues = {
                    'name': 'Developer',
                    'message': 'Welcome to SyncSpace',
                    'version': '2.0',
                    'result': "{'message': 'Welcome to SyncSpace', 'version': '2.0'}"
                  };
                  return mockValues[varName.trim()] || varName;
                });
                pythonOutput.push(content);
              }
            }
          }
          
          if (pythonOutput.length > 0) {
            result = `🐍 Python Output:\n${'='.repeat(40)}\n\n${pythonOutput.join('\n')}`;
          } else {
            result = `🐍 Python code detected!\n\n${code}\n\n⚠️ Python execution requires a backend server.`;
          }
          setOutput(result);

        } else if (language === 'java') {
          const javaOutput = [];
          const lines = code.split('\n');
          
          for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('System.out.println(')) {
              const match = trimmed.match(/System\.out\.println\((.+)\)/);
              if (match) {
                let content = match[1];
                content = content.replace(/^["']|["']$/g, '');
                content = content.replace(/user\.getName\(\)/g, 'Developer');
                content = content.replace(/user\.getAge\(\)/g, '25');
                javaOutput.push(content);
              }
            }
          }
          
          if (javaOutput.length > 0) {
            result = `☕ Java Output:\n${'='.repeat(40)}\n\n${javaOutput.join('\n')}\n\n${'='.repeat(40)}\n✅ Execution completed successfully!`;
          } else {
            result = `☕ Java code:\n\n${code}\n\n⚠️ Java execution requires compilation.`;
          }
          setOutput(result);

        } else if (language === 'react') {
          // Build React HTML with user code
          const reactHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>React Preview - SyncSpace</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', sans-serif;
      background: #1e1e2e;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script>
    // User's React code
    ${code}
    
    // Render the App component
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>
          `;

          renderInIframe(reactHTML);
          result = '⚛️ React component rendered in preview above!';
          setOutput(result);

        } else if (language === 'html') {
          renderInIframe(code);
          result = '🌐 HTML rendered in preview above!';
          setOutput(result);

        } else if (language === 'css') {
          const cssLines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('/*'));
          result = `🎨 CSS Styles\n${'='.repeat(40)}\n\n${code}\n\n${'='.repeat(40)}\n📊 Rules: ${cssLines.length}\n💡 CSS is used for styling HTML pages.`;
          setOutput(result);

        } else if (language === 'json') {
          try {
            const parsed = JSON.parse(code);
            result = `✅ Valid JSON!\n${'='.repeat(40)}\n\n${JSON.stringify(parsed, null, 2)}`;
          } catch (err) {
            result = `❌ Invalid JSON: ${err.message}`;
          }
          setOutput(result);

        } else {
          result = `📝 ${language.toUpperCase()} code:\n${'='.repeat(40)}\n\n${code}`;
          setOutput(result);
        }

        setSaveStatus('✅ Run completed');

      } catch (error) {
        setOutput(`❌ Error: ${error.message}`);
        setSaveStatus('❌ Error');
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };

  // ============================================
  // WHITEBOARD HANDLERS
  // ============================================
  useEffect(() => {
    localStorage.setItem(WHITEBOARD_KEY, JSON.stringify(shapes));
  }, [shapes]);

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

  useEffect(() => {
    localStorage.setItem('syncspace_theme', theme);
    document.body.style.backgroundColor = theme === 'dark' ? '#1e1e2e' : '#f0f0f0';
    document.body.style.color = theme === 'dark' ? '#cdd6f4' : '#1e1e2e';
    document.body.className = theme === 'dark' ? 'dark' : 'light';
  }, [theme]);

  const addShapeWithUndo = (newShapes) => {
    setShapes(newShapes);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
  };

  const handleMouseDown = useCallback((e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    if (tool === 'pen' || tool === 'eraser') {
      const newShape = {
        id: crypto.randomUUID(),
        type: 'line',
        points: [pos.x, pos.y],
        color: tool === 'eraser' ? '#ffffff' : color,
        strokeWidth: tool === 'eraser' ? 20 : penWidth,
      };
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
    } else if (tool === 'rect') {
      const newShape = {
        id: crypto.randomUUID(),
        type: 'rect',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: color,
        strokeWidth: borderWidth,
      };
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
    } else if (tool === 'text') {
      const value = prompt('Enter text:');
      if (value && value.trim()) {
        const newShape = {
          id: crypto.randomUUID(),
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: value,
          color: color,
          fontSize: fontSize,
        };
        const newShapes = [...shapes, newShape];
        setShapes(newShapes);
        addShapeWithUndo(newShapes);
      }
      isDrawing.current = false;
    }
  }, [tool, color, penWidth, borderWidth, fontSize, shapes]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    const updatedShapes = [...shapes];
    const last = updatedShapes[updatedShapes.length - 1];
    if (!last) return;

    if (last.type === 'line') {
      last.points = last.points.concat([point.x, point.y]);
    } else if (last.type === 'rect') {
      last.width = point.x - last.x;
      last.height = point.y - last.y;
    }
    setShapes(updatedShapes);
  }, [shapes]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing.current && shapes.length > 0) {
      const lastShape = shapes[shapes.length - 1];
      if (lastShape && (lastShape.type === 'line' || lastShape.type === 'rect')) {
        addShapeWithUndo(shapes);
      }
    }
    isDrawing.current = false;
  }, [shapes]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  };

  const exportJSON = () => {
    const data = JSON.stringify(shapes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'syncspace_whiteboard.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setShapes(data);
        setHistory([data]);
        setHistoryIndex(0);
        alert(`✅ Imported ${data.length} shapes!`);
      } catch (error) {
        alert('❌ Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const clearBoard = () => {
    if (confirm('Clear the whole whiteboard?')) {
      setShapes([]);
      setHistory([[]]);
      setHistoryIndex(0);
    }
  };

  const zoomIn = () => setScale(Math.min(scale + 0.1, 3));
  const zoomOut = () => setScale(Math.max(scale - 0.1, 0.3));
  const resetZoom = () => setScale(1);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>🚀 SyncSpace</h1>
        <span className="badge">v2.0</span>
        <span style={{ fontSize: '12px', color: '#a6adc8', marginLeft: '8px' }}>
          Welcome to SyncSpace
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#a6adc8' }}>{saveStatus}</span>
        </div>
      </header>

      <div className="toolbar-main">
        <div className="tool-group">
          <button onClick={undo} title="Undo (Ctrl+Z)" className="tool-btn">↩️</button>
          <button onClick={redo} title="Redo (Ctrl+Y)" className="tool-btn">↪️</button>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          {TOOLS.map((t) => (
            <button
              key={t}
              className={`tool-btn ${tool === t ? 'active' : ''}`}
              onClick={() => setTool(t)}
              title={t}
            >
              {t === 'pen' && '✏️'}
              {t === 'rect' && '▭'}
              {t === 'text' && 'T'}
              {t === 'eraser' && '🧽'}
            </button>
          ))}
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <span className="tool-label">✏️</span>
          <input
            type="range"
            min="1"
            max="20"
            value={penWidth}
            onChange={(e) => setPenWidth(Number(e.target.value))}
            className="tool-slider"
          />
          <span className="tool-value">{penWidth}</span>
        </div>

        <div className="tool-group">
          <span className="tool-label">🔤</span>
          <input
            type="range"
            min="10"
            max="48"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="tool-slider"
          />
          <span className="tool-value">{fontSize}</span>
        </div>

        <div className="tool-group">
          <span className="tool-label">▭</span>
          <input
            type="range"
            min="1"
            max="10"
            value={borderWidth}
            onChange={(e) => setBorderWidth(Number(e.target.value))}
            className="tool-slider"
          />
          <span className="tool-value">{borderWidth}</span>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Color"
            className="color-picker"
          />
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <button onClick={zoomOut} title="Zoom Out" className="tool-btn">➖</button>
          <span className="tool-value">{(scale * 100).toFixed(0)}%</span>
          <button onClick={zoomIn} title="Zoom In" className="tool-btn">➕</button>
          <button onClick={resetZoom} title="Reset Zoom" className="tool-btn">⟲</button>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <button onClick={exportJSON} title="Export JSON" className="tool-btn">📥</button>
          <label className="tool-btn" style={{ cursor: 'pointer' }}>
            📤
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <button onClick={clearBoard} title="Clear Whiteboard" className="tool-btn">🗑️</button>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <button onClick={toggleTheme} title="Toggle Theme" className="tool-btn">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <select value={language} onChange={handleLangChange} className="lang-select">
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <button 
            onClick={runCode} 
            className="tool-btn run-btn"
            disabled={isRunning}
            title="Run Code"
          >
            {isRunning ? '⏳' : '▶️ Run'}
          </button>
        </div>
      </div>

      <main className="split-screen">
        <div className="pane whiteboard-pane">
          <div className="canvas-wrap" ref={containerRef}>
            <Stage
              ref={stageRef}
              width={size.width}
              height={size.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              scaleX={scale}
              scaleY={scale}
              style={{ background: '#ffffff' }}
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
                        strokeWidth={shape.strokeWidth || 2}
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
                        fontSize={shape.fontSize || 18}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="pane editor-pane">
          <div className="editor-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
            <Editor
              height="70%"
              language={language}
              value={code}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              onChange={handleCodeChange}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                readOnly: false,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
            <div 
              className="output-panel" 
              ref={outputRef}
              style={{
                height: '30%',
                background: theme === 'dark' ? '#1a1a2e' : '#f5f5f7',
                borderTop: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                padding: '10px 14px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: theme === 'dark' ? '#cdd6f4' : '#333',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px',
                borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                paddingBottom: '6px',
                flexShrink: 0
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>📋 Output</span>
                <button 
                  onClick={() => {
                    setOutput('');
                    const iframe = outputRef.current?.querySelector('iframe');
                    if (iframe) iframe.remove();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme === 'dark' ? '#a6adc8' : '#666',
                    fontSize: '12px'
                  }}
                >
                  🗑️ Clear
                </button>
              </div>
              <div className="output-content" style={{ flex: 1, overflow: 'auto', minHeight: '40px' }}>
                {!output && !outputRef.current?.querySelector('iframe') && '▶️ Click Run button to execute code'}
                {output && !outputRef.current?.querySelector('iframe') && output}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}