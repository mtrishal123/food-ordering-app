import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import './OrderHistory.css';

function OrderHistory() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newOrder, setNewOrder] = useState(null);
    
  useEffect(() => {
    loadOrders();
    
    // Check if redirected from checkout with new order
    if (location.state?.newOrder) {
      setNewOrder(location.state.newOrder);
      setShowSuccessMessage(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      // Clear location state
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const loadOrders = useCallback(() => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = allOrders.filter(order => order.userId === user.id);
    
    // Sort by date, newest first
    userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    setOrders(userOrders);
  }, [user.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'preparing':
        return '#ff9800';
      case 'delivered':
        return '#2196f3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  if (orders.length === 0 && !showSuccessMessage) {
    return (
      <>
        <Helmet>
          <title>Order History - FoodOrder</title>
          <meta name="description" content="View your past food orders" />
        </Helmet>
        
        <div className="order-history-container">
          <h1 className="page-title">Order History</h1>
          <div className="no-orders">
            <p>📦 You haven't placed any orders yet</p>
            <p className="no-orders-subtitle">Start ordering delicious food now!</p>
            <a href="/" className="btn btn-primary">Browse Restaurants</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order History - FoodOrder</title>
        <meta name="description" content="View your past food orders" />
      </Helmet>
      
      <div className="order-history-container">
        <h1 className="page-title">Order History</h1>
        
        {showSuccessMessage && newOrder && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <div className="success-content">
              <h2>Order Placed Successfully! 🎉</h2>
              <p>Order ID: {newOrder.id}</p>
              <p>Estimated delivery: {formatDate(newOrder.estimatedDelivery)}</p>
              <p className="success-amount">Total: ${newOrder.totalPrice}</p>
            </div>
          </div>
        )}
        
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3 className="order-id">Order #{order.id}</h3>
                  <p className="order-date">{formatDate(order.orderDate)}</p>
                </div>
                <div 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.toUpperCase()}
                </div>
              </div>
              
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.strMealThumb} 
                      alt={item.strMeal}
                      className="order-item-image"
                    />
                    <div className="order-item-details">
                      <p className="order-item-name">{item.strMeal}</p>
                      <p className="order-item-restaurant">{item.restaurant}</p>
                      <p className="order-item-quantity">Qty: {item.quantity}</p>
                    </div>
                    <div className="order-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <div className="order-delivery-info">
                  <p><strong>Delivery Address:</strong></p>
                  <p>{order.deliveryAddress}</p>
                  <p><strong>Phone:</strong> {order.phoneNumber}</p>
                  {order.specialInstructions && (
                    <p><strong>Instructions:</strong> {order.specialInstructions}</p>
                  )}
                </div>
                <div className="order-total">
                  <span>Total:</span>
                  <span className="order-total-amount">${order.totalPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default OrderHistory;