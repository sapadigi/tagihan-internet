import React from 'react';
import { useAuth } from './AuthProvider';

const ProtectedRoute = ({ children, requireAuth = true, requireFieldBilling = false }) => {
  const { isAuthenticated, isFieldBillingUnlocked, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If this route requires admin authentication
  if (requireAuth && !isAuthenticated) {
    return null; // This will be handled by the main App component
  }

  // If this route requires field billing unlock
  if (requireFieldBilling && !isFieldBillingUnlocked) {
    return null; // This will be handled by the main App component
  }

  return children;
};

export default ProtectedRoute;
