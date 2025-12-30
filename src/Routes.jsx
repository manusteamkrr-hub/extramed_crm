import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import MainDashboard from './pages/main-dashboard';
import PatientProfile from './pages/patient-profile';
import EstimateCreationAndManagement from './pages/estimate-creation-and-management';
import ReportsDashboard from './pages/reports-dashboard';
import InpatientJournal from './pages/inpatient-journal';
import PatientDirectory from './pages/patient-directory';
import StaffDirectory from './pages/staff-directory';
import AnalyticsDashboard from "./pages/analytics-dashboard";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login-screen" replace />;
  }

  return children;
};

export default function Routes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/login-screen" element={<LoginScreen />} />
          <Route path="/registration-screen" element={<RegistrationScreen />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          } />
          <Route path="/main-dashboard" element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient-profile" element={
            <ProtectedRoute>
              <PatientProfile />
            </ProtectedRoute>
          } />
          <Route path="/patient-profile/:patientId" element={
            <ProtectedRoute>
              <PatientProfile />
            </ProtectedRoute>
          } />
          <Route path="/estimate-creation-and-management" element={
            <ProtectedRoute>
              <EstimateCreationAndManagement />
            </ProtectedRoute>
          } />
          <Route path="/reports-dashboard" element={
            <ProtectedRoute>
              <ReportsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/inpatient-journal" element={
            <ProtectedRoute>
              <InpatientJournal />
            </ProtectedRoute>
          } />
          <Route path="/patient-directory" element={
            <ProtectedRoute>
              <PatientDirectory />
            </ProtectedRoute>
          } />
          <Route path="/staff-directory" element={
            <ProtectedRoute>
              <StaffDirectory />
            </ProtectedRoute>
          } />
          <Route path="/analytics-dashboard" element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
