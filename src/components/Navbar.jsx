import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useWallet } from '../context/WalletContext';
import { useMessaging } from '../context/MessagingContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { balance } = useWallet();
  const { unreadCount } = useMessaging();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🍔 FoodOrder
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          
          {user && (
            <>
              <li className="navbar-item">
                <Link to="/orders" className="navbar-link">My Orders</Link>
              </li>
              <li className="navbar-item">
                <Link to="/messages" className="navbar-link cart-link">
                  💬 Messages 
                  {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
                </Link>
              </li>
            </>
          )}
          
          <li className="navbar-item">
            <Link to="/checkout" className="navbar-link cart-link">
              🛒 Cart {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </Link>
          </li>
          
          {user ? (
            <>
              <li className="navbar-item navbar-user-dropdown">
                <span className="navbar-user">Hi, {user.name}</span>
                <div className="wallet-dropdown">
                  <div className="wallet-balance">
                    💰 Wallet: ${balance.toFixed(2)}
                  </div>
                  <Link to="/wallet" className="wallet-link">Manage Wallet</Link>
                </div>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-button">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/signup" className="navbar-button">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;