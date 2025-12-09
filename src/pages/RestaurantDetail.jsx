import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getMealsByCuisine } from '../services/api';
import { cuisineToRestaurant } from '../data/mockMenus';
import { useCart } from '../context/CartContext';
import './RestaurantDetail.css';

function RestaurantDetail() {
  const { cuisine } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState(new Set());

  // Define loadRestaurantData BEFORE useEffect
  const loadRestaurantData = useCallback(async () => {
    setLoading(true);
    
    const restaurantInfo = cuisineToRestaurant[cuisine];
    if (!restaurantInfo) {
      setLoading(false);
      return;
    }
    
    setRestaurant({ ...restaurantInfo, cuisine });
    
    const mealsData = await getMealsByCuisine(cuisine);
    setMeals(mealsData);
    setLoading(false);
  }, [cuisine]);

  // Now useEffect can use it
  useEffect(() => {
    loadRestaurantData();
  }, [loadRestaurantData]);

  const handleAddToCart = (meal) => {
    addToCart(meal, restaurant.name);
    
    setAddedItems(prev => new Set(prev).add(meal.idMeal));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(meal.idMeal);
        return newSet;
      });
    }, 2000);
  };

  const generatePrice = (mealName) => {
    const basePrice = 8;
    const variation = (mealName.length % 12) + 3;
    return (basePrice + variation).toFixed(2);
  };

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  if (!restaurant) {
    return (
      <div className="error">
        <h2>Restaurant not found</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{restaurant.name} - FoodOrder</title>
        <meta name="description" content={`Order ${cuisine} food from ${restaurant.name}. ${restaurant.description}`} />
      </Helmet>
      
      <div className="restaurant-detail-container">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Restaurants
        </button>
        
        <div className="restaurant-header">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="restaurant-header-image"
          />
          <div className="restaurant-header-overlay">
            <div className="restaurant-header-content">
              <h1 className="restaurant-header-title">{restaurant.name}</h1>
              <p className="restaurant-header-description">{restaurant.description}</p>
              <div className="restaurant-header-info">
                <span className="restaurant-header-badge">{restaurant.cuisine}</span>
                <span className="restaurant-header-rating">⭐ {restaurant.rating}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="menu-section">
          <h2 className="menu-title">Our Menu</h2>
          
          {meals.length === 0 ? (
            <div className="no-meals">
              <p>No meals available for this cuisine at the moment.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {meals.map((meal) => (
                <div key={meal.idMeal} className="menu-item">
                  <img 
                    src={meal.strMealThumb} 
                    alt={meal.strMeal}
                    className="menu-item-image"
                  />
                  <div className="menu-item-info">
                    <h3 className="menu-item-name">{meal.strMeal}</h3>
                    <div className="menu-item-footer">
                      <span className="menu-item-price">${generatePrice(meal.strMeal)}</span>
                      <button 
                        onClick={() => handleAddToCart(meal)}
                        className={`btn ${addedItems.has(meal.idMeal) ? 'btn-secondary' : 'btn-primary'} menu-item-button`}
                      >
                        {addedItems.has(meal.idMeal) ? '✓ Added!' : '+ Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RestaurantDetail;