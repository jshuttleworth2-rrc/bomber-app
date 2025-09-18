import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Welcome from './screens/Welcome'
import FoodRating from './screens/FoodRating'
import Comments from './screens/Comments'
import ThankYou from './screens/ThankYou'
import './App.css'

const foods = [
  { id: 'wings', name: 'Wings', displayName: 'Wings' },
  { id: 'chicken_fingers', name: 'Chicken Fingers', displayName: 'Chicken Fingers' },
  { id: 'spring_rolls', name: 'Spring Rolls', displayName: 'Spring Rolls' },
  { id: 'sliders', name: 'Sliders', displayName: 'Sliders' },
  { id: 'fruit_veggie', name: 'Fruit & Veggie Trays', displayName: 'Fruit & Veggie Trays' },
  { id: 'samosas', name: 'Samosas', displayName: 'Samosas' },
  { id: 'popcorn', name: 'Popcorn', displayName: 'Popcorn' },
  { id: 'perogies', name: 'Perogies', displayName: 'Perogies' },
  { id: 'chips_dip', name: 'Chips & Dips', displayName: 'Chips & Dips' },
  { id: 'pizza', name: 'Pizza', displayName: 'Pizza' }
]

function App() {
  const [responses, setResponses] = useState({})
  const [currentFoodIndex, setCurrentFoodIndex] = useState(0)
  const [respondentId, setRespondentId] = useState(() => {
    const saved = localStorage.getItem('lastRespondentId')
    return saved ? parseInt(saved) + 1 : 1
  })

  const handleFoodRating = (foodId, rating) => {
    setResponses(prev => ({ ...prev, [foodId]: rating }))
  }

  const resetSurvey = () => {
    setResponses({})
    setCurrentFoodIndex(0)
    const newId = respondentId + 1
    setRespondentId(newId)
    localStorage.setItem('lastRespondentId', newId.toString())
  }

  return (
    <Router basename="/bomber-app">
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Welcome />} />
          {foods.map((food, index) => (
            <Route
              key={food.id}
              path={`/food/${index}`}
              element={
                <FoodRating
                  food={food}
                  foodIndex={index}
                  totalFoods={foods.length}
                  onRate={handleFoodRating}
                  responses={responses}
                />
              }
            />
          ))}
          <Route 
            path="/comments" 
            element={<Comments responses={responses} />} 
          />
          <Route 
            path="/thank-you" 
            element={
              <ThankYou 
                responses={responses} 
                respondentId={respondentId}
                onReset={resetSurvey} 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
