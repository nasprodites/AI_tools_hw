import { useState, useEffect } from 'react';
import './CodeEditor.css';

function CodeEditor({ code, language, onChange }) {
  const [localCode, setLocalCode] = useState(code);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setLocalCode(newCode);
    onChange(newCode);
  };

  const handleKeyDown = (e) => {
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = localCode.substring(0, start) + '  ' + localCode.substring(end);
      setLocalCode(newCode);
      onChange(newCode);

      // Set cursor position after the inserted tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <span className="editor-title">Code Editor</span>
        <span className="editor-language">{language}</span>
      </div>
      <textarea
        className="editor-textarea"
        value={localCode}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={`Write your ${language} code here...`}
        spellCheck="false"
      />
    </div>
  );
}

export default CodeEditor;
