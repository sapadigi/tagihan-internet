import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFieldBillingUnlocked, setIsFieldBillingUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('billing_auth');
    const fieldBillingStatus = localStorage.getItem('field_billing_auth');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    
    if (fieldBillingStatus === 'true') {
      setIsFieldBillingUnlocked(true);
    }
    
    setLoading(false);
  }, []);

  // Admin login credentials
  const adminCredentials = {
    username: 'admin',
    password: '@Ciamis2021'
  };

  // Field billing password
  const fieldBillingPassword = '123';

  const login = (username, password) => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setIsAuthenticated(true);
      localStorage.setItem('billing_auth', 'true');
      return { success: true, message: 'Login berhasil!' };
    }
    return { success: false, message: 'Username atau password salah!' };
  };

  const unlockFieldBilling = (password) => {
    if (password === fieldBillingPassword) {
      setIsFieldBillingUnlocked(true);
      localStorage.setItem('field_billing_auth', 'true');
      return { success: true, message: 'Akses field billing dibuka!' };
    }
    return { success: false, message: 'Password salah!' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('billing_auth');
  };

  const lockFieldBilling = () => {
    setIsFieldBillingUnlocked(false);
    localStorage.removeItem('field_billing_auth');
  };

  const value = {
    isAuthenticated,
    isFieldBillingUnlocked,
    loading,
    login,
    logout,
    unlockFieldBilling,
    lockFieldBilling
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
