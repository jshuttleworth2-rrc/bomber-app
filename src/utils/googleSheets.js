// Google Sheets API Integration
// This handles all communication with the Google Apps Script backend

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_GOOGLE_SHEETS_API_URL_V2;

/**
 * Submit a survey response to Google Sheets
 * @param {Object} responseData - Survey response data
 * @returns {Promise<Object>} Response from API
 */
export const submitSurveyResponse = async (responseData) => {
  try {
    if (!API_URL) {
      console.warn('Google Sheets API URL not configured');
      return { success: false, error: 'API URL not configured' };
    }

    const payload = {
      type: 'survey_response',
      data: {
        respondent_id: responseData.respondent_id,
        survey_id: responseData.survey_id,
        survey_name: responseData.survey_name,
        respondent_name: responseData.respondent_name || '',
        ...responseData.foodRatings, // Food ratings object (e.g., {wings: '😍', ...})
        comments: responseData.comments || '',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // Note: no-cors mode means we can't read the response
    // We assume success if no error was thrown
    console.log('Survey response submitted successfully');
    return { success: true };

  } catch (error) {
    console.error('Error submitting survey response:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Log or update a configuration in Google Sheets
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Response from API
 */
export const logConfiguration = async (config) => {
  try {
    if (!API_URL) {
      console.warn('Google Sheets API URL not configured');
      return { success: false, error: 'API URL not configured' };
    }

    const payload = {
      type: 'config_update',
      data: {
        survey_id: config.id,
        survey_name: config.name,
        default_foods: config.foods.join(','),
        custom_foods: config.customFoods.map(f => f.name).join(','),
        created_date: config.createdDate,
        last_used: config.lastUsed,
        times_used: config.timesUsed
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // Note: no-cors mode means we can't read the response
    // We assume success if no error was thrown
    console.log('Configuration logged successfully');
    return { success: true };

  } catch (error) {
    console.error('Error logging configuration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test connection to Google Sheets API
 * @returns {Promise<boolean>} True if connection successful
 */
export const testConnection = async () => {
  try {
    if (!API_URL) {
      console.warn('Google Sheets API URL not configured');
      return false;
    }

    // Send a minimal test payload
    const payload = {
      type: 'test',
      data: {}
    };

    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (error) {
    console.error('Error testing connection:', error);
    return false;
  }
};
