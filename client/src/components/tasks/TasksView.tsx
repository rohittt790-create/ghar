import React, { useState, useEffect } from 'react';
import { Task, Property, TaskStatus, TaskPriority, TaskCategory } from '../../types/index.js';
import { tasksApi, propertiesApi } from '../../services/api.js';
import { TaskKanbanBoard } from './TaskKanbanBoard.js';
import { TaskFormModal } from './TaskFormModal.js';
import { TaskDetailModal } from './TaskDetailModal.js';
import { Button } from '../common/Button.js';
import { Input } from '../common/Input.js';
import { Badge } from '../common/Badge.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { EmptyState } from '../common/EmptyState.js';
import { formatDate, formatCurrency, getDueStatus } from '../../utils/formatters.js';
import {
  CheckSquare,
  Search,
  Plus,
  Kanban,
  List,
  Filter,
  AlertTriangle,
  Camera,
  Edit2,
  Trash2,
} from 'lucide-react';

interface TasksViewProps {
  initialPropertyId?: string;
  openCreateModalDirectly?: boolean;
  onClearCreateModalTrigger?: () => void;
  selectedTaskId?: string | null;
  onClearSelectedTaskId?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  initialPropertyId,
  openCreateModalDirectly = false,
  onClearCreateModalTrigger,
  selectedTaskId,
  onClearSelectedTaskId,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState(initialPropertyId || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll({
        property: propertyFilter !== 'all' ? propertyFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        overdueOnly: overdueOnly ? 'true' : undefined,
        search: search || undefined,
      });
      if (data.success) {
        setTasks(data.tasks);

        // If an active task is selected in detail modal, update its state
        if (activeTaskDetail) {
          const updated = data.tasks.find((t) => t._id === activeTaskDetail._id);
          if (updated) setActiveTaskDetail(updated);
        }
      }
    } catch (err) {
      console.error('[Tasks] Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const data = await propertiesApi.getAll();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error('[Tasks] Error fetching properties:', err);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [propertyFilter, categoryFilter, statusFilter, priorityFilter, overdueOnly, search]);

  useEffect(() => {
    if (openCreateModalDirectly) {
      setTaskToEdit(null);
      setIsFormOpen(true);
      if (onClearCreateModalTrigger) onClearCreateModalTrigger();
    }
  }, [openCreateModalDirectly]);

  useEffect(() => {
    if (selectedTaskId) {
      tasksApi.getById(selectedTaskId).then((res) => {
        if (res.success) setActiveTaskDetail(res.task);
      });
    }
  }, [selectedTaskId]);

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateStatus(taskId, {
        status: newStatus,
        notes: `Quick move to ${newStatus.replace('_', ' ')} from Kanban`,
      });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to quick move status:', err);
    }
  };

  const handleDeleteTask = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete task "${name}"?`)) {
      try {
        await tasksApi.delete(id);
        if (activeTaskDetail?._id === id) setActiveTaskDetail(null);
        await fetchTasks();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete task.');
      }
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const overdueCount = tasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search tasks, workers, notes..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Kanban vs Table */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setTaskToEdit(null);
                setIsFormOpen(true);
              }}
            >
              Add Task
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>

          {/* Property Filter */}
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Properties ({properties.length})</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.propertyId})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            <option value="Foundation">Foundation</option>
            <option value="Framing">Framing</option>
            <option value="Roofing">Roofing</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="Drywall">Drywall</option>
            <option value="Painting">Painting</option>
            <option value="Flooring">Flooring</option>
            <option value="Masonry">Masonry</option>
            <option value="Inspection">Inspection</option>
            <option value="Exterior">Exterior</option>
            <option value="Interior Finish">Interior Finish</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Overdue Only Checkbox/Toggle */}
          <button
            type="button"
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              overdueOnly
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${overdueOnly ? 'text-rose-600' : 'text-slate-400'}`} />
            Overdue Only ({overdueCount})
          </button>

          {(propertyFilter !== 'all' ||
            categoryFilter !== 'all' ||
            statusFilter !== 'all' ||
            priorityFilter !== 'all' ||
            overdueOnly ||
            search) && (
            <button
              onClick={() => {
                setPropertyFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
                setOverdueOnly(false);
                setSearch('');
              }}
              className="text-xs text-rose-600 font-semibold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading construction tasks and Kanban board..." fullHeight />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-10 h-10" />}
          title="No tasks found"
          description={
            search || statusFilter !== 'all' || overdueOnly
              ? 'No tasks match the active filters. Try adjusting your parameters.'
              : 'Create your first construction task to schedule milestones, assign workers, and track before/after work photos.'
          }
          actionLabel="Add Task"
          onAction={() => {
            setTaskToEdit(null);
            setIsFormOpen(true);
          }}
        />
      ) : viewMode === 'kanban' ? (
        <TaskKanbanBoard
          tasks={tasks}
          onSelectTask={(id) => {
            const found = tasks.find((t) => t._id === id);
            if (found) setActiveTaskDetail(found);
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Task Name</th>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Contractor</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Cost (Actual/Est)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => {
                  const propObj = typeof task.property === 'object' ? task.property : null;
                  const dueInfo = getDueStatus(task.dueDate, task.status);

                  return (
                    <tr
                      key={task._id}
                      onClick={() => setActiveTaskDetail(task)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{task.taskName}</span>
                          {task.progressPhotos && task.progressPhotos.length > 0 && (
                            <span className="text-slate-400 flex items-center gap-0.5 text-[10px]">
                              <Camera className="w-3 h-3" />
                              {task.progressPhotos.length}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {propObj?.name || 'Property'}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge category={task.category} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {task.assignedWorker}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span>{formatDate(task.dueDate)}</span>
                          {dueInfo.isOverdue && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={task.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">
                          {formatCurrency(task.actualCost)}
                        </span>
                        <span className="text-slate-400"> / {formatCurrency(task.estimatedCost)}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setTaskToEdit(task);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id, task.taskName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        onSaved={fetchTasks}
        taskToEdit={taskToEdit}
        initialPropertyId={propertyFilter !== 'all' ? propertyFilter : undefined}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={Boolean(activeTaskDetail)}
        onClose={() => {
          setActiveTaskDetail(null);
          if (onClearSelectedTaskId) onClearSelectedTaskId();
        }}
        task={activeTaskDetail}
        onEdit={(t) => {
          setActiveTaskDetail(null);
          setTaskToEdit(t);
          setIsFormOpen(true);
        }}
        onTaskUpdated={fetchTasks}
      />
    </div>
  );
};
