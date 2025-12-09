import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart({ showCheckoutButton = true }) {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <p>🛒 Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart ({getTotalItems()} items)</h2>
      
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.idMeal} className="cart-item">
            <img 
              src={item.strMealThumb} 
              alt={item.strMeal}
              className="cart-item-image"
            />
            <div className="cart-item-details">
              <h3 className="cart-item-name">{item.strMeal}</h3>
              <p className="cart-item-restaurant">{item.restaurant}</p>
              <p className="cart-item-price">${item.price}</p>
            </div>
            <div className="cart-item-actions">
              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(item.idMeal, item.quantity - 1)}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.idMeal, item.quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.idMeal)}
                className="remove-btn"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="cart-total">
          <span>Total:</span>
          <span className="cart-total-amount">${getTotalPrice()}</span>
        </div>
        
        {showCheckoutButton && (
          <button 
            onClick={() => navigate('/checkout')}
            className="btn btn-primary cart-checkout-btn"
          >
            Proceed to Checkout
          </button>
        )}
      </div>
    </div>
  );
}

export default Cart;