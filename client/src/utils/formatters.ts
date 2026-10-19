import { format, parseISO, isPast, isToday, differenceInDays } from 'date-fns';
import { TaskStatus, TaskPriority, PropertyStatus } from '../types/index.js';

export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString?: string | Date, formatStr = 'MMM d, yyyy'): string => {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(d, formatStr);
  } catch (e) {
    return String(dateString);
  }
};

export const formatTime = (timeString?: string): string => {
  if (!timeString) return '';
  const [hour, min] = timeString.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${min} ${ampm}`;
};

export const getDueStatus = (dueDateStr?: string, status?: TaskStatus): {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
  daysRemaining: number;
} => {
  if (!dueDateStr || status === 'completed') {
    return { label: '', isOverdue: false, isDueToday: false, daysRemaining: 0 };
  }

  const d = parseISO(dueDateStr);
  const overdue = isPast(d) && !isToday(d);
  const dueToday = isToday(d);
  const days = differenceInDays(d, new Date());

  let label = '';
  if (overdue) {
    label = `${Math.abs(days)}d overdue`;
  } else if (dueToday) {
    label = 'Due today';
  } else if (days === 1) {
    label = 'Due tomorrow';
  } else {
    label = `${days}d left`;
  }

  return {
    label,
    isOverdue: overdue,
    isDueToday: dueToday,
    daysRemaining: days,
  };
};

export const getStatusConfig = (status: TaskStatus | PropertyStatus | string) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'not_started':
      return {
        label: 'Not Started',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        dot: 'bg-slate-400',
      };
    case 'on_hold':
      return {
        label: 'On Hold',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'planning':
      return {
        label: 'Planning',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    default:
      return {
        label: String(status).replace('_', ' '),
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
      };
  }
};

export const getPriorityConfig = (priority: TaskPriority | string) => {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Urgent',
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        border: 'border-rose-300',
      };
    case 'high':
      return {
        label: 'High',
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
      };
    case 'medium':
      return {
        label: 'Medium',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
      };
    case 'low':
      return {
        label: 'Low',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
      };
    default:
      return {
        label: String(priority),
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
      };
  }
};
