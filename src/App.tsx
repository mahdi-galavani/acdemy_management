import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CourseDetailModal } from './components/CourseDetailModal';
import { ProductOrderModal } from './components/ProductOrderModal';
import { CartDrawer } from './components/CartDrawer';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' ? <LandingPage /> : <AdminDashboard />}
      </main>

      {/* Shared Modals and Drawers */}
      <CourseDetailModal />
      <ProductOrderModal />
      <CartDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
