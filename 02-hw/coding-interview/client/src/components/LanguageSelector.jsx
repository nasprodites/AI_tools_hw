import './LanguageSelector.css';

function LanguageSelector({ language, onChange }) {
  return (
    <div className="language-selector">
      <label htmlFor="language">Language:</label>
      <select
        id="language"
        value={language}
        onChange={(e) => onChange(e.target.value)}
        className="language-select"
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
