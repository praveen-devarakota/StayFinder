import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error('Error parsing stored admin auth:', err);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      }
    }
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        email,
        password,
      });

      const userData = {
        userId: res.data.userId,
        username: res.data.username,
        email: res.data.email,
        role: res.data.role,
      };

      // Only allow admin users
      if (userData.role !== 'admin') {
        throw new Error('Access denied. Only admins can log in.');
      }

      localStorage.setItem('adminUser', JSON.stringify(userData));
      localStorage.setItem('adminToken', res.data.token);
      setUser(userData);
      setToken(res.data.token);

      return true;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    setUser(null);
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
