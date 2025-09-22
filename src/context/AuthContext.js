import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    
    if (token && adminData) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(adminData));
    }
  }, []);

  const login = (adminData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setIsAuthenticated(true);
    setAdmin(adminData);
    navigate('/admin/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdmin(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};