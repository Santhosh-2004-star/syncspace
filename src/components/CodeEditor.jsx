import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const STORAGE_KEY = 'syncspace_code_v1';
const DEFAULT_CODE = `// SyncSpace Code Editor (local mode)
// This is running with Monaco Editor.
// Later: bind this editor model to a Yjs shared text type
// for real-time multi-cursor collaborative editing.

function architectureNotes() {
  console.log("Draw on the left, code on the right.");
}
`;

const LANGUAGES = ['javascript', 'typescript', 'python', 'json', 'html', 'css'];

export default function CodeEditor() {
  const [language, setLanguage] = useState(
    localStorage.getItem('syncspace_lang_v1') || 'javascript'
  );
  const [code, setCode] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE
  );
  const saveTimeout = useRef(null);

  const handleChange = (value) => {
    setCode(value ?? '');
    // Debounce localStorage writes
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, value ?? '');
    }, 300);
  };

  const handleLangChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('syncspace_lang_v1', lang);
  };

  return (
    <div className="pane editor-pane">
      <div className="toolbar">
        <span className="pane-title">💻 Code Editor</span>
        <div className="tool-group">
          <select value={language} onChange={handleLangChange}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="editor-wrap">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={handleChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
