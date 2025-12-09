import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getAllCuisines } from '../services/api';
import { cuisineToRestaurant } from '../data/mockMenus';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import './Home.css';

function Home() {
  const [cuisines, setCuisines] = useState([]);
  const [filteredCuisines, setFilteredCuisines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCuisines();
  }, []);

  useEffect(() => {
    filterAndSortCuisines();
  }, [searchQuery, sortBy, cuisines]);

  const loadCuisines = () => {
    setLoading(true);
    const allCuisines = getAllCuisines();
    
    const restaurants = allCuisines.map(cuisine => {
      const restaurantData = cuisineToRestaurant[cuisine];
      return restaurantData ? { ...restaurantData, cuisine } : null;
    }).filter(Boolean);
    
    setCuisines(restaurants);
    setFilteredCuisines(restaurants);
    setLoading(false);
  };

  const filterAndSortCuisines = () => {
    let filtered = [...cuisines];
    
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    
    setFilteredCuisines(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (loading) {
    return <div className="loading">Loading restaurants...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Home - FoodOrder | Order Food Online</title>
        <meta name="description" content="Order delicious food from your favorite restaurants. Browse cuisines from around the world." />
      </Helmet>
      
      <div className="home-container">
        <div className="hero-section">
          <h1 className="hero-title">Delicious Food, Delivered Fast 🚀</h1>
          <p className="hero-subtitle">Order from the best restaurants in your area</p>
        </div>
        
        <div className="search-section">
          <SearchBar onSearch={handleSearch} />
          
          <div className="filter-section">
            <label htmlFor="sort">Sort by:</label>
            <select 
              id="sort"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Restaurant Name</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
        
        <div className="results-info">
          <h2>Available Restaurants ({filteredCuisines.length})</h2>
        </div>
        
        {filteredCuisines.length === 0 ? (
          <div className="no-results">
            <p>😕 No restaurants found matching "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="btn btn-primary">
              Clear Search
            </button>
          </div>
        ) : (
          <div className="restaurant-grid">
            {filteredCuisines.map((restaurant) => (
              <Link 
                key={restaurant.id} 
                to={`/restaurant/${restaurant.cuisine}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <RestaurantCard restaurant={restaurant} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;