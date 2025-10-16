import { useState } from 'react';
import './AddCustomFood.css';

const AddCustomFood = ({ onAdd, existingFoods }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmedName = foodName.trim();

    // Validation
    if (!trimmedName) {
      setError('Please enter a food name');
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = existingFoods.some(
      food => food.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError('This food already exists');
      return;
    }

    // Success - add the food
    onAdd(trimmedName);
    setFoodName('');
    setError('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setFoodName('');
    setError('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="btn-add-food"
      >
        + Add Food
      </button>
    );
  }

  return (
    <div className="add-food-container">
      <div className="add-food-input-row">
        <input
          type="text"
          value={foodName}
          onChange={(e) => {
            setFoodName(e.target.value);
            setError(''); // Clear error when typing
          }}
          onKeyDown={handleKeyDown}
          placeholder="Food name"
          className="food-name-input"
          autoFocus
        />
        <button onClick={handleAdd} className="btn-add-confirm">
          Add
        </button>
        <button onClick={handleCancel} className="btn-add-cancel">
          Cancel
        </button>
      </div>
      {error && <div className="add-food-error">{error}</div>}
    </div>
  );
};

export default AddCustomFood;
