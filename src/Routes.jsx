import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

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

export default function Routes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/login-screen" element={<LoginScreen />} />
          <Route path="/registration-screen" element={<RegistrationScreen />} />
          <Route path="/" element={<MainDashboard />} />
          <Route path="/main-dashboard" element={<MainDashboard />} />
          <Route path="/patient-profile" element={<PatientProfile />} />
          <Route path="/patient-profile/:patientId" element={<PatientProfile />} />
          <Route path="/estimate-creation-and-management" element={<EstimateCreationAndManagement />} />
          <Route path="/reports-dashboard" element={<ReportsDashboard />} />
          <Route path="/inpatient-journal" element={<InpatientJournal />} />
          <Route path="/patient-directory" element={<PatientDirectory />} />
          <Route path="/staff-directory" element={<StaffDirectory />} />
          <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}