import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Attempt login
    const result = login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - FoodOrder</title>
        <meta name="description" content="Login to your FoodOrder account to place orders" />
      </Helmet>
      
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back! 🍕</h1>
          <p className="auth-subtitle">Login to your account</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="auth-link-text">
            Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
          </p>
          
          <div className="demo-credentials">
            <p><strong>Demo Account:</strong></p>
            <p>Email: demo@food.com</p>
            <p>Password: demo123</p>
            <p className="demo-note">(You need to sign up first with these credentials)</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;