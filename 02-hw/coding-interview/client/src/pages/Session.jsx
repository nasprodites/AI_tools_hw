import { useEffect, useState } from 'react';
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

  const handleRunCode = () => {
    setOutput('Running code...');

    try {
      if (language === 'javascript') {
        // Simple JavaScript execution
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.join(' '))
        };

        // Create a function with custom console
        const func = new Function('console', code);
        func(customConsole);

        setOutput(logs.join('\n') || 'Code executed successfully (no output)');
      } else {
        // Python will be implemented in Step 5
        setOutput('Python execution will be available in Step 5 (Pyodide integration)');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
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
          <button onClick={handleRunCode} className="run-btn">
            Run Code
          </button>
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
