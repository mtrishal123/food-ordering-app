import './RestaurantCard.css';

function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">
      <div className="restaurant-image-container">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="restaurant-image"
        />
        <div className="restaurant-badge">{restaurant.cuisine}</div>
      </div>
      
      <div className="restaurant-info">
        <h3 className="restaurant-name">{restaurant.name}</h3>
        <p className="restaurant-description">{restaurant.description}</p>
        
        <div className="restaurant-footer">
          <div className="restaurant-rating">
            ⭐ {restaurant.rating}
          </div>
          <div className="restaurant-action">
            View Menu →
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;