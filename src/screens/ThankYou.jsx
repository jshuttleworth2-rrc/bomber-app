import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import footballIcon from '../assets/football.png';
import { endSession, getNextRespondentId } from '../utils/configManager';
import { submitSurveyResponse } from '../utils/googleSheets';
import PasswordPrompt from '../components/PasswordPrompt';
import AdminEditPanel from '../components/AdminEditPanel';
import ConfirmDialog from '../components/ConfirmDialog';

function ThankYou({ responses, respondentId, onReset, activeConfig, setActiveConfig, setSessionActive }) {
  const navigate = useNavigate();
  const [submissionStatus, setSubmissionStatus] = useState('submitting'); // 'submitting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    const submitToGoogleSheets = async () => {
      // Prevent duplicate submissions
      if (hasSubmitted.current) return;

      // Check if we have actual responses to submit
      if (!responses || Object.keys(responses).length === 0) {
        console.log('No responses to submit');
        setSubmissionStatus('success');
        return;
      }

      // Check if we have an active config
      if (!activeConfig) {
        console.error('No active configuration');
        setSubmissionStatus('error');
        setErrorMessage('No active survey configuration');
        return;
      }

      hasSubmitted.current = true;

      // Separate food ratings from other fields (comments, respondent_name)
      const { comments, respondent_name, ...foodRatings } = responses;

      const responseData = {
        respondent_id: respondentId,
        survey_id: activeConfig.id,
        survey_name: activeConfig.name,
        respondent_name: respondent_name || '',
        foodRatings: foodRatings,
        comments: comments || ''
      };

      console.log('Survey response data:', responseData);

      try {
        const result = await submitSurveyResponse(responseData);

        if (result.success) {
          console.log('Data submitted to Google Sheets');
          setSubmissionStatus('success');
        } else {
          console.error('Error submitting:', result.error);
          setErrorMessage(result.error);
          setSubmissionStatus('error');
          setTimeout(() => setSubmissionStatus('success'), 2000);
        }
      } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        setErrorMessage(error.message);
        setSubmissionStatus('error');
        setTimeout(() => setSubmissionStatus('success'), 2000);
      }
    };

    submitToGoogleSheets();
  }, [responses, respondentId, activeConfig]);

  const handleNewResponse = () => {
    hasSubmitted.current = false; // Reset the submission flag for new response
    onReset();
    navigate('/welcome');
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
    <div className="screen thankyou-screen-container">
      <button onClick={handleAdminClick} className="btn-admin">
        Admin
      </button>

      <div className="blue-header">
        <img src={footballIcon} alt="Football" className="football-icon" />
        <h1>Thank you!</h1>
        <p className="subtitle">Your feedback helps us make game day even better!</p>
      </div>

      <div className="go-bombers">GO BOMBERS! 🏈🎊</div>

      {submissionStatus === 'submitting' && (
        <p className="submitting-text">
          Submitting your feedback...
        </p>
      )}

      {submissionStatus === 'error' && (
        <p style={{ textAlign: 'center', color: '#d32f2f', marginTop: '20px' }}>
          There was an issue submitting, but your feedback has been recorded.
        </p>
      )}

      <button className="btn-primary" onClick={handleNewResponse}>
        Submit Another Response
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

export default ThankYou;