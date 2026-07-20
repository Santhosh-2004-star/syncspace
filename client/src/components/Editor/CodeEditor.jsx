// src/components/CodeEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { awarenessProtocol } from 'y-protocols/awareness';
import { v4 as uuidv4 } from 'uuid';
import LanguageSelector from './LanguageSelector';
import './Editor.css';

// ============================================
// SUPPORTED LANGUAGES
// ============================================
export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell Script' },
];

// ============================================
// THEME OPTIONS
// ============================================
export const THEMES = [
  { value: 'vs-dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'hc-black', label: 'High Contrast' },
];

// ============================================
// CODE TEMPLATES
// ============================================
export const CODE_TEMPLATES = {
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to SyncSpace</h1>
        <p>Full-featured collaborative workspace</p>
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
}`,

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
};

// ============================================
// CODE EDITOR COMPONENT
// ============================================
const CodeEditor = ({
  roomId,
  userId,
  userName,
  userColor,
  isReplayMode = false,
  theme = 'vs-dark',
  onThemeChange = null,
}) => {
  // ----- STATE -----
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('syncspace_editor_lang') || 'javascript';
  });
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem('syncspace_editor_code');
    if (saved) return saved;
    return CODE_TEMPLATES['javascript'] || '';
  });
  const [editorTheme, setEditorTheme] = useState(theme);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState('on');
  const [minimap, setMinimap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState('on');
  const [isReadOnly, setIsReadOnly] = useState(isReplayMode);
  const [saveStatus, setSaveStatus] = useState('💾 Saved');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [remoteCursors, setRemoteCursors] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [doc, setDoc] = useState(null);
  const [awareness, setAwareness] = useState(null);

  // ----- REFS -----
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const bindingRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const yDocRef = useRef(null);
  const yAwarenessRef = useRef(null);

  // ============================================
  // GET USER COLOR
  // ============================================
  const getUserColor = useCallback((id) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE',
      '#FD79A8', '#00B894', '#0984E3', '#FDCB6E',
    ];
    if (!id) return colors[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // ============================================
  // Yjs COLLABORATIVE SETUP
  // ============================================
  useEffect(() => {
    if (!roomId || !userId) return;

    // Create Yjs document
    const yDoc = new Y.Doc();
    yDocRef.current = yDoc;
    setDoc(yDoc);

    // Create awareness
    const yAwareness = new awarenessProtocol.Awareness(yDoc);
    yAwareness.setLocalState({
      user: {
        id: userId,
        name: userName || 'Anonymous',
        color: userColor || getUserColor(userId),
      },
      cursor: null,
      selection: null,
    });
    yAwarenessRef.current = yAwareness;
    setAwareness(yAwareness);

    // Listen for awareness changes
    const awarenessChangeHandler = () => {
      const states = yAwareness.getStates();
      const users = [];
      const cursors = [];

      states.forEach((state, clientId) => {
        if (clientId === yAwareness.clientID) return;
        if (!state.user) return;

        users.push({
          clientId,
          ...state.user,
        });

        if (state.cursor) {
          cursors.push({
            clientId,
            userId: state.user.id,
            userName: state.user.name,
            color: state.user.color,
            position: state.cursor,
            selection: state.selection,
          });
        }
      });

      setConnectedUsers(users);
      setRemoteCursors(cursors);
    };

    yAwareness.on('change', awarenessChangeHandler);

    return () => {
      yAwareness.off('change', awarenessChangeHandler);
      yAwareness.destroy();
      yDoc.destroy();
    };
  }, [roomId, userId, userName, userColor, getUserColor]);

  // ============================================
  // MONACO EDITOR SETUP
  // ============================================
  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor
    editor.updateOptions({
      fontSize: fontSize,
      fontFamily: 'Consolas, "Courier New", monospace',
      minimap: { enabled: minimap },
      scrollbar: { vertical: 'visible' },
      wordWrap: wordWrap,
      lineNumbers: lineNumbers,
      renderWhitespace: 'selection',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true,
      readOnly: isReadOnly,
    });

    // Set initial language
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }

    // Yjs Binding
    if (yDocRef.current && yAwarenessRef.current && model) {
      const yText = yDocRef.current.getText('code');
      const binding = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        yAwarenessRef.current
      );
      bindingRef.current = binding;
      setIsCollaborative(true);
    }

    // Cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      if (yAwarenessRef.current) {
        yAwarenessRef.current.setLocalState({
          ...yAwarenessRef.current.getLocalState(),
          cursor: {
            lineNumber: e.position.lineNumber,
            column: e.position.column,
          },
        });
      }
    });

    // Selection tracking
    editor.onDidChangeCursorSelection((e) => {
      if (yAwarenessRef.current) {
        yAwarenessRef.current.setLocalState({
          ...yAwarenessRef.current.getLocalState(),
          selection: e.selection,
        });
      }
    });

    // Content change tracking (save)
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      setCode(value);
      setSaveStatus('⏳ Saving...');
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('syncspace_editor_code', value);
        setSaveStatus('✅ Saved');
        setLastSaved(new Date());
      }, 300);
    });
  }, [fontSize, minimap, wordWrap, lineNumbers, isReadOnly, language]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('syncspace_editor_lang', newLanguage);
    
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model && monacoRef.current) {
        monacoRef.current.editor.setModelLanguage(model, newLanguage);
      }
    }

    // Load template for new language
    const template = CODE_TEMPLATES[newLanguage];
    if (template && !localStorage.getItem('syncspace_editor_code')) {
      setCode(template);
      if (editorRef.current) {
        editorRef.current.setValue(template);
      }
      localStorage.setItem('syncspace_editor_code', template);
    }
    setSaveStatus(`📄 ${newLanguage} selected`);
  }, []);

  const handleThemeChange = useCallback((newTheme) => {
    setEditorTheme(newTheme);
    if (onThemeChange) onThemeChange(newTheme);
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(newTheme);
    }
  }, [onThemeChange]);

  const handleEditorChange = useCallback((value) => {
    setCode(value || '');
  }, []);

  const handleFontSizeChange = useCallback((newSize) => {
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  }, []);

  const handleWordWrapToggle = useCallback(() => {
    const newWrap = wordWrap === 'on' ? 'off' : 'on';
    setWordWrap(newWrap);
    if (editorRef.current) {
      editorRef.current.updateOptions({ wordWrap: newWrap });
    }
  }, [wordWrap]);

  const handleMinimapToggle = useCallback(() => {
    setMinimap(!minimap);
    if (editorRef.current) {
      editorRef.current.updateOptions({ minimap: { enabled: !minimap } });
    }
  }, [minimap]);

  const handleLineNumbersToggle = useCallback(() => {
    const newValue = lineNumbers === 'on' ? 'off' : 'on';
    setLineNumbers(newValue);
    if (editorRef.current) {
      editorRef.current.updateOptions({ lineNumbers: newValue });
    }
  }, [lineNumbers]);

  const handleManualSave = useCallback(() => {
    if (!editorRef.current) return;
    setIsSaving(true);
    
    const value = editorRef.current.getValue();
    localStorage.setItem('syncspace_editor_code', value);
    setSaveStatus('✅ Saved');
    setLastSaved(new Date());
    
    setTimeout(() => {
      setIsSaving(false);
      // Show toast notification
      const event = new CustomEvent('show-toast', {
        detail: { message: '💾 Code saved!', type: 'success' }
      });
      window.dispatchEvent(event);
    }, 500);
  }, []);

  const handleFormatCode = useCallback(() => {
    if (!editorRef.current) return;
    const action = editorRef.current.getAction('editor.action.formatDocument');
    if (action) {
      action.run();
    }
  }, []);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S / Cmd+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      // Ctrl+Shift+F / Cmd+Shift+F - Format
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        handleFormatCode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave, handleFormatCode]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="code-editor-container">
      {/* Language Selector and Toolbar */}
      <LanguageSelector
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={editorTheme}
        onThemeChange={handleThemeChange}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        wordWrap={wordWrap}
        onWordWrapToggle={handleWordWrapToggle}
        minimap={minimap}
        onMinimapToggle={handleMinimapToggle}
        lineNumbers={lineNumbers}
        onLineNumbersToggle={handleLineNumbersToggle}
        onFormatCode={handleFormatCode}
        onSave={handleManualSave}
        saveStatus={saveStatus}
        isSaving={isSaving}
        lastSaved={lastSaved}
        isCollaborative={isCollaborative}
        connectedUsers={connectedUsers}
      />

      {/* Editor */}
      <div className="editor-wrapper">
        <MonacoEditor
          height="100%"
          language={language}
          theme={editorTheme}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            fontSize: fontSize,
            minimap: { enabled: minimap },
            wordWrap: wordWrap,
            lineNumbers: lineNumbers,
            renderWhitespace: 'selection',
            tabSize: 2,
            insertSpaces: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            readOnly: isReadOnly,
            scrollBeyondLastLine: false,
          }}
        />

        {/* Remote Cursors */}
        {remoteCursors.map((cursor) => (
          <div
            key={cursor.clientId}
            className="remote-cursor"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 100,
              top: (cursor.position?.lineNumber - 1) * (fontSize * 1.6),
              left: (cursor.position?.column - 1) * (fontSize * 0.6),
              width: '2px',
              height: fontSize * 1.6,
              background: cursor.color,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -18,
                left: 0,
                background: cursor.color,
                color: '#fff',
                padding: '2px 4px',
                fontSize: '9px',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
                transform: 'translateX(-50%)',
              }}
            >
              {cursor.userName}
            </span>
          </div>
        ))}

        {/* Connected Users Badge */}
        {connectedUsers.length > 0 && (
          <div className="connected-users-badge">
            {connectedUsers.map((user) => (
              <span
                key={user.clientId}
                className="user-badge"
                style={{
                  background: user.color || '#6C5CE7',
                }}
                title={user.name}
              >
                {user.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;