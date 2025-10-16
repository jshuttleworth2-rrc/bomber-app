// Configuration Manager - Handles all localStorage operations for survey configurations

import { DEFAULT_FOODS } from '../constants/foods';

// LocalStorage Keys
const STORAGE_KEYS = {
  SAVED_CONFIGS: 'savedConfigurations',
  ACTIVE_SESSION: 'activeSession',
  CUSTOM_FOOD_HISTORY: 'customFoodHistory',
  LAST_RESPONDENT_ID: 'lastRespondentId'
};

// Configuration limits
export const MAX_CUSTOM_CONFIGS = 2; // Plus 1 default = 3 total

// ==================== Configuration CRUD Operations ====================

/**
 * Get all saved configurations from localStorage
 * @returns {Array} Array of configuration objects
 */
export const getSavedConfigurations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CONFIGS);
    if (!saved) {
      // Initialize with default configuration
      const defaultConfig = createDefaultConfiguration();
      localStorage.setItem(STORAGE_KEYS.SAVED_CONFIGS, JSON.stringify([defaultConfig]));
      return [defaultConfig];
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading configurations:', error);
    return [createDefaultConfiguration()];
  }
};

/**
 * Save a new configuration or update an existing one
 * @param {Object} config - Configuration object to save
 * @returns {boolean} Success status
 */
export const saveConfiguration = (config) => {
  try {
    const configs = getSavedConfigurations();
    const existingIndex = configs.findIndex(c => c.id === config.id);

    if (existingIndex !== -1) {
      // Update existing
      configs[existingIndex] = config;
    } else {
      // Add new
      configs.push(config);
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_CONFIGS, JSON.stringify(configs));
    return true;
  } catch (error) {
    console.error('Error saving configuration:', error);
    return false;
  }
};

/**
 * Delete a configuration by ID
 * @param {string} configId - ID of configuration to delete
 * @returns {boolean} Success status
 */
export const deleteConfiguration = (configId) => {
  try {
    // Prevent deletion of default configuration
    if (configId === 'default') {
      console.warn('Cannot delete default configuration');
      return false;
    }

    const configs = getSavedConfigurations();
    const filtered = configs.filter(c => c.id !== configId);
    localStorage.setItem(STORAGE_KEYS.SAVED_CONFIGS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return false;
  }
};

/**
 * Get a specific configuration by ID
 * @param {string} configId - Configuration ID
 * @returns {Object|null} Configuration object or null if not found
 */
export const getConfigurationById = (configId) => {
  const configs = getSavedConfigurations();
  return configs.find(c => c.id === configId) || null;
};

/**
 * Check if max custom configurations limit is reached
 * @returns {boolean} True if limit reached
 */
export const isMaxConfigsReached = () => {
  const configs = getSavedConfigurations();
  const customConfigs = configs.filter(c => !c.isDefault);
  return customConfigs.length >= MAX_CUSTOM_CONFIGS;
};

// ==================== Configuration Factories ====================

/**
 * Create the default configuration
 * @returns {Object} Default configuration object
 */
export const createDefaultConfiguration = () => {
  return {
    id: 'default',
    name: 'Default Survey',
    foods: DEFAULT_FOODS.map(f => f.id),
    customFoods: [],
    createdDate: new Date().toISOString().split('T')[0],
    lastUsed: new Date().toISOString().split('T')[0],
    timesUsed: 0,
    isDefault: true
  };
};

/**
 * Create a new custom configuration
 * @param {string} name - Configuration name (optional, will auto-generate if empty)
 * @param {Array} selectedFoodIds - Array of selected default food IDs
 * @param {Array} customFoods - Array of custom food objects
 * @returns {Object} New configuration object
 */
export const createConfiguration = (name, selectedFoodIds = [], customFoods = []) => {
  const configs = getSavedConfigurations();
  const generatedName = name && name.trim() ? name.trim() : generateAutoName(configs);

  return {
    id: `config-${Date.now()}`,
    name: generatedName,
    foods: selectedFoodIds,
    customFoods: customFoods,
    createdDate: new Date().toISOString().split('T')[0],
    lastUsed: new Date().toISOString().split('T')[0],
    timesUsed: 0,
    isDefault: false
  };
};

/**
 * Generate automatic survey name (Survey 1, Survey 2, etc.)
 * @param {Array} existingConfigs - Array of existing configurations
 * @returns {string} Generated name
 */
export const generateAutoName = (existingConfigs) => {
  const customConfigs = existingConfigs.filter(c => !c.isDefault);
  const existingNumbers = customConfigs
    .map(c => {
      const match = c.name.match(/Survey (\d+)/);
      return match ? parseInt(match[1]) : null;
    })
    .filter(num => num !== null);

  const nextNumber = existingNumbers.length > 0
    ? Math.max(...existingNumbers) + 1
    : 1;

  return `Survey ${nextNumber}`;
};

/**
 * Update configuration metadata (lastUsed, timesUsed)
 * @param {string} configId - Configuration ID
 * @returns {boolean} Success status
 */
export const updateConfigurationMetadata = (configId) => {
  try {
    const config = getConfigurationById(configId);
    if (!config) return false;

    config.lastUsed = new Date().toISOString().split('T')[0];
    config.timesUsed = (config.timesUsed || 0) + 1;

    return saveConfiguration(config);
  } catch (error) {
    console.error('Error updating configuration metadata:', error);
    return false;
  }
};

// ==================== Session Management ====================

/**
 * Get active session from localStorage
 * @returns {Object|null} Active session object or null
 */
export const getActiveSession = () => {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error loading active session:', error);
    return null;
  }
};

/**
 * Start a new session with a configuration
 * @param {string} configId - Configuration ID to use
 * @returns {boolean} Success status
 */
export const startSession = (configId) => {
  try {
    const session = {
      configId: configId,
      startedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));

    // Update configuration metadata
    updateConfigurationMetadata(configId);

    return true;
  } catch (error) {
    console.error('Error starting session:', error);
    return false;
  }
};

/**
 * End the active session
 * @returns {boolean} Success status
 */
export const endSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    return true;
  } catch (error) {
    console.error('Error ending session:', error);
    return false;
  }
};

/**
 * Check if there is an active session
 * @returns {boolean} True if session is active
 */
export const isSessionActive = () => {
  return getActiveSession() !== null;
};

// ==================== Custom Food History ====================

/**
 * Get custom food history from localStorage
 * @returns {Array} Array of custom food objects
 */
export const getCustomFoodHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOOD_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading custom food history:', error);
    return [];
  }
};

/**
 * Add a custom food to history (if not already present)
 * @param {Object} customFood - Custom food object {id, name}
 * @returns {boolean} Success status
 */
export const addToCustomFoodHistory = (customFood) => {
  try {
    const history = getCustomFoodHistory();

    // Check if already exists (by name, case-insensitive)
    const exists = history.some(
      f => f.name.toLowerCase() === customFood.name.toLowerCase()
    );

    if (!exists) {
      history.push(customFood);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FOOD_HISTORY, JSON.stringify(history));
    }

    return true;
  } catch (error) {
    console.error('Error adding to custom food history:', error);
    return false;
  }
};

// ==================== Respondent ID Management ====================

/**
 * Get next respondent ID
 * @returns {number} Next respondent ID
 */
export const getNextRespondentId = () => {
  try {
    const lastId = localStorage.getItem(STORAGE_KEYS.LAST_RESPONDENT_ID);
    const nextId = lastId ? parseInt(lastId) + 1 : 1;
    localStorage.setItem(STORAGE_KEYS.LAST_RESPONDENT_ID, nextId.toString());
    return nextId;
  } catch (error) {
    console.error('Error getting respondent ID:', error);
    return 1;
  }
};

// ==================== Utility Functions ====================

/**
 * Get full food objects (default + custom) for a configuration
 * @param {Object} config - Configuration object
 * @returns {Array} Array of food objects ready for display
 */
export const getFoodsForConfiguration = (config) => {
  if (!config) return [];

  const foods = [];

  // Add selected default foods
  config.foods.forEach(foodId => {
    const defaultFood = DEFAULT_FOODS.find(f => f.id === foodId);
    if (defaultFood) {
      foods.push(defaultFood);
    }
  });

  // Add custom foods
  config.customFoods.forEach(customFood => {
    foods.push({
      id: customFood.id,
      name: customFood.name,
      displayName: customFood.name,
      isDefault: false,
      isCustom: true
    });
  });

  return foods;
};

/**
 * Validate configuration before saving
 * @param {Object} config - Configuration to validate
 * @returns {Object} {isValid: boolean, errors: Array}
 */
export const validateConfiguration = (config) => {
  const errors = [];

  // Must have at least 1 food item
  const totalFoods = (config.foods?.length || 0) + (config.customFoods?.length || 0);
  if (totalFoods === 0) {
    errors.push('Configuration must have at least one food item');
  }

  // Name should not be empty (though we auto-generate if needed)
  if (!config.name || !config.name.trim()) {
    errors.push('Configuration name is required');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Clear all data (useful for testing/reset)
 * WARNING: This will delete all configurations and session data
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_CONFIGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_FOOD_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.LAST_RESPONDENT_ID);
    console.log('All data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
