import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import footballIcon from '../assets/football.png'

function Comments({ responses }) {
  const navigate = useNavigate()
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    responses.comments = comment
    navigate('/thank-you')
  }

  const handleBack = () => {
    navigate('/food/9')
  }

  return (
    <div className="screen">
      <h2 className="food-question">Any additional food ideas? (Optional)</h2>
      
      <textarea
        className="comment-input"
        placeholder="Type here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      
      <img src={footballIcon} alt="Football" className="comments-football-icon" />
      
      <button className="btn-primary" onClick={handleSubmit}>
        Submit Survey
      </button>
      
      <div className="navigation-buttons">
        <button className="btn-back" onClick={handleBack}>
          Back
        </button>
      </div>
    </div>
  )
}

export default Comments