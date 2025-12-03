import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createNewSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      navigate(`/session/${data.sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Coding Interview Platform</h1>
        <p className="home-description">
          Create a new coding session and share the link with candidates
        </p>
        <button
          className="create-session-btn"
          onClick={createNewSession}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create New Session'}
        </button>
        <div className="features">
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Real-time collaboration</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>JavaScript & Python support</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Safe browser execution</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
