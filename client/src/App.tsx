import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { Sidebar, TabKey } from './components/layout/Sidebar.js';
import { TopHeader } from './components/layout/TopHeader.js';
import { DashboardView } from './components/dashboard/DashboardView.js';
import { OwnersView } from './components/owners/OwnersView.js';
import { PropertiesView } from './components/properties/PropertiesView.js';
import { TasksView } from './components/tasks/TasksView.js';
import { CalendarView } from './components/calendar/CalendarView.js';
import { RemindersView } from './components/reminders/RemindersView.js';
import { ReportsView } from './components/reports/ReportsView.js';
import { TaskFormModal } from './components/tasks/TaskFormModal.js';
import { PropertyFormModal } from './components/properties/PropertyFormModal.js';
import { OwnerFormModal } from './components/owners/OwnerFormModal.js';
import { LoginModal } from './components/auth/LoginModal.js';
import { HardHat, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Quick Action Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Navigation state passed between tabs
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const { isAuthenticated, loading } = useAuth();

  const handleSelectTaskFromAnywhere = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveTab('tasks');
  };

  const handleViewPropertyFromOwner = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setActiveTab('properties');
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsLoginModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Loading KAILASH BHAWAN...</p>
      </div>
    );
  }

  // If not logged in, show secure login/registration portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/25">
            <HardHat className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            KAILASH BHAWAN
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-4">
            Construction & Property Management
          </p>

          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Sign in or create your private account. All house owner details, properties, construction progress, calendar tasks, reminders, and reports are permanently saved to your account.
          </p>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real database records preserved forever for your account</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero default or dummy data — only what you enter</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Role-based access & encrypted credentials</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="w-full py-3 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => openAuth('register')}
              className="w-full py-3 px-5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all border border-slate-700/80"
            >
              Create New Account
            </button>
          </div>
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedTaskId(null);
          setSelectedPropertyId(null);
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenLoginModal={() => openAuth('login')}
      />

      {/* Main App Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Sticky Top Header */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onQuickAddOwner={() => setIsOwnerModalOpen(true)}
          onQuickAddProperty={() => setIsPropertyModalOpen(true)}
          onQuickAddTask={() => setIsTaskModalOpen(true)}
          onSelectTask={handleSelectTaskFromAnywhere}
          onOpenLoginModal={() => openAuth('login')}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddTask={() => setIsTaskModalOpen(true)}
              onOpenAddProperty={() => setIsPropertyModalOpen(true)}
              onOpenAddOwner={() => setIsOwnerModalOpen(true)}
              onSelectTask={handleSelectTaskFromAnywhere}
            />
          )}

          {activeTab === 'owners' && (
            <OwnersView
              onViewProperty={handleViewPropertyFromOwner}
            />
          )}

          {activeTab === 'properties' && (
            <PropertiesView
              onAddTaskForProperty={(propId) => {
                setSelectedPropertyId(propId);
                setIsTaskModalOpen(true);
              }}
              onSelectTask={handleSelectTaskFromAnywhere}
              selectedPropertyId={selectedPropertyId}
              onClearSelectedProperty={() => setSelectedPropertyId(null)}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              selectedTaskId={selectedTaskId}
              onClearSelectedTaskId={() => setSelectedTaskId(null)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView onSelectTask={handleSelectTaskFromAnywhere} />
          )}

          {activeTab === 'reminders' && <RemindersView />}

          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Quick Action Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaved={() => {}}
        initialPropertyId={selectedPropertyId || undefined}
      />

      <PropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSaved={() => {}}
      />

      <OwnerFormModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        onSaved={() => {}}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
