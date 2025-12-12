import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderHistory from './pages/OrderHistory';
import Wallet from './pages/Wallet';
import Messages from './pages/Messages';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WalletProvider } from './context/WalletContext';
import { MessagingProvider } from './context/MessagingContext';
import MessagingWidget from './components/MessagingWidget';
import './App.css';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <WalletProvider>
          <MessagingProvider>
            <CartProvider>
              <Router>
                <div className="App">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/restaurant/:cuisine" element={<RestaurantDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/orders" 
                      element={
                        <ProtectedRoute>
                          <OrderHistory />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/wallet" 
                      element={
                        <ProtectedRoute>
                          <Wallet />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/messages" 
                      element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                  <MessagingWidget />
                </div>
              </Router>
            </CartProvider>
          </MessagingProvider>
        </WalletProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;