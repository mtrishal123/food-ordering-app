import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      // Don't store password in active user session
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email
      };
      setUser(userSession);
      localStorage.setItem('user', JSON.stringify(userSession));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  // Signup function
  const signup = (name, email, password) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password // In real app, this would be hashed
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login after signup
    const userSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };
    setUser(userSession);
    localStorage.setItem('user', JSON.stringify(userSession));
    
    return { success: true };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}