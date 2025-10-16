import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getActiveSession,
  getSavedConfigurations,
  getConfigurationById,
  startSession,
  updateConfigurationMetadata
} from '../utils/configManager';
import { logConfiguration } from '../utils/googleSheets';
import './Configure.css';

const Configure = ({ setActiveConfig, setSessionActive, setActiveFoods }) => {
  const navigate = useNavigate();

  // Check for active session on mount
  useEffect(() => {
    const activeSession = getActiveSession();
    if (activeSession) {
      // Resume existing session
      const config = getConfigurationById(activeSession.configId);
      if (config) {
        setActiveConfig(config);
        setSessionActive(true);
        navigate('/welcome');
      }
    }
  }, [navigate, setActiveConfig, setSessionActive]);

  const handleUseDefaultSurvey = async () => {
    try {
      const configs = getSavedConfigurations();
      const defaultConfig = configs.find(c => c.isDefault);

      if (!defaultConfig) {
        console.error('Default configuration not found');
        return;
      }

      // Start session with default config
      startSession(defaultConfig.id);
      setActiveConfig(defaultConfig);
      setSessionActive(true);

      // Log to Google Sheets
      await logConfiguration(defaultConfig);

      // Navigate to Welcome screen
      navigate('/welcome');
    } catch (error) {
      console.error('Error starting default survey:', error);
    }
  };

  const handleLoadSurvey = () => {
    navigate('/load-survey');
  };

  const handleNewSurvey = () => {
    navigate('/create-survey');
  };

  return (
    <div className="screen configure-screen">
      <h1 className="configure-title">It's Game Time! 🏈</h1>

      <div className="configure-buttons">
        <button
          onClick={handleUseDefaultSurvey}
          className="btn-configure-primary"
        >
          Use Default Survey
        </button>

        <button
          onClick={handleLoadSurvey}
          className="btn-configure-primary"
        >
          Load Survey
        </button>

        <button
          onClick={handleNewSurvey}
          className="btn-configure-primary"
        >
          New Survey
        </button>
      </div>
    </div>
  );
};

export default Configure;
