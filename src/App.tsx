import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from './components/ui/Toast';

// Landing & Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Passenger Pages
import PassengerDashboard from './pages/passenger/Dashboard';
import BookRidePage from './pages/passenger/BookRide';
import ActiveRidePage from './pages/passenger/ActiveRide';
import RideHistoryPage from './pages/passenger/RideHistory';
import PaymentMethodsPage from './pages/passenger/PaymentMethods';
import WalletPage from './pages/passenger/Wallet';
import PromoCodesPage from './pages/passenger/PromoCodes';
import PassengerProfilePage from './pages/passenger/Profile';

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverEarnings from './pages/driver/Earnings';
import VehicleManagement from './pages/driver/VehicleManagement';
import DriverProfile from './pages/driver/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import RideMonitoring from './pages/admin/RideMonitoring';
import AnalyticsPage from './pages/admin/Analytics';
import PromoManagement from './pages/admin/PromoManagement';
import IncidentManagement from './pages/admin/IncidentManagement';

import { useAuthStore } from './stores/authStore';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Passenger Routes */}
        <Route
          path="/passenger/dashboard"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <PassengerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/book-ride"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <BookRidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/active-ride"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <ActiveRidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/rides"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <RideHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/payments"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <PaymentMethodsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/wallet"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/promos"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <PromoCodesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger/profile"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <PassengerProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Driver Routes */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/earnings"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverEarnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/vehicles"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <VehicleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/profile"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rides"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RideMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/promos"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PromoManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/incidents"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <IncidentManagement />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
