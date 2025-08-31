import { useNavigate } from 'react-router-dom'
import footballIcon from '../assets/football.png'

function Welcome() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/food/0')
  }

  return (
    <div className="screen">
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
    </div>
  )
}

export default Welcome