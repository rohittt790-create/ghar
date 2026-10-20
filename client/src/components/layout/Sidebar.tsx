import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
  CalendarDays,
  BellRing,
  FileBarChart2,
  HardHat,
  LogOut,
  LogIn,
  ShieldCheck,
  Layers,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';

export type TabKey =
  | 'dashboard'
  | 'owners'
  | 'properties'
  | 'structure'
  | 'tasks'
  | 'calendar'
  | 'reminders'
  | 'reports';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenLoginModal?: () => void;
  onOpenPaymentModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  mobileOpen = false,
  onCloseMobile,
  onOpenLoginModal,
  onOpenPaymentModal,
}) => {
  const { user, logout } = useAuth();
  const { totalAlerts } = useNotifications();

  const navItems = [
    {
      key: 'dashboard' as TabKey,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: undefined,
    },
    {
      key: 'owners' as TabKey,
      label: 'House Owners',
      icon: <Users className="w-5 h-5" />,
      badge: undefined,
    },
    {
      key: 'properties' as TabKey,
      label: 'Properties',
      icon: <Building2 className="w-5 h-5" />,
      badge: undefined,
    },
    {
      key: 'structure' as TabKey,
      label: 'House Structure & Rooms',
      icon: <Layers className="w-5 h-5" />,
      badge: undefined,
    },
    {
      key: 'tasks' as TabKey,
      label: 'Tasks & Progress',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: undefined,
    },
    {
      key: 'calendar' as TabKey,
      label: 'Construction Calendar',
      icon: <CalendarDays className="w-5 h-5" />,
      badge: undefined,
    },
    {
      key: 'reminders' as TabKey,
      label: 'Reminders & Alerts',
      icon: <BellRing className="w-5 h-5" />,
      badge: totalAlerts > 0 ? totalAlerts : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      key: 'reports' as TabKey,
      label: 'Monthly Reports',
      icon: <FileBarChart2 className="w-5 h-5" />,
      badge: undefined,
    },
  ];

  const handleNavClick = (key: TabKey) => {
    onTabChange(key);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand Logo & Title */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 truncate">
              KAILASH BHAWAN
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30 shrink-0">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Construction Management</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Instant UPI Payment Action Card */}
        {onOpenPaymentModal && (
          <div className="px-3 pb-3">
            <button
              onClick={onOpenPaymentModal}
              className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border border-amber-500/30 hover:border-amber-400 text-left transition-all group shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 group-hover:scale-105 transition-transform">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">UPI QR Pay</span>
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">Instant</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">Pay via QR Code</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* User Card & Sign In / Sign Out */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {user ? (
            <div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-2">
                <img
                  src={
                    user.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 capitalize truncate">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    {user.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div>
              <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-700/40 mb-2 text-center">
                <p className="text-xs font-semibold text-slate-200">Not Logged In</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Sign in to manage tasks & sites</p>
              </div>

              <button
                onClick={() => {
                  if (onOpenLoginModal) onOpenLoginModal();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
