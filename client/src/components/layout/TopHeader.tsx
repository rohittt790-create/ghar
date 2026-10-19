import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Plus,
  UserPlus,
  Building,
  CheckSquare,
  BellRing,
  LogIn,
  LogOut,
  ChevronDown,
  ShieldCheck,
  User,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown.js';
import { TabKey } from './Sidebar.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface TopHeaderProps {
  activeTab: TabKey;
  onOpenMobileSidebar: () => void;
  onQuickAddOwner: () => void;
  onQuickAddProperty: () => void;
  onQuickAddTask: () => void;
  onSelectTask?: (taskId: string) => void;
  onOpenLoginModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onQuickAddOwner,
  onQuickAddProperty,
  onQuickAddTask,
  onSelectTask,
  onOpenLoginModal,
}) => {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { browserPermission, requestBrowserPermission } = useNotifications();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titles: Record<TabKey, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Construction Overview',
      subtitle: 'Real-time project statuses, progress KPIs, and pending alerts.',
    },
    owners: {
      title: 'House Owners Directory',
      subtitle: 'Manage client accounts, contact details, and assigned properties.',
    },
    properties: {
      title: 'Property Sites',
      subtitle: 'Track build progress, budgets, site photos, and completion schedules.',
    },
    tasks: {
      title: 'Construction Work & Tasks',
      subtitle: 'Manage site tasks, upload progress photos, track history & costs.',
    },
    calendar: {
      title: 'Construction Calendar',
      subtitle: 'Monthly, weekly, and daily timeline of task deadlines and inspections.',
    },
    reminders: {
      title: 'Reminders & Notifications',
      subtitle: 'Configure automated deadline alerts, inspections, and notifications.',
    },
    reports: {
      title: 'Monthly Progress Reports',
      subtitle: 'Analyze actual completion trends, planned vs actual expenses & export PDF.',
    },
  };

  const current = titles[activeTab] || { title: 'KAILASH BHAWAN', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {current.title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5">{current.subtitle}</p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desktop notification alert prompt if not enabled */}
        {browserPermission === 'default' && (
          <button
            onClick={requestBrowserPermission}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-600" />
            Enable Desktop Alerts
          </button>
        )}

        {/* Notifications Dropdown */}
        <NotificationDropdown onSelectTask={onSelectTask} />

        {/* Quick Add Menu */}
        <div className="relative">
          <button
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {quickMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setQuickMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onQuickAddTask();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2.5 transition-colors"
                >
                  <CheckSquare className="w-4 h-4 text-brand-500" />
                  New Task
                </button>
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onQuickAddProperty();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2.5 transition-colors"
                >
                  <Building className="w-4 h-4 text-emerald-500" />
                  New Property
                </button>
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onQuickAddOwner();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-purple-500" />
                  New Owner
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Account / Sign In Option */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-300"
              />
              <span className="hidden md:inline-block text-xs font-bold text-slate-800 max-w-[120px] truncate">
                {user.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    {user.role?.replace('_', ' ')}
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenLoginModal();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Switch Account
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-xs transition-colors focus:outline-none"
          >
            <LogIn className="w-4 h-4 text-brand-600" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
