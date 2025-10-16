import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_FOODS } from '../constants/foods';
import {
  getConfigurationById,
  createConfiguration,
  saveConfiguration,
  startSession,
  getCustomFoodHistory,
  addToCustomFoodHistory,
  isMaxConfigsReached
} from '../utils/configManager';
import { logConfiguration } from '../utils/googleSheets';
import AddCustomFood from '../components/AddCustomFood';
import './CreateSurvey.css';

const CreateSurvey = ({ setActiveConfig, setSessionActive }) => {
  const navigate = useNavigate();
  const { configId } = useParams();
  const isEditMode = !!configId;

  const [surveyName, setSurveyName] = useState('');
  const [selectedDefaultFoods, setSelectedDefaultFoods] = useState([]);
  const [selectedCustomFoods, setSelectedCustomFoods] = useState([]);
  const [customFoodHistory, setCustomFoodHistory] = useState([]);
  const [error, setError] = useState('');
  const [existingConfig, setExistingConfig] = useState(null);

  // Load data on mount
  useEffect(() => {
    // Check max configs limit for create mode
    if (!isEditMode && isMaxConfigsReached()) {
      setError('Maximum number of custom surveys reached (2). Please delete an existing survey first.');
    }

    // Load custom food history
    setCustomFoodHistory(getCustomFoodHistory());

    // If edit mode, load existing config
    if (isEditMode && configId) {
      const config = getConfigurationById(configId);
      if (config) {
        setExistingConfig(config);
        setSurveyName(config.name);
        setSelectedDefaultFoods(config.foods || []);
        setSelectedCustomFoods(config.customFoods || []);
      } else {
        console.error('Configuration not found');
        navigate('/load-survey');
      }
    }
  }, [isEditMode, configId, navigate]);

  // Toggle default food selection
  const toggleDefaultFood = (foodId) => {
    setSelectedDefaultFoods(prev =>
      prev.includes(foodId)
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
    setError('');
  };

  // Toggle custom food selection from history
  const toggleCustomFood = (customFood) => {
    setSelectedCustomFoods(prev => {
      const exists = prev.some(f => f.id === customFood.id);
      if (exists) {
        return prev.filter(f => f.id !== customFood.id);
      } else {
        return [...prev, customFood];
      }
    });
    setError('');
  };

  // Add new custom food
  const handleAddCustomFood = (foodName) => {
    const newCustomFood = {
      id: `custom-${Date.now()}`,
      name: foodName
    };

    // Add to selected foods
    setSelectedCustomFoods(prev => [...prev, newCustomFood]);

    // Add to history
    addToCustomFoodHistory(newCustomFood);
    setCustomFoodHistory(getCustomFoodHistory());
  };

  // Get all existing food names for duplicate checking
  const getAllExistingFoodNames = () => {
    const defaultNames = DEFAULT_FOODS.map(f => f.name);
    const customNames = customFoodHistory.map(f => f.name);
    const selectedCustomNames = selectedCustomFoods.map(f => f.name);
    return [...defaultNames, ...customNames, ...selectedCustomNames];
  };

  // Save and start survey
  const handleSaveAndStart = async () => {
    // Validation
    const totalFoods = selectedDefaultFoods.length + selectedCustomFoods.length;
    if (totalFoods === 0) {
      setError('Please select at least one food item');
      return;
    }

    try {
      let config;

      if (isEditMode && existingConfig) {
        // Update existing config
        config = {
          ...existingConfig,
          name: surveyName.trim() || existingConfig.name,
          foods: selectedDefaultFoods,
          customFoods: selectedCustomFoods
        };
      } else {
        // Create new config
        config = createConfiguration(
          surveyName,
          selectedDefaultFoods,
          selectedCustomFoods
        );
      }

      // Save to localStorage
      saveConfiguration(config);

      // Start session
      startSession(config.id);
      setActiveConfig(config);
      setSessionActive(true);

      // Log to Google Sheets
      await logConfiguration(config);

      // Navigate to Welcome
      navigate('/welcome');
    } catch (error) {
      console.error('Error saving configuration:', error);
      setError('Failed to save configuration. Please try again.');
    }
  };

  // Save and close (edit mode only)
  const handleSaveAndClose = async () => {
    // Validation
    const totalFoods = selectedDefaultFoods.length + selectedCustomFoods.length;
    if (totalFoods === 0) {
      setError('Please select at least one food item');
      return;
    }

    try {
      if (!existingConfig) return;

      // Update existing config
      const config = {
        ...existingConfig,
        name: surveyName.trim() || existingConfig.name,
        foods: selectedDefaultFoods,
        customFoods: selectedCustomFoods
      };

      // Save to localStorage
      saveConfiguration(config);

      // Log to Google Sheets
      await logConfiguration(config);

      // Navigate back to Load Survey
      navigate('/load-survey');
    } catch (error) {
      console.error('Error saving configuration:', error);
      setError('Failed to save configuration. Please try again.');
    }
  };

  return (
    <div className="screen create-survey-screen">
      <h2 className="create-survey-title">
        {isEditMode ? 'Edit Survey' : 'Create New Survey'}
      </h2>

      {error && <div className="create-error-message">{error}</div>}

      <div className="create-survey-form">
        {/* Survey Name Input */}
        <div className="form-section">
          <label className="form-label">Please enter a survey name:</label>
          <input
            type="text"
            value={surveyName}
            onChange={(e) => setSurveyName(e.target.value)}
            placeholder="Survey name?"
            className="survey-name-input"
            disabled={isMaxConfigsReached() && !isEditMode}
          />
          {!surveyName.trim() && (
            <p className="form-hint">Leave blank to auto-generate a name</p>
          )}
        </div>

        {/* Select Food Section */}
        <div className="form-section">
          <h3 className="section-header">Select food for your survey:</h3>

          {/* Default Foods */}
          <div className="subsection">
            <h4 className="subsection-title">Default Foods:</h4>
            <div className="food-selection-list">
              {DEFAULT_FOODS.map(food => {
                const isSelected = selectedDefaultFoods.includes(food.id);
                return (
                  <div key={food.id} className="food-selection-item">
                    <label className="food-selection-label">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDefaultFood(food.id)}
                        className="food-checkbox"
                        disabled={isMaxConfigsReached() && !isEditMode}
                      />
                      <span className="food-name">{food.name}</span>
                    </label>
                    {isSelected && (
                      <button
                        onClick={() => toggleDefaultFood(food.id)}
                        className="btn-remove-food"
                        disabled={isMaxConfigsReached() && !isEditMode}
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Previously Used Custom Foods */}
          {customFoodHistory.length > 0 && (
            <div className="subsection">
              <h4 className="subsection-title">Previously Used Custom Foods:</h4>
              <div className="food-selection-list">
                {customFoodHistory.map(food => {
                  const isSelected = selectedCustomFoods.some(f => f.id === food.id);
                  return (
                    <div key={food.id} className="food-selection-item">
                      <label className="food-selection-label">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCustomFood(food)}
                          className="food-checkbox"
                          disabled={isMaxConfigsReached() && !isEditMode}
                        />
                        <span className="food-name">{food.name}</span>
                      </label>
                      {isSelected && (
                        <button
                          onClick={() => toggleCustomFood(food)}
                          className="btn-remove-food"
                          disabled={isMaxConfigsReached() && !isEditMode}
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Custom Food */}
          <div className="subsection">
            <AddCustomFood
              onAdd={handleAddCustomFood}
              existingFoods={getAllExistingFoodNames()}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            onClick={handleSaveAndStart}
            className="btn-form-primary"
            disabled={isMaxConfigsReached() && !isEditMode}
          >
            Save and Start Survey
          </button>

          {isEditMode && (
            <button
              onClick={handleSaveAndClose}
              className="btn-form-secondary"
            >
              Save and Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSurvey;
