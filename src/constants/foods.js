// Default food items for the Bomber Food Survey
// These IDs must remain consistent for Google Sheets column mapping

export const DEFAULT_FOODS = [
  {
    id: 'wings',
    name: 'Wings',
    displayName: 'Wings',
    isDefault: true
  },
  {
    id: 'chicken_fingers',
    name: 'Chicken Fingers',
    displayName: 'Chicken Fingers',
    isDefault: true
  },
  {
    id: 'spring_rolls',
    name: 'Spring Rolls',
    displayName: 'Spring Rolls',
    isDefault: true
  },
  {
    id: 'sliders',
    name: 'Sliders',
    displayName: 'Sliders',
    isDefault: true
  },
  {
    id: 'fruit_veggie',
    name: 'Fruit & Veggie Trays',
    displayName: 'Fruit & Veggie Trays',
    isDefault: true
  },
  {
    id: 'samosas',
    name: 'Samosas',
    displayName: 'Samosas',
    isDefault: true
  },
  {
    id: 'popcorn',
    name: 'Popcorn',
    displayName: 'Popcorn',
    isDefault: true
  },
  {
    id: 'perogies',
    name: 'Perogies',
    displayName: 'Perogies',
    isDefault: true
  },
  {
    id: 'chips_dip',
    name: 'Chips & Dips',
    displayName: 'Chips & Dips',
    isDefault: true
  },
  {
    id: 'pizza',
    name: 'Pizza',
    displayName: 'Pizza',
    isDefault: true
  }
];

// Helper function to get food image path
export const getFoodImage = (foodId) => {
  // Custom foods don't have images
  if (foodId.startsWith('custom-')) {
    return '/src/assets/food_not_found.png';
  }

  // Map default food IDs to their image files
  const imageMap = {
    'wings': '/src/assets/wings.png',
    'chicken_fingers': '/src/assets/chicken_fingers.png',
    'spring_rolls': '/src/assets/spring_rolls.png',
    'sliders': '/src/assets/sliders.png',
    'fruit_veggie': '/src/assets/fruit_veg.png',
    'samosas': '/src/assets/samosas.png',
    'popcorn': '/src/assets/popcorn.png',
    'perogies': '/src/assets/perogies.png',
    'chips_dip': '/src/assets/chip_dip.png',
    'pizza': '/src/assets/pizza.png'
  };

  return imageMap[foodId] || '/src/assets/food_not_found.png';
};

// Helper function to create a custom food object
export const createCustomFood = (name) => {
  return {
    id: `custom-${Date.now()}`,
    name: name,
    displayName: name,
    isDefault: false,
    isCustom: true
  };
};
