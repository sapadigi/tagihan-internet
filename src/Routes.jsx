import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { useAuth } from "./components/AuthProvider";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import AdministrativeDashboard from './pages/administrative-dashboard';
import CustomersPage from './pages/customers';
import BillingPage from './pages/billing';
import CashManagementPage from './pages/cash-management';
import ReportsPage from './pages/reports';
import EquipmentPage from './pages/equipment';
import WhatsAppSettingsPage from './pages/whatsapp-settings';
import FieldBillingPage from './pages/field-billing';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <RouterRoutes>
      {/* Field Billing - Always available (public with password) */}
      <Route path="/field-billing" element={<FieldBillingPage />} />
      
      {/* Protected routes - require admin login */}
      <Route path="/" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <AdministrativeDashboard />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
      
      <Route path="/administrative-dashboard" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <AdministrativeDashboard />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
      
      <Route path="/customers" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <CustomersPage />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
      
      <Route path="/billing" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <BillingPage />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
      
      <Route path="/cash-management" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <CashManagementPage />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
      
      <Route path="/reports" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <ReportsPage />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
      
      <Route path="/equipment" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <EquipmentPage />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
      
      <Route path="/whatsapp-settings" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <WhatsAppSettingsPage />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
      
      {/* Catch all route */}
      <Route path="*" element={
        isAuthenticated ? (
          <ProtectedRoute requireAuth={true}>
            <NotFound />
          </ProtectedRoute>
        ) : (
          <LoginPage />
        )
      } />
    </RouterRoutes>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;