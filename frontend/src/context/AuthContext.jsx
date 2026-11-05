import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set the base URL for API requests: use environment variable in production, fallback to localhost
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Interceptor to add the token to every request
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.error('Failed to refresh user', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    return null;
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserCoins = (coins) => {
    setUser((prev) => (prev ? { ...prev, coins } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading,
        api,
        refreshUser,
        updateUserCoins,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
