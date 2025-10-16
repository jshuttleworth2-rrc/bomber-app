import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import footballIcon from '../assets/football.png';

function Comments({ responses, activeFoods }) {
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');

  const handleSubmit = () => {
    responses.comments = comment;
    responses.respondent_name = userName;
    navigate('/thank-you');
  };

  const handleBack = () => {
    // Navigate to the last food item (dynamic based on active foods)
    const lastFoodIndex = activeFoods ? activeFoods.length - 1 : 9;
    navigate(`/food/${lastFoodIndex}`);
  };

  return (
    <div className="screen">
      <h2 className="food-question">Any additional food ideas? (Optional)</h2>

      <textarea
        className="comment-input"
        placeholder="Type here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <h2 className="food-question">Your name? (Optional)</h2>

      <textarea
        className="comment-input name-input"
        placeholder="Type here..."
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
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
  );
}

export default Comments;