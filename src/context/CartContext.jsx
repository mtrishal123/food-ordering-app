import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  
  const [cart, setCart] = useLocalStorage('cart', []);

  // Add item to cart
  const addToCart = (meal, restaurantName) => {
    const existingItem = cart.find(item => item.idMeal === meal.idMeal);
    
    if (existingItem) {
      // Increase quantity if item already in cart
      setCart(cart.map(item =>
        item.idMeal === meal.idMeal
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item to cart
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

  // Remove item from cart
  const removeFromCart = (mealId) => {
    setCart(cart.filter(item => item.idMeal !== mealId));
  };

  // Update item quantity
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

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Calculate total items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Generate consistent price based on meal name
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