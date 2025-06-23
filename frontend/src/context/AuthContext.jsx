import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Load user and token from localStorage initially
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Check token expiration
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Save user and token to localStorage
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token]);

  // Check token expiration on mount and periodically
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
      navigate('/login');
    }

    const interval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        logout();
        navigate('/login');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token, navigate]);

  // Axios interceptors: attach token to requests, handle 401 errors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, navigate]);

  // Login function accepts email & password, calls backend, sets user & token
  const login = async ({ email, password }) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, { email, password });
      const { token: receivedToken, userId, username, email: userEmail } = res.data;

      console.log('Login response:', res.data);
      console.log('Received token:', receivedToken);

      if (!receivedToken) {
        throw new Error('No token received');
      }

      setUser({ userId, username, email: userEmail });
      setToken(receivedToken);
      
      // Log after setting token
      console.log('Token set in state:', receivedToken);
      console.log('Token in localStorage:', localStorage.getItem('token'));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout clears state and localStorage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using the AuthContext easily
export function useAuth() {
  return useContext(AuthContext);
}
