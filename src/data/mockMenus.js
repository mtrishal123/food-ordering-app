// This file helps us treat cuisines as "restaurants"
// Each cuisine type becomes a restaurant

export const cuisineToRestaurant = {
  'Italian': {
    id: 'rest_italian',
    name: 'Bella Italia',
    description: 'Authentic Italian cuisine',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'
  },
  'Chinese': {
    id: 'rest_chinese',
    name: 'Golden Dragon',
    description: 'Traditional Chinese dishes',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e'
  },
  'Indian': {
    id: 'rest_indian',
    name: 'Spice Palace',
    description: 'Rich Indian flavors',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe'
  },
  'Mexican': {
    id: 'rest_mexican',
    name: 'El Mariachi',
    description: 'Fresh Mexican food',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47'
  },
  'Japanese': {
    id: 'rest_japanese',
    name: 'Sakura Sushi',
    description: 'Fresh sushi and Japanese cuisine',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'
  },
  'Thai': {
    id: 'rest_thai',
    name: 'Bangkok Spice',
    description: 'Authentic Thai dishes',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e'
  },
  'French': {
    id: 'rest_french',
    name: 'Le Petit Bistro',
    description: 'Classic French cuisine',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'
  },
  'American': {
    id: 'rest_american',
    name: 'The Burger Joint',
    description: 'Classic American comfort food',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349'
  }
};

// Mock pricing data for meals (since API doesn't provide prices)
export const generateMealPrice = (mealName) => {
  // Generate consistent price based on meal name length
  const basePrice = 8;
  const variation = (mealName.length % 10) + 5;
  return (basePrice + variation).toFixed(2);
};