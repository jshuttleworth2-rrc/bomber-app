import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import footballIcon from '../assets/football.png';
import { endSession } from '../utils/configManager';
import PasswordPrompt from '../components/PasswordPrompt';
import AdminEditPanel from '../components/AdminEditPanel';
import ConfirmDialog from '../components/ConfirmDialog';

function Welcome({ activeConfig, setActiveConfig, setSessionActive }) {
  const navigate = useNavigate();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);

  const handleStart = () => {
    navigate('/food/0');
  };

  const handleAdminClick = () => {
    setShowPasswordPrompt(true);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordPrompt(false);
    setShowAdminPanel(true);
  };

  const handleAdminSave = (updatedConfig) => {
    setActiveConfig(updatedConfig);
    setShowAdminPanel(false);
  };

  const handleGameOverClick = () => {
    setShowGameOverDialog(true);
  };

  const handleGameOverConfirm = () => {
    endSession();
    setSessionActive(false);
    setActiveConfig(null);
    setShowGameOverDialog(false);
    navigate('/configure');
  };

  return (
    <div className="screen welcome-screen-container">
      <button onClick={handleAdminClick} className="btn-admin">
        Admin
      </button>

      <div className="blue-header">
        <img src={footballIcon} alt="Football" className="football-icon" />
        <h1>Welcome!</h1>
        <p className="subtitle">Help us improve your game day experience</p>
      </div>

      <p className="info-text">
        Please provide feedback on the food at our games by selecting an emoji.
        Your input helps us serve you better!
      </p>

      <button className="btn-primary" onClick={handleStart}>
        Start Survey
      </button>

      <button onClick={handleGameOverClick} className="btn-game-over">
        Game Over 🏁
      </button>

      {/* Modals */}
      <PasswordPrompt
        isOpen={showPasswordPrompt}
        onClose={() => setShowPasswordPrompt(false)}
        onSuccess={handlePasswordSuccess}
      />

      <AdminEditPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        currentConfig={activeConfig}
        onSave={handleAdminSave}
      />

      <ConfirmDialog
        isOpen={showGameOverDialog}
        message="Is the game really over? :("
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleGameOverConfirm}
        onCancel={() => setShowGameOverDialog(false)}
      />
    </div>
  );
}

export default Welcome;