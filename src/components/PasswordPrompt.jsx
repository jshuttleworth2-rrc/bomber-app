import { useState } from 'react';
import './PasswordPrompt.css';

const ADMIN_PASSWORD = 'Game-time1';

const PasswordPrompt = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setPassword('');
      setError('');
      onSuccess();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Enter Admin Password</h2>

        <form onSubmit={handleSubmit} className="password-form">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); // Clear error when user types
            }}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            className="password-input"
            autoFocus
          />

          {error && <div className="error-message">{error}</div>}

          <div className="modal-buttons">
            <button type="submit" className="btn-modal-primary">
              Submit
            </button>
            <button type="button" onClick={handleCancel} className="btn-modal-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordPrompt;
