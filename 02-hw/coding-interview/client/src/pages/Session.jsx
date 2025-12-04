import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import LanguageSelector from '../components/LanguageSelector';
import './Session.css';

const SOCKET_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001';

function Session() {
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [sessionUrl, setSessionUrl] = useState('');
  const [pyodideReady, setPyodideReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const pyodideRef = useRef(null);

  // Initialize Pyodide
  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (window.loadPyodide) {
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/'
          });
          pyodideRef.current = pyodide;
          setPyodideReady(true);
          console.log('Pyodide loaded successfully');
        }
      } catch (error) {
        console.error('Error loading Pyodide:', error);
        setOutput('Error loading Python runtime. Please refresh the page.');
      }
    };

    loadPyodide();
  }, []);

  useEffect(() => {
    // Set the session URL for sharing
    setSessionUrl(window.location.href);

    // Initialize socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join the session room
    newSocket.emit('join-session', id);

    // Listen for session state
    newSocket.on('session-state', ({ code: sessionCode, language: sessionLanguage }) => {
      setCode(sessionCode);
      setLanguage(sessionLanguage);
    });

    // Listen for code updates from other users
    newSocket.on('code-update', ({ code: newCode }) => {
      setCode(newCode);
    });

    // Listen for language updates
    newSocket.on('language-update', ({ language: newLanguage }) => {
      setLanguage(newLanguage);
    });

    // Listen for errors
    newSocket.on('error', ({ message }) => {
      alert(`Error: ${message}`);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [id]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socket) {
      socket.emit('code-change', { sessionId: id, code: newCode });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (socket) {
      socket.emit('language-change', { sessionId: id, language: newLanguage });
    }
  };

  const runJavaScript = () => {
    const logs = [];
    const errors = [];

    // Create a custom console for capturing output
    const customConsole = {
      log: (...args) => {
        logs.push(args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' '));
      },
      error: (...args) => {
        errors.push('ERROR: ' + args.join(' '));
      },
      warn: (...args) => {
        logs.push('WARNING: ' + args.join(' '));
      },
      info: (...args) => {
        logs.push('INFO: ' + args.join(' '));
      }
    };

    try {
      // Create a function with custom console and execute
      const func = new Function('console', code);
      const result = func(customConsole);

      // If there's a return value, add it to output
      if (result !== undefined) {
        logs.push(`=> ${result}`);
      }

      // Combine logs and errors
      const output = [...logs, ...errors].join('\n');
      setOutput(output || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`Error: ${error.message}\n\nStack trace:\n${error.stack}`);
    }
  };

  const runPython = async () => {
    if (!pyodideReady || !pyodideRef.current) {
      setOutput('Python runtime is still loading... Please wait and try again.');
      return;
    }

    try {
      const pyodide = pyodideRef.current;

      // Capture stdout and stderr
      await pyodide.runPythonAsync(`
import sys
from io import StringIO

# Create string buffers for stdout and stderr
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // Run the user's code
      await pyodide.runPythonAsync(code);

      // Get the output
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

      let output = '';
      if (stdout) output += stdout;
      if (stderr) output += (output ? '\n' : '') + 'STDERR:\n' + stderr;

      setOutput(output || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleRunCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setOutput('Running code...');

    try {
      if (language === 'javascript') {
        runJavaScript();
      } else if (language === 'python') {
        await runPython();
      }
    } catch (error) {
      setOutput(`Unexpected error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copySessionUrl = () => {
    navigator.clipboard.writeText(sessionUrl);
    alert('Session URL copied to clipboard!');
  };

  return (
    <div className="session-container">
      <div className="session-header">
        <h2>Coding Interview Session</h2>
        <div className="session-controls">
          <button onClick={copySessionUrl} className="share-btn">
            Share Session
          </button>
          <LanguageSelector
            language={language}
            onChange={handleLanguageChange}
          />
          <button
            onClick={handleRunCode}
            className="run-btn"
            disabled={isRunning || (language === 'python' && !pyodideReady)}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          {language === 'python' && !pyodideReady && (
            <span className="loading-indicator">Loading Python...</span>
          )}
        </div>
      </div>
      <div className="session-content">
        <div className="editor-section">
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
          />
        </div>
        <div className="output-section">
          <OutputPanel output={output} />
        </div>
      </div>
    </div>
  );
}

export default Session;
