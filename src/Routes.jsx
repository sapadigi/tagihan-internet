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
      {/* Public routes */}
      <Route path="/field-billing" element={<FieldBillingPage />} />
      
      {/* Protected routes - require admin login */}
      {isAuthenticated ? (
        <>
          <Route path="/" element={
            <ProtectedRoute requireAuth={true}>
              <AdministrativeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/administrative-dashboard" element={
            <ProtectedRoute requireAuth={true}>
              <AdministrativeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute requireAuth={true}>
              <CustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute requireAuth={true}>
              <BillingPage />
            </ProtectedRoute>
          } />
          <Route path="/cash-management" element={
            <ProtectedRoute requireAuth={true}>
              <CashManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute requireAuth={true}>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/equipment" element={
            <ProtectedRoute requireAuth={true}>
              <EquipmentPage />
            </ProtectedRoute>
          } />
          <Route path="/whatsapp-settings" element={
            <ProtectedRoute requireAuth={true}>
              <WhatsAppSettingsPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <ProtectedRoute requireAuth={true}>
              <NotFound />
            </ProtectedRoute>
          } />
        </>
      ) : (
        // If not authenticated, show login for all protected routes
        <Route path="*" element={<LoginPage />} />
      )}
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