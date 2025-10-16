import { useState, useEffect } from 'react';
import { DEFAULT_FOODS } from '../constants/foods';
import { getCustomFoodHistory, addToCustomFoodHistory } from '../utils/configManager';
import AddCustomFood from './AddCustomFood';
import './AdminEditPanel.css';

const AdminEditPanel = ({ isOpen, onClose, currentConfig, onSave }) => {
  const [surveyName, setSurveyName] = useState('');
  const [selectedDefaultFoods, setSelectedDefaultFoods] = useState([]);
  const [selectedCustomFoods, setSelectedCustomFoods] = useState([]);
  const [customFoodHistory, setCustomFoodHistory] = useState([]);
  const [error, setError] = useState('');

  // Load configuration data when panel opens
  useEffect(() => {
    if (isOpen && currentConfig) {
      setSurveyName(currentConfig.name);
      setSelectedDefaultFoods(currentConfig.foods || []);
      setSelectedCustomFoods(currentConfig.customFoods || []);
      setCustomFoodHistory(getCustomFoodHistory());
    }
  }, [isOpen, currentConfig]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle default food selection
  const toggleDefaultFood = (foodId) => {
    setSelectedDefaultFoods(prev =>
      prev.includes(foodId)
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
    setError('');
  };

  // Toggle custom food selection
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

  // Save changes
  const handleSave = () => {
    // Validation: at least 1 food must be selected
    const totalFoods = selectedDefaultFoods.length + selectedCustomFoods.length;
    if (totalFoods === 0) {
      setError('Please select at least one food item');
      return;
    }

    // Create updated config
    const updatedConfig = {
      ...currentConfig,
      name: surveyName.trim() || currentConfig.name, // Keep existing name if blank
      foods: selectedDefaultFoods,
      customFoods: selectedCustomFoods
    };

    onSave(updatedConfig);
  };

  // Handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="admin-panel-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="admin-panel-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Edit Survey Configuration</h2>
          <button onClick={onClose} className="btn-close" aria-label="Close">
            ×
          </button>
        </div>

        <div className="admin-panel-body">
          {/* Survey Name */}
          <div className="form-section">
            <label className="form-label">Survey Name:</label>
            <input
              type="text"
              value={surveyName}
              onChange={(e) => setSurveyName(e.target.value)}
              placeholder="Survey name"
              className="survey-name-input"
            />
          </div>

          {/* Default Foods Selection */}
          <div className="form-section">
            <h3 className="section-title">Default Foods:</h3>
            <div className="food-list">
              {DEFAULT_FOODS.map(food => (
                <div key={food.id} className="food-item">
                  <label className="food-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedDefaultFoods.includes(food.id)}
                      onChange={() => toggleDefaultFood(food.id)}
                      className="food-checkbox"
                    />
                    <span className="food-name">{food.name}</span>
                  </label>
                  {selectedDefaultFoods.includes(food.id) && (
                    <button
                      onClick={() => toggleDefaultFood(food.id)}
                      className="btn-remove"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Previously Used Custom Foods */}
          {customFoodHistory.length > 0 && (
            <div className="form-section">
              <h3 className="section-title">Previously Used Custom Foods:</h3>
              <div className="food-list">
                {customFoodHistory.map(food => {
                  const isSelected = selectedCustomFoods.some(f => f.id === food.id);
                  return (
                    <div key={food.id} className="food-item">
                      <label className="food-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCustomFood(food)}
                          className="food-checkbox"
                        />
                        <span className="food-name">{food.name} (custom)</span>
                      </label>
                      {isSelected && (
                        <button
                          onClick={() => toggleCustomFood(food)}
                          className="btn-remove"
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
          <div className="form-section">
            <AddCustomFood
              onAdd={handleAddCustomFood}
              existingFoods={getAllExistingFoodNames()}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="admin-error-message">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="admin-panel-footer">
          <button onClick={handleSave} className="btn-admin-save">
            Save Changes
          </button>
          <button onClick={onClose} className="btn-admin-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditPanel;
