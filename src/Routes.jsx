import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <RouterRoutes location={location} key={location?.pathname}>
        {/* Define your route here */}
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
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </AnimatePresence>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <AnimatedRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;