import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
} from 'date-fns';
import { Task, Property, TaskStatus } from '../../types/index.js';
import { tasksApi, propertiesApi } from '../../services/api.js';
import { TaskFormModal } from '../tasks/TaskFormModal.js';
import { TaskDetailModal } from '../tasks/TaskDetailModal.js';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { formatDate, formatCurrency, getDueStatus } from '../../utils/formatters.js';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Filter,
  Check,
  Edit2,
} from 'lucide-react';

interface CalendarViewProps {
  onSelectTask?: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectTask }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 19)); // Matches system context Oct 2026
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected date modal state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reschedulingTaskId, setReschedulingTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');

  // Modals
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [createForDate, setCreateForDate] = useState<string | undefined>(undefined);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll({
        property: propertyFilter !== 'all' ? propertyFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('[Calendar] Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    propertiesApi.getAll().then((res) => {
      if (res.success) setProperties(res.properties);
    });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [propertyFilter, statusFilter]);

  // Month navigation
  const prevPeriod = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const nextPeriod = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date(2026, 9, 19));
  };

  // Helper to find tasks on a given date (matching either dueDate or startDate)
  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((t) => {
      const due = t.dueDate ? t.dueDate.split('T')[0] : '';
      const start = t.startDate ? t.startDate.split('T')[0] : '';
      return due === dateStr || start === dateStr;
    });
  };

  // Reschedule handler
  const handleReschedule = async (taskId: string) => {
    if (!newDueDate) return;
    try {
      await tasksApi.update(taskId, (() => {
        const fd = new FormData();
        fd.append('dueDate', newDueDate);
        return fd;
      })());
      setReschedulingTaskId(null);
      setNewDueDate('');
      await fetchTasks();
    } catch (err) {
      console.error('Failed to reschedule task:', err);
    }
  };

  const handleQuickComplete = async (taskId: string) => {
    try {
      await tasksApi.updateStatus(taskId, {
        status: 'completed',
        notes: 'Completed from Calendar view',
      });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  // Generate days for monthly view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Generate days for weekly view
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="space-y-6">
      {/* Top Header Bar: Month/Week Navigation & View Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Month / Year Display & Navigation */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight min-w-[190px]">
              {format(currentDate, viewMode === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
            </h2>

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={prevPeriod}
                className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={jumpToToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-white text-slate-700 hover:text-slate-900 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextPeriod}
                className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Controls: View Switcher (Month, Week, Day) + Add Task */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setTaskToEdit(null);
                setCreateForDate(format(currentDate, 'yyyy-MM-dd'));
                setIsTaskFormOpen(true);
              }}
            >
              Add Task
            </Button>
          </div>
        </div>

        {/* Filters & Status Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </div>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Properties ({properties.length})</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="not_started">Not Started</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Overdue
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Not Started
            </span>
          </div>
        </div>
      </div>

      {/* Main Calendar View Content */}
      {loading ? (
        <LoadingSpinner label="Loading construction calendar..." fullHeight />
      ) : viewMode === 'month' ? (
        /* ================= MONTH VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center text-xs font-bold text-slate-600 py-2.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Grid of Days */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {calendarDays.map((day, idx) => {
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const today = isToday(day);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 transition-all cursor-pointer hover:bg-brand-50/20 flex flex-col justify-between ${
                    !isCurrentMonth ? 'bg-slate-50/50 text-slate-300' : 'bg-white'
                  }`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        today
                          ? 'bg-brand-600 text-white shadow-xs'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Pills on Date */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map((task) => {
                      const dueInfo = getDueStatus(task.dueDate, task.status);
                      let pillClass = 'bg-slate-100 text-slate-700 border-slate-200';
                      if (task.status === 'completed') {
                        pillClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      } else if (dueInfo.isOverdue) {
                        pillClass = 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
                      } else if (task.status === 'in_progress') {
                        pillClass = 'bg-blue-50 text-blue-800 border-blue-200';
                      }

                      return (
                        <div
                          key={task._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTaskDetail(task);
                          }}
                          className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded border truncate transition-opacity hover:opacity-80 font-medium ${pillClass}`}
                          title={`${task.taskName} (${(task.property as any)?.name || 'Property'})`}
                        >
                          {task.taskName}
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <p className="text-[10px] font-semibold text-brand-600 pl-1">
                        +{dayTasks.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'week' ? (
        /* ================= WEEK VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 divide-x divide-slate-200 bg-slate-50/70 text-center py-2.5">
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="px-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 mt-1 rounded-full text-xs font-bold ${
                    isToday(day) ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-800'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[480px]">
            {weekDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className="p-2 space-y-2 hover:bg-slate-50/40 transition-colors cursor-pointer"
                >
                  {dayTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTaskDetail(task);
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-brand-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge status={task.status} size="sm" />
                        <span className="text-[10px] font-bold text-brand-600">
                          {formatCurrency(task.actualCost || 0)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                        {task.taskName}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        {(task.property as any)?.name}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= DAY VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tasks for {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled milestones and deadlines due on this day
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setTaskToEdit(null);
                setCreateForDate(format(currentDate, 'yyyy-MM-dd'));
                setIsTaskFormOpen(true);
              }}
            >
              Add Task for Today
            </Button>
          </div>

          {getTasksForDate(currentDate).length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No tasks scheduled for this day.
            </div>
          ) : (
            <div className="space-y-3">
              {getTasksForDate(currentDate).map((task) => (
                <div
                  key={task._id}
                  onClick={() => setActiveTaskDetail(task)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-400 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge status={task.status} size="sm" />
                      <Badge priority={task.priority} size="sm" />
                      <Badge category={task.category} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{task.taskName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Property: <strong>{(task.property as any)?.name}</strong> • Contractor: {task.assignedWorker}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickComplete(task._id);
                      }}
                      disabled={task.status === 'completed'}
                    >
                      ✓ Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Date Detail Modal (When clicking any date in month/week view) */}
      <Modal
        isOpen={Boolean(selectedDate)}
        onClose={() => {
          setSelectedDate(null);
          setReschedulingTaskId(null);
        }}
        title={selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Date Tasks'}
        subtitle="Manage, reschedule, and complete tasks for this date."
        maxWidth="2xl"
      >
        {selectedDate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {getTasksForDate(selectedDate).length} Scheduled Task(s)
              </span>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setTaskToEdit(null);
                  setCreateForDate(format(selectedDate, 'yyyy-MM-dd'));
                  setIsTaskFormOpen(true);
                }}
              >
                Add Task for this Date
              </Button>
            </div>

            {getTasksForDate(selectedDate).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No tasks currently scheduled on this date.
              </p>
            ) : (
              <div className="space-y-3">
                {getTasksForDate(selectedDate).map((task) => (
                  <div
                    key={task._id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge status={task.status} size="sm" />
                        <Badge priority={task.priority} size="sm" />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {task.taskName}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {formatCurrency(task.actualCost || 0)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Property: <strong>{(task.property as any)?.name}</strong> • Assigned: {task.assignedWorker}
                    </p>

                    {/* Reschedule inline form if active */}
                    {reschedulingTaskId === task._id ? (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="text-xs rounded border border-slate-300 py-1 px-2"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleReschedule(task._id)}
                        >
                          Save Date
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReschedulingTaskId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReschedulingTaskId(task._id);
                            setNewDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={task.status === 'completed'}
                          onClick={() => handleQuickComplete(task._id)}
                        >
                          ✓ Mark Complete
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setActiveTaskDetail(task);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Task Form Modal for Calendar */}
      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setTaskToEdit(null);
          setCreateForDate(undefined);
        }}
        onSaved={fetchTasks}
        taskToEdit={taskToEdit}
        initialDate={createForDate}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={Boolean(activeTaskDetail)}
        onClose={() => setActiveTaskDetail(null)}
        task={activeTaskDetail}
        onEdit={(t) => {
          setActiveTaskDetail(null);
          setTaskToEdit(t);
          setIsTaskFormOpen(true);
        }}
        onTaskUpdated={fetchTasks}
      />
    </div>
  );
};
