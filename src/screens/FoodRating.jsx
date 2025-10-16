import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getFoodImage } from '../constants/foods';

function FoodRating({ food, foodIndex, totalFoods, onRate, responses }) {
  const navigate = useNavigate();
  const currentRating = responses[food.id];

  const handleRating = (rating) => {
    onRate(food.id, rating)
    
    if (foodIndex < totalFoods - 1) {
      navigate(`/food/${foodIndex + 1}`)
    } else {
      navigate('/comments')
    }
  }

  const handleBack = () => {
    if (foodIndex > 0) {
      navigate(`/food/${foodIndex - 1}`)
    } else {
      navigate('/welcome')
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [foodIndex])

  const getButtonClass = (emoji) => {
    if (currentRating === emoji) {
      if (emoji === '😍') return 'emoji-btn selected-love'
      if (emoji === '😐') return 'emoji-btn selected-ok'
      if (emoji === '🤢') return 'emoji-btn selected-nope'
    }
    return 'emoji-btn'
  }

  return (
    <div className="screen">
      <h2 className="food-question">How do you feel about...</h2>

      <div className="food-card">
        <h3 className="food-title">{food.displayName}</h3>
        <img
          src={getFoodImage(food.id)}
          alt={food.displayName}
          className="food-image"
        />
        <div className="emoji-buttons">
          <button
            className={getButtonClass('😍')}
            onClick={() => handleRating('😍')}
          >
            <span className="emoji">😍</span>
            <span className="emoji-label">Love</span>
          </button>
          <button
            className={getButtonClass('😐')}
            onClick={() => handleRating('😐')}
          >
            <span className="emoji">😐</span>
            <span className="emoji-label">OK</span>
          </button>
          <button
            className={getButtonClass('🤢')}
            onClick={() => handleRating('🤢')}
          >
            <span className="emoji">🤢</span>
            <span className="emoji-label">Nope</span>
          </button>
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="btn-back" onClick={handleBack}>
          Back
        </button>
      </div>

      <p className="progress-indicator">
        {foodIndex + 1} of {totalFoods}
      </p>
    </div>
  );
}

export default FoodRating;