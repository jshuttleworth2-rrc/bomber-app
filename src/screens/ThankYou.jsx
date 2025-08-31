import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import footballIcon from '../assets/football.png'

function ThankYou({ responses, respondentId, onReset }) {
  const navigate = useNavigate()

  useEffect(() => {
    const submitToGoogleSheets = async () => {
      const data = {
        respondent_id: respondentId,
        ...responses,
        date: new Date().toLocaleDateString()
      }
      
      console.log('Survey data:', data)
    }
    
    submitToGoogleSheets()
  }, [responses, respondentId])

  const handleNewResponse = () => {
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
      
      <button className="btn-primary" onClick={handleNewResponse}>
        Submit Another Response
      </button>
    </div>
  )
}

export default ThankYou