const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Search meals by name
export const searchMeals = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search.php?s=${query}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error searching meals:', error);
    return [];
  }
};

// Get meals by cuisine
export const getMealsByCuisine = async (cuisine) => {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?a=${cuisine}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching meals by cuisine:', error);
    return [];
  }
};

// Get meals by category
export const getMealsByCategory = async (category) => {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching meals by category:', error);
    return [];
  }
};

// Get meal details by ID
export const getMealDetails = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Error fetching meal details:', error);
    return null;
  }
};

// Get random meal
export const getRandomMeal = async () => {
  try {
    const response = await fetch(`${BASE_URL}/random.php`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Error fetching random meal:', error);
    return null;
  }
};

// Get all cuisines (areas)
export const getAllCuisines = () => {
  return [
    'American', 'British', 'Canadian', 'Chinese', 'Croatian', 'Dutch',
    'Egyptian', 'French', 'Greek', 'Indian', 'Irish', 'Italian',
    'Jamaican', 'Japanese', 'Kenyan', 'Malaysian', 'Mexican', 'Moroccan',
    'Polish', 'Portuguese', 'Russian', 'Spanish', 'Thai', 'Tunisian',
    'Turkish', 'Vietnamese'
  ];
};

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories.php`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};