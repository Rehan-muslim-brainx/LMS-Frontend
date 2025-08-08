import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LogoContext = createContext();

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

export const LogoProvider = ({ children }) => {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/assets/logo');
      
      if (response.data && response.data.data) {
        setLogo(response.data.data);
      } else {
        // Fallback to default logo if none found
        setLogo('/images/brainx-logo.png');
      }
    } catch (err) {
      console.error('Error fetching logo:', err);
      setError('Failed to load logo');
      // Fallback to default logo
      setLogo('/images/brainx-logo.png');
    } finally {
      setLoading(false);
    }
  };

  const updateLogo = async (logoData) => {
    try {
      const response = await axios.put('/api/assets/logo', { logoData });
      
      if (response.data && response.data.data) {
        setLogo(response.data.data);
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating logo:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update logo' };
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  const value = {
    logo,
    loading,
    error,
    fetchLogo,
    updateLogo
  };

  return (
    <LogoContext.Provider value={value}>
      {children}
    </LogoContext.Provider>
  );
}; 