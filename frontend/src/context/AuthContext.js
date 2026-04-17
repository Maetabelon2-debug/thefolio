// frontend/src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on app load
    const token = localStorage.getItem('token');
    console.log('Loading - Token found:', !!token);
    
    if (token) {
      // Verify token and get user data
      API.get('/auth/me')
        .then(res => {
          console.log('User loaded from token:', res.data);
          setUser(res.data);
        })
        .catch(err => {
          console.error('Error loading user:', err);
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log('Login function called');
    try {
      const { data } = await API.post('/auth/login', { email, password });
      console.log('Login response:', data);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        console.log('User set in context:', data.user);
        return data.user;
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');  // Remove token from storage
    setUser(null);                      // Clear user from state
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};