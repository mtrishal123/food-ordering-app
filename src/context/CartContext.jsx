import { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  
  // Calculate cart key based on user
  const cartKey = useMemo(() => {
    return user ? `cart_${user.id}` : 'cart_guest';
  }, [user]);
  
  // Load cart from localStorage
  const loadCart = () => {
    try {
      const stored = localStorage.getItem(cartKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  };

  const [cart, setCart] = useState(loadCart);

  // Reload cart when cartKey changes (user login/logout)
  useEffect(() => {
    setCart(loadCart());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart, cartKey]);

  const addToCart = (meal, restaurantName) => {
    const existingItem = cart.find(item => item.idMeal === meal.idMeal);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.idMeal === meal.idMeal
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem = {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        price: generatePrice(meal.strMeal),
        quantity: 1,
        restaurant: restaurantName
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (mealId) => {
    setCart(cart.filter(item => item.idMeal !== mealId));
  };

  const updateQuantity = (mealId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    
    setCart(cart.map(item =>
      item.idMeal === mealId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const generatePrice = (mealName) => {
    const basePrice = 8;
    const variation = (mealName.length % 12) + 3;
    return parseFloat((basePrice + variation).toFixed(2));
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}