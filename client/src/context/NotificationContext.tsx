import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Reminder, Task } from '../types/index.js';
import { remindersApi } from '../services/api.js';

interface NotificationContextType {
  pendingReminders: Reminder[];
  overdueTasks: Task[];
  upcomingTasks: Task[];
  totalAlerts: number;
  browserPermission: NotificationPermission;
  requestBrowserPermission: () => Promise<boolean>;
  sendBrowserNotification: (title: string, options?: NotificationOptions) => void;
  refreshAlerts: () => Promise<void>;
  dismissReminder: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [totalAlerts, setTotalAlerts] = useState<number>(0);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  const requestBrowserPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        new Notification('KAILASH BHAWAN Notifications Enabled', {
          body: 'You will receive timely alerts for upcoming construction deadlines and overdue tasks.',
          icon: '/favicon.ico',
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('[Notification] Error requesting permission:', e);
      return false;
    }
  };

  const sendBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          ...options,
        });
      } catch (e) {
        console.error('[Notification] Failed to send desktop notification:', e);
      }
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    const token = localStorage.getItem('hometrack_token');
    if (!token) {
      setPendingReminders([]);
      setOverdueTasks([]);
      setUpcomingTasks([]);
      setTotalAlerts(0);
      return;
    }
    try {
      const data = await remindersApi.getActiveAlerts();
      if (data.success) {
        setPendingReminders(data.pendingReminders || []);
        setOverdueTasks(data.overdueTasks || []);
        setUpcomingTasks(data.upcomingTasks || []);
        setTotalAlerts(data.totalAlerts || 0);

        // Check for new overdue tasks and trigger browser notification if allowed and not already alerted
        const notifiedKey = 'hometrack_notified_alerts';
        const notifiedList: string[] = JSON.parse(localStorage.getItem(notifiedKey) || '[]');
        const currentNotified = new Set(notifiedList);

        if (Notification.permission === 'granted') {
          // Alert on critical overdue items
          data.overdueTasks?.forEach((task) => {
            const key = `overdue-${task._id}`;
            if (!currentNotified.has(key)) {
              sendBrowserNotification(`⚠️ Overdue Task Alert: ${task.taskName}`, {
                body: `Task was due on ${task.dueDate.split('T')[0]}. Assigned to: ${task.assignedWorker}.`,
              });
              currentNotified.add(key);
            }
          });

          // Alert on reminders scheduled for today
          data.pendingReminders?.forEach((rem) => {
            const key = `reminder-${rem._id}`;
            if (!currentNotified.has(key)) {
              sendBrowserNotification(`🔔 Construction Reminder: ${rem.title}`, {
                body: rem.description || `Scheduled for today at ${rem.reminderTime}.`,
              });
              currentNotified.add(key);
            }
          });

          localStorage.setItem(notifiedKey, JSON.stringify(Array.from(currentNotified)));
        }
      }
    } catch (e) {
      console.warn('[Notification] Error polling alerts:', e);
    }
  }, [sendBrowserNotification]);

  const dismissReminder = async (id: string) => {
    try {
      await remindersApi.updateStatus(id, 'dismissed');
      setPendingReminders((prev) => prev.filter((r) => r._id !== id));
      setTotalAlerts((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('[Notification] Error dismissing reminder:', e);
    }
  };

  useEffect(() => {
    refreshAlerts();
    // Poll for alerts every 30 seconds
    const interval = setInterval(refreshAlerts, 30000);
    return () => clearInterval(interval);
  }, [refreshAlerts]);

  return (
    <NotificationContext.Provider
      value={{
        pendingReminders,
        overdueTasks,
        upcomingTasks,
        totalAlerts,
        browserPermission,
        requestBrowserPermission,
        sendBrowserNotification,
        refreshAlerts,
        dismissReminder,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
