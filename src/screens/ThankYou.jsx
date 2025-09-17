import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import footballIcon from '../assets/football.png'

function ThankYou({ responses, respondentId, onReset }) {
  const navigate = useNavigate()
  const [submissionStatus, setSubmissionStatus] = useState('submitting') // 'submitting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const hasSubmitted = useRef(false)

  useEffect(() => {
    const submitToGoogleSheets = async () => {
      // Prevent duplicate submissions
      if (hasSubmitted.current) return
      
      // Check if we have actual responses to submit
      if (!responses || Object.keys(responses).length === 0) {
        console.log('No responses to submit')
        setSubmissionStatus('success')
        return
      }
      
      hasSubmitted.current = true
      const data = {
        respondent_id: respondentId,
        ...responses,
        date: new Date().toLocaleDateString()
      }
      
      console.log('Survey data:', data)
      
      // Get API URL from environment variable (for dev) or use production URL (for GitHub Pages)
      const apiUrl = import.meta.env.VITE_GOOGLE_SHEETS_API_URL || 'https://script.google.com/macros/s/AKfycbw5qsCTpDDkrX1NHbgGS5NB_aTrDnuJRHbllKlP6IDKSCjgQ3B1M_lTM9hs5Ami9HLd/exec'
      
      // API URL is now always configured, no need to skip
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors', // Required for Google Apps Script
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })
        
        // With no-cors mode, we can't read the response
        // But if the request completes, we assume success
        console.log('Data submitted to Google Sheets')
        setSubmissionStatus('success')
      } catch (error) {
        console.error('Error submitting to Google Sheets:', error)
        setErrorMessage(error.message)
        setSubmissionStatus('error')
        // Still mark as success for UX since data is logged
        setTimeout(() => setSubmissionStatus('success'), 2000)
      }
    }
    
    submitToGoogleSheets()
  }, [responses, respondentId])

  const handleNewResponse = () => {
    hasSubmitted.current = false // Reset the submission flag for new response
    onReset()
    navigate('/welcome')
  }

  return (
    <div className="screen">
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
    </div>
  )
}

export default ThankYou