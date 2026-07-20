// src/components/LanguageSelector.jsx
import React from 'react';
import { SUPPORTED_LANGUAGES, THEMES } from './CodeEditor';

const LanguageSelector = ({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  wordWrap,
  onWordWrapToggle,
  minimap,
  onMinimapToggle,
  lineNumbers,
  onLineNumbersToggle,
  onFormatCode,
  onSave,
  saveStatus,
  isSaving,
  lastSaved,
  isCollaborative,
  connectedUsers,
}) => {
  return (
    <div className="editor-toolbar">
      {/* Left Section - Language & Theme */}
      <div className="toolbar-left">
        <span className="toolbar-label">💻 Code</span>
        
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="toolbar-select"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        <select
          value={theme}
          onChange={(e) => onThemeChange(e.target.value)}
          className="toolbar-select"
        >
          {THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
          className="toolbar-select"
        >
          {[10, 12, 14, 16, 18, 20, 22, 24].map((size) => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>
      </div>

      {/* Center Section - Editor Options */}
      <div className="toolbar-center">
        <button
          onClick={onWordWrapToggle}
          className={`toolbar-btn ${wordWrap === 'on' ? 'active' : ''}`}
          title="Toggle Word Wrap"
        >
          📝 Wrap
        </button>

        <button
          onClick={onMinimapToggle}
          className={`toolbar-btn ${minimap ? 'active' : ''}`}
          title="Toggle Minimap"
        >
          🗺️ Minimap
        </button>

        <button
          onClick={onLineNumbersToggle}
          className={`toolbar-btn ${lineNumbers === 'on' ? 'active' : ''}`}
          title="Toggle Line Numbers"
        >
          # Lines
        </button>

        <button
          onClick={onFormatCode}
          className="toolbar-btn"
          title="Format Code (Ctrl+Shift+F)"
        >
          ⌨️ Format
        </button>
      </div>

      {/* Right Section - Save & Status */}
      <div className="toolbar-right">
        {isCollaborative && (
          <span className="collaborative-status">
            <span className="status-dot"></span>
            {connectedUsers.length + 1} online
          </span>
        )}

        <span className={`save-status ${saveStatus.includes('✅') ? 'saved' : saveStatus.includes('⏳') ? 'saving' : ''}`}>
          {saveStatus}
        </span>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="save-btn"
        >
          {isSaving ? '💾 Saving...' : '💾 Save'}
        </button>

        {lastSaved && (
          <span className="last-saved">
            {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;