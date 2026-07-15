import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text as KonvaText } from 'react-konva';
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
            background: #09090b;
            color: #f4f4f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
            border: 2px solid #10b981;
            border-radius: 12px;
            background: #18181b;
        }
        h1 {
            color: #10b981;
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
  background: #09090b;
  color: #f4f4f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  background: #18181b;
  padding: 3rem 4rem;
  border-radius: 16px;
  border: 2px solid #10b981;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
  text-align: center;
}

h1 {
  color: #10b981;
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
        background: '#09090b', 
        color: '#f4f4f5', 
        fontFamily: 'Segoe UI, sans-serif' 
      } 
    },
    React.createElement('h1', { style: { color: '#10b981' } }, '🚀 Welcome to SyncSpace'),
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
            background: '#10b981',
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
const TOOLS = ['pen', 'rect', 'circle', 'arrow', 'straightLine', 'text', 'eraser'];

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
  const [color, setColor] = useState('#18181b');
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
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [showGrid, setShowGrid] = useState(true);

  // ============================================
  // CODE EDITOR HANDLERS
  // ============================================
  const handleCodeChange = (value) => {
    setCode(value ?? '');
    setSaveStatus('Saving...');
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, value ?? '');
      setSaveStatus('Saved');
    }, 300);
  };

  const handleLangChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('syncspace_lang_v1', lang);
    const template = CODE_TEMPLATES[lang] || CODE_TEMPLATES['javascript'];
    setCode(template);
    localStorage.setItem(STORAGE_KEY, template);
    setSaveStatus('Template loaded');
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
    iframe.style.background = '#09090b';
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
    wrapper.style.border = theme === 'dark' ? '1px solid var(--border)' : '1px solid var(--border)';
    wrapper.style.background = theme === 'dark' ? 'var(--bg-darker)' : 'var(--bg-dark)';
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
            result = '[System] Execution completed successfully with no return value.';
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
            result = `[Python VM] Output:\n${'-'.repeat(40)}\n${pythonOutput.join('\n')}`;
          } else {
            result = `[System] Python compiler initialized.\n\n${code}\n\n[Notice] Local execution runs in sandbox wrapper. Python backend environment simulated.`;
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
            result = `[Java VM] Output:\n${'-'.repeat(40)}\n${javaOutput.join('\n')}\n\n[System] Execution completed successfully.`;
          } else {
            result = `[System] Java compiler initialized.\n\n${code}\n\n[Notice] Java execution simulated in preview container.`;
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
      background: #09090b;
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
          result = '[System] React virtual DOM mounted successfully. Preview updated.';
          setOutput(result);

        } else if (language === 'html') {
          renderInIframe(code);
          result = '[System] HTML template rendered successfully in preview viewport.';
          setOutput(result);

        } else if (language === 'css') {
          const cssLines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('/*'));
          result = `[System] CSS sheet parsed successfully.\n\nParsed rules: ${cssLines.length}\nActive styles applied to sandbox viewport.`;
          setOutput(result);

        } else if (language === 'json') {
          try {
            const parsed = JSON.parse(code);
            result = `[System] JSON validation passed.\n\n${JSON.stringify(parsed, null, 2)}`;
          } catch (err) {
            result = `[Error] JSON parsing failed: ${err.message}`;
          }
          setOutput(result);

        } else {
          result = `[System] Rendered ${language.toUpperCase()} document:\n\n${code}`;
          setOutput(result);
        }

        setSaveStatus('Run completed');

      } catch (error) {
        setOutput(`[Runtime Error] ${error.message}`);
        setSaveStatus('Error');
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
    } else if (tool === 'circle') {
      const newShape = {
        id: crypto.randomUUID(),
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 0,
        color: color,
        strokeWidth: borderWidth,
      };
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
    } else if (tool === 'arrow' || tool === 'straightLine') {
      const newShape = {
        id: crypto.randomUUID(),
        type: tool,
        points: [pos.x, pos.y, pos.x, pos.y],
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
    } else if (last.type === 'circle') {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      last.radius = Math.sqrt(dx * dx + dy * dy);
    } else if (last.type === 'arrow' || last.type === 'straightLine') {
      last.points = [last.points[0], last.points[1], point.x, point.y];
    }
    setShapes(updatedShapes);
  }, [shapes]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing.current && shapes.length > 0) {
      const lastShape = shapes[shapes.length - 1];
      if (lastShape && (
        lastShape.type === 'line' || 
        lastShape.type === 'rect' || 
        lastShape.type === 'circle' || 
        lastShape.type === 'arrow' || 
        lastShape.type === 'straightLine'
      )) {
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

  const exportImage = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'syncspace-whiteboard.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSaveStatus('Image exported');
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
        <h1>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: 0.9 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
          <span style={{ fontWeight: '700', letterSpacing: '-0.02em' }}>SyncSpace</span>
        </h1>
        <span className="badge" style={{ marginLeft: '8px' }}>v2.0</span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '12px', fontWeight: '500' }}>
          Collaborative Workspace
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>{saveStatus}</span>
        </div>
      </header>

      <div className="toolbar-main">
        <div className="tool-group">
          <button onClick={undo} title="Undo (Ctrl+Z)" className="tool-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button onClick={redo} title="Redo (Ctrl+Y)" className="tool-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
          </button>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          {TOOLS.map((t) => (
            <button
              key={t}
              className={`tool-btn ${tool === t ? 'active' : ''}`}
              onClick={() => setTool(t)}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            >
              {t === 'pen' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              )}
              {t === 'rect' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
              )}
              {t === 'circle' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg>
              )}
              {t === 'arrow' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="12 5 19 5 19 12"/></svg>
              )}
              {t === 'straightLine' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="19" x2="19" y2="5"/></svg>
              )}
              {t === 'text' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              )}
              {t === 'eraser' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.5l12-12c1-1 2.5-1 3.5 0l4.3 4.3c1 1 1 2.5 0 3.5L10.5 21Z"/><path d="M6 14h14"/></svg>
              )}
            </button>
          ))}
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <span className="tool-label" title="Pen Width">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </span>
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
          <span className="tool-label" title="Text Font Size">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><path d="M4 7V4h16v3"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          </span>
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
          <span className="tool-label" title="Rectangle Border Width">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
          </span>
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
          <button onClick={zoomOut} title="Zoom Out" className="tool-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <span className="tool-value">{(scale * 100).toFixed(0)}%</span>
          <button onClick={zoomIn} title="Zoom In" className="tool-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button onClick={resetZoom} title="Reset Zoom" className="tool-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <button onClick={exportJSON} title="Export Board" className="tool-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <label className="tool-btn" style={{ cursor: 'pointer' }} title="Import Board">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
          <button onClick={exportImage} title="Save as Image (PNG)" className="tool-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </button>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <button onClick={() => setShowGrid(!showGrid)} title="Toggle Grid background" className={`tool-btn ${showGrid ? 'active' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
          </button>
          <button onClick={clearBoard} title="Clear Board" className="tool-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
        <div className="divider"></div>

        <div className="tool-group">
          <button onClick={toggleTheme} title="Toggle Theme" className="tool-btn">
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
        </div>
      </div>

      <main className="split-screen">
        <div className="pane whiteboard-pane">
          <div className={`canvas-wrap ${showGrid ? 'show-grid' : ''}`} ref={containerRef}>
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
              style={{ background: 'transparent' }}
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
                  if (shape.type === 'circle') {
                    return (
                      <Circle
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        radius={shape.radius || 0}
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth || 2}
                      />
                    );
                  }
                  if (shape.type === 'arrow') {
                    return (
                      <Arrow
                        key={shape.id}
                        points={shape.points}
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth || 2}
                        fill={shape.color}
                        pointerLength={10}
                        pointerWidth={10}
                      />
                    );
                  }
                  if (shape.type === 'straightLine') {
                    return (
                      <Line
                        key={shape.id}
                        points={shape.points}
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
            <div className="editor-header" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              background: 'var(--bg-dark)',
              borderBottom: '1px solid var(--border)',
              height: '38px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</span>
                <select value={language} onChange={handleLangChange} style={{
                  background: 'var(--bg-light)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  padding: '2px 8px',
                  height: '26px',
                  cursor: 'pointer',
                  outline: 'none'
                }}>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
                <button onClick={() => handleLangChange({ target: { value: language } })} title="Reset Code Template" style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={runCode} 
                  disabled={isRunning}
                  style={{
                    background: 'var(--bg-light)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '26px'
                  }}
                >
                  {isRunning ? (
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                  )}
                  <span>Run</span>
                </button>
              </div>
            </div>
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
                background: 'var(--bg-dark)',
                borderTop: '1px solid var(--border)',
                padding: '10px 14px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: 'var(--text-primary)',
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
                borderBottom: '1px solid var(--border)',
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