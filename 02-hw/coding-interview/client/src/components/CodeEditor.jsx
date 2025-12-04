import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import './CodeEditor.css';

function CodeEditor({ code, language, onChange }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Get language extension based on selected language
    const languageExtension = language === 'python' ? python() : javascript();

    // Create the initial state
    const startState = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        oneDark,
        syntaxHighlighting(defaultHighlightStyle),
        languageExtension,
        keymap.of([...defaultKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            onChange(newCode);
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px'
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'Consolas, Monaco, Courier New, monospace'
          },
          '.cm-content': {
            minHeight: '100%',
            padding: '10px 0'
          },
          '.cm-gutters': {
            backgroundColor: '#282c34',
            color: '#5c6370',
            border: 'none'
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#2c313c'
          }
        })
      ]
    });

    // Create the editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    // Cleanup function
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]); // Recreate editor when language changes

  // Update editor content when code prop changes from external source
  useEffect(() => {
    if (!viewRef.current) return;

    const currentCode = viewRef.current.state.doc.toString();
    if (code !== currentCode) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentCode.length,
          insert: code
        }
      });
    }
  }, [code]);

  return (
    <div className="code-editor">
      <div className="editor-header">
        <span className="editor-title">Code Editor</span>
        <span className="editor-language">{language}</span>
      </div>
      <div ref={editorRef} className="editor-container" />
    </div>
  );
}

export default CodeEditor;
