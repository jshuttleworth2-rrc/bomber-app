import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSavedConfigurations,
  deleteConfiguration,
  startSession,
  getFoodsForConfiguration
} from '../utils/configManager';
import { logConfiguration } from '../utils/googleSheets';
import ConfirmDialog from '../components/ConfirmDialog';
import './LoadSurvey.css';

const LoadSurvey = ({ setActiveConfig, setSessionActive }) => {
  const navigate = useNavigate();
  const [configurations, setConfigurations] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    configId: null,
    configName: ''
  });

  // Load configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = () => {
    const configs = getSavedConfigurations();
    // Sort: Default first, then by lastUsed (most recent first)
    const sorted = configs.sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return new Date(b.lastUsed) - new Date(a.lastUsed);
    });
    setConfigurations(sorted);
  };

  const toggleExpanded = (configId) => {
    setExpandedId(expandedId === configId ? null : configId);
  };

  const handleEdit = (configId) => {
    navigate(`/edit-survey/${configId}`);
  };

  const handleDeleteClick = (config) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      configId: config.id,
      configName: config.name
    });
  };

  const handleDeleteConfirm = () => {
    const success = deleteConfiguration(confirmDialog.configId);
    if (success) {
      loadConfigurations();
    }
    setConfirmDialog({ isOpen: false, type: null, configId: null, configName: '' });
  };

  const handleUseClick = (config) => {
    setConfirmDialog({
      isOpen: true,
      type: 'use',
      configId: config.id,
      configName: config.name
    });
  };

  const handleUseConfirm = async () => {
    try {
      const config = configurations.find(c => c.id === confirmDialog.configId);
      if (!config) return;

      // Start session
      startSession(config.id);
      setActiveConfig(config);
      setSessionActive(true);

      // Log to Google Sheets
      await logConfiguration(config);

      // Navigate to Welcome
      navigate('/welcome');
    } catch (error) {
      console.error('Error starting survey:', error);
    }
    setConfirmDialog({ isOpen: false, type: null, configId: null, configName: '' });
  };

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, type: null, configId: null, configName: '' });
  };

  const handleNewSurvey = () => {
    navigate('/create-survey');
  };

  const getCustomConfigs = () => configurations.filter(c => !c.isDefault);

  return (
    <div className="screen load-survey-screen">
      <div className="load-survey-header">
        <h2 className="load-survey-title">Select a survey...</h2>
        <button onClick={handleNewSurvey} className="btn-new-survey-small">
          + New Survey
        </button>
      </div>

      <div className="survey-cards-container">
        {configurations.map(config => {
          const foods = getFoodsForConfiguration(config);
          const isExpanded = expandedId === config.id;

          return (
            <div key={config.id} className="survey-card">
              <div className="survey-card-header">
                <h3 className="survey-card-name">{config.name}</h3>
                {config.isDefault && <span className="default-badge">Default</span>}
              </div>

              <div className="survey-card-meta">
                <p className="survey-meta-text">Last Used: {config.lastUsed}</p>
                <p className="survey-meta-text">Times used: {config.timesUsed}</p>
              </div>

              <button
                onClick={() => toggleExpanded(config.id)}
                className="btn-toggle-details"
              >
                {isExpanded ? 'Close details ▲' : 'More details ▼'}
              </button>

              {isExpanded && (
                <div className="survey-details">
                  <p className="details-title">Foods in this survey:</p>
                  <ul className="food-details-list">
                    {foods.map(food => (
                      <li key={food.id}>
                        {food.name}
                        {food.isCustom && <span className="custom-label"> (custom)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="survey-card-actions">
                <button
                  onClick={() => handleEdit(config.id)}
                  className="btn-survey-action btn-edit"
                >
                  Edit
                </button>
                {!config.isDefault && (
                  <button
                    onClick={() => handleDeleteClick(config)}
                    className="btn-survey-action btn-delete"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => handleUseClick(config)}
                  className="btn-survey-action btn-use"
                >
                  Use
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {getCustomConfigs().length === 0 && (
        <div className="empty-state">
          <p className="empty-message">No custom surveys saved yet.</p>
          <p className="empty-message">Create one using "New Survey"!</p>
          <button onClick={handleNewSurvey} className="btn-new-survey-large">
            + New Survey
          </button>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete'}
        message={`Delete ${confirmDialog.configName}? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleCancel}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'use'}
        message={`Use ${confirmDialog.configName}?`}
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleUseConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default LoadSurvey;
