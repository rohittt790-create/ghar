import React, { useState, useEffect } from 'react';
import { Reminder } from '../../types/index.js';
import { remindersApi } from '../../services/api.js';
import { ReminderFormModal } from './ReminderFormModal.js';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { EmptyState } from '../common/EmptyState.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { formatDate, formatTime } from '../../utils/formatters.js';
import {
  BellRing,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  Check,
  X,
  Trash2,
  Send,
  ShieldCheck,
  Smartphone,
  Mail,
  Globe,
  QrCode,
} from 'lucide-react';

interface RemindersViewProps {
  onOpenPaymentModal?: (data?: { amount?: number; propertyName?: string; taskName?: string }) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ onOpenPaymentModal }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    browserPermission,
    requestBrowserPermission,
    sendBrowserNotification,
    refreshAlerts,
    overdueTasks,
    upcomingTasks,
  } = useNotifications();

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await remindersApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error('[Reminders] Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, status: 'sent' | 'dismissed') => {
    try {
      await remindersApi.updateStatus(id, status);
      await fetchReminders();
      await refreshAlerts();
    } catch (err) {
      console.error('Failed to update reminder status:', err);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await remindersApi.delete(id);
      await fetchReminders();
      await refreshAlerts();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const handleTestBrowserAlert = () => {
    sendBrowserNotification('KAILASH BHAWAN Test Notification', {
      body: 'Browser notification system is operational and active!',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Browser Notification Status Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/10 text-white shrink-0">
            <BellRing className="w-6 h-6 text-brand-300" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              Browser Push Notifications
              {browserPermission === 'granted' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Active & Granted
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Permission Needed
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Get immediate alerts for upcoming contractor deadlines and overdue inspection items.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {browserPermission !== 'granted' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={requestBrowserPermission}
              className="bg-brand-500 hover:bg-brand-400 text-white shadow"
            >
              Enable Browser Alerts
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestBrowserAlert}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Test Alert
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsFormOpen(true)}
          >
            New Reminder
          </Button>
        </div>
      </div>

      {/* Overdue Tasks Alert Panel (as specified in requirements) */}
      {overdueTasks.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-bold text-rose-950">
                Active Overdue Work Items ({overdueTasks.length})
              </h4>
            </div>
            <span className="text-xs text-rose-700 font-medium">Automatic system watch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueTasks.map((t) => (
              <div
                key={t._id}
                className="bg-white p-3 rounded-xl border border-rose-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-1.5 py-0.5 rounded">
                      Overdue
                    </span>
                    <Badge priority={t.priority} size="sm" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 truncate">{t.taskName}</h5>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Property: {(t.property as any)?.name}
                  </p>
                </div>
                <p className="text-[11px] text-rose-600 font-semibold mt-2 pt-1 border-t border-slate-100">
                  Due {formatDate(t.dueDate)} • {t.assignedWorker}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Reminders List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Configured Reminders</h3>
            <p className="text-xs text-slate-500">
              Scheduled notifications with deduplication protection
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'sent', label: 'Sent' },
              { key: 'dismissed', label: 'Dismissed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading reminders..." />
        ) : reminders.length === 0 ? (
          <EmptyState
            icon={<BellRing className="w-10 h-10" />}
            title="No reminders found"
            description="Create automated reminders for inspections, contractor milestone sign-offs, and critical payments."
            actionLabel="Create Reminder"
            onAction={() => setIsFormOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {reminders.map((rem) => {
              const propObj = typeof rem.property === 'object' ? rem.property : null;
              const taskObj = typeof rem.task === 'object' ? rem.task : null;

              return (
                <div
                  key={rem._id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-100">
                        {rem.type.replace('_', ' ')}
                      </span>
                      <Badge priority={rem.priority} size="sm" />
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          rem.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rem.status === 'dismissed'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rem.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{rem.title}</h4>
                    {rem.description && (
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{rem.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        {formatDate(rem.reminderDate)} at {formatTime(rem.reminderTime)}
                      </span>

                      {propObj?.name && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {propObj.name}
                        </span>
                      )}

                      {/* Channel icons */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Channels:</span>
                        {rem.channels?.includes('browser') && (
                          <span title="Browser Push" className="text-brand-600">
                            <Globe className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {rem.channels?.includes('email') && (
                          <span title="Email" className="text-purple-600">
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {rem.channels?.includes('whatsapp') && (
                          <span title="WhatsApp" className="text-emerald-600">
                            <Smartphone className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {rem.type === 'payment' && onOpenPaymentModal && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-xs"
                        onClick={() =>
                          onOpenPaymentModal({
                            propertyName: propObj?.name,
                            taskName: taskObj?.taskName || rem.title,
                          })
                        }
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Pay via QR
                      </Button>
                    )}

                    {rem.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(rem._id, 'sent')}
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Mark Sent
                      </Button>
                    )}

                    {rem.status !== 'dismissed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(rem._id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    )}

                    <button
                      onClick={() => handleDeleteReminder(rem._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reminder Form Modal */}
      <ReminderFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchReminders}
      />
    </div>
  );
};
