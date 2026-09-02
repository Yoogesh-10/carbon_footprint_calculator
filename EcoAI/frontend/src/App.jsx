import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CarbonForm from './pages/CarbonForm';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import CarbonTwin from './pages/CarbonTwin';
import BillScanner from './pages/BillScanner';
import HabitImpact from './pages/HabitImpact';
import CarbonExperimentPage from './pages/CarbonExperimentPage';
import TradeoffAnalyzer from './pages/TradeoffAnalyzer';
import OnboardingWizard from './pages/OnboardingWizard';
import PrivacyCenterPage from './pages/PrivacyCenterPage';
import OrgDashboard from './pages/OrgDashboard';

function MainApp() {
  const [activeTab, setActiveTab] = useState('landing');

  const isAdminView = activeTab === 'admin' || activeTab === 'org_dashboard';

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#16A66A] selection:text-white eco-bg-pattern">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow">
        {activeTab === 'landing' && <LandingPage setActiveTab={setActiveTab} />}
        {activeTab === 'auth' && <AuthPage setActiveTab={setActiveTab} />}
        {activeTab === 'onboarding' && <OnboardingWizard setActiveTab={setActiveTab} />}
        {activeTab === 'calculator' && <CarbonForm setActiveTab={setActiveTab} />}
        {(activeTab === 'dashboard' || activeTab === 'view_breakdown' || activeTab === 'open_challenge' || activeTab === 'view_prediction' || activeTab === 'view_budget') && <Dashboard setActiveTab={setActiveTab} />}
        {(activeTab === 'twin' || activeTab === 'carbon_twin' || activeTab === 'run_twin') && <CarbonTwin setActiveTab={setActiveTab} />}
        {activeTab === 'habit' && <HabitImpact />}
        {activeTab === 'experiment' && <CarbonExperimentPage />}
        {activeTab === 'tradeoff' && <TradeoffAnalyzer />}
        {activeTab === 'scanner' && <BillScanner setActiveTab={setActiveTab} />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'profile' && <ProfilePage setActiveTab={setActiveTab} />}
        {activeTab === 'privacy' && <PrivacyCenterPage />}
        {activeTab === 'org_dashboard' && <OrgDashboard />}
        {activeTab === 'admin' && <AdminPanel setActiveTab={setActiveTab} />}
      </main>

      {/* Footer rendered only when outside admin / org portal */}
      {!isAdminView && (
        <Footer setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
