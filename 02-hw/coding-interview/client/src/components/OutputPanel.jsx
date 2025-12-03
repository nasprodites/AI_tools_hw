import './OutputPanel.css';

function OutputPanel({ output }) {
  return (
    <div className="output-panel">
      <div className="output-header">
        <span className="output-title">Output</span>
      </div>
      <div className="output-content">
        <pre className="output-text">{output || 'No output yet. Run your code to see results.'}</pre>
      </div>
    </div>
  );
}

export default OutputPanel;
