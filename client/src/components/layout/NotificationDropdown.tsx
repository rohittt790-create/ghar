import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle2, BellRing, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.js';
import { formatDate, formatTime } from '../../utils/formatters.js';

interface NotificationDropdownProps {
  onSelectTask?: (taskId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onSelectTask }) => {
  const {
    pendingReminders,
    overdueTasks,
    upcomingTasks,
    totalAlerts,
    browserPermission,
    requestBrowserPermission,
    dismissReminder,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        title="View Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalAlerts > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[10px] font-bold text-white items-center justify-center">
              {totalAlerts > 9 ? '9+' : totalAlerts}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Notifications & Alerts</h4>
              <p className="text-xs text-slate-500">
                {totalAlerts} active alert{totalAlerts === 1 ? '' : 's'}
              </p>
            </div>
            {browserPermission !== 'granted' && (
              <button
                onClick={requestBrowserPermission}
                className="text-xs text-brand-600 font-semibold hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-md"
              >
                <BellRing className="w-3.5 h-3.5" />
                Enable Desktop Alerts
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {totalAlerts === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">No overdue tasks or pending alerts.</p>
              </div>
            ) : (
              <>
                {/* Overdue Tasks Section */}
                {overdueTasks.map((task) => (
                  <div
                    key={`overdue-${task._id}`}
                    onClick={() => {
                      if (onSelectTask) onSelectTask(task._id);
                      setIsOpen(false);
                    }}
                    className="p-3.5 hover:bg-rose-50/40 transition-colors flex items-start gap-3 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">
                          Overdue Task
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Due {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                        {task.taskName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Assigned: {task.assignedWorker} • {(task.property as any)?.name}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Pending Reminders Section */}
                {pendingReminders.map((reminder) => (
                  <div
                    key={`reminder-${reminder._id}`}
                    className="p-3.5 hover:bg-blue-50/40 transition-colors flex items-start gap-3"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                          {reminder.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400">
                            {formatDate(reminder.reminderDate)} at {formatTime(reminder.reminderTime)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissReminder(reminder._id);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Dismiss reminder"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {reminder.title}
                      </p>
                      {reminder.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {reminder.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Upcoming Tasks Section */}
                {upcomingTasks.map((task) => (
                  <div
                    key={`upcoming-${task._id}`}
                    onClick={() => {
                      if (onSelectTask) onSelectTask(task._id);
                      setIsOpen(false);
                    }}
                    className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                          Due Soon
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                        {task.taskName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {(task.property as any)?.name} • {task.assignedWorker}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
