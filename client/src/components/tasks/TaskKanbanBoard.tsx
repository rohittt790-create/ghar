import React from 'react';
import { Task, TaskStatus } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { formatDate, formatCurrency, getDueStatus } from '../../utils/formatters.js';
import {
  Calendar,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  PauseCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  onSelectTask,
  onUpdateStatus,
}) => {
  const columns: {
    status: TaskStatus;
    title: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }[] = [
    {
      status: 'not_started',
      title: 'Not Started',
      icon: <Circle className="w-4 h-4 text-slate-500" />,
      color: 'border-slate-300 text-slate-700',
      bgColor: 'bg-slate-50/80',
    },
    {
      status: 'in_progress',
      title: 'In Progress',
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      color: 'border-blue-300 text-blue-800',
      bgColor: 'bg-blue-50/30',
    },
    {
      status: 'completed',
      title: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      color: 'border-emerald-300 text-emerald-800',
      bgColor: 'bg-emerald-50/30',
    },
    {
      status: 'on_hold',
      title: 'On Hold',
      icon: <PauseCircle className="w-4 h-4 text-amber-500" />,
      color: 'border-amber-300 text-amber-800',
      bgColor: 'bg-amber-50/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className={`rounded-2xl border ${col.color} ${col.bgColor} p-3 flex flex-col min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 px-1">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className="text-xs font-bold uppercase tracking-wider">{col.title}</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white shadow-xs border border-slate-200">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards in Column */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 italic">
                  No tasks in this lane
                </div>
              ) : (
                colTasks.map((task) => {
                  const propName = (task.property as any)?.name || 'Property';
                  const dueInfo = getDueStatus(task.dueDate, task.status);

                  return (
                    <div
                      key={task._id}
                      onClick={() => onSelectTask(task._id)}
                      className={`bg-white rounded-xl p-3.5 border transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer ${
                        dueInfo.isOverdue
                          ? 'border-rose-300 hover:border-rose-400 ring-1 ring-rose-200'
                          : 'border-slate-200 hover:border-brand-400'
                      }`}
                    >
                      {/* Priority and Category */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                          {propName}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge priority={task.priority} size="sm" />
                        </div>
                      </div>

                      {/* Task Name */}
                      <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                        {task.taskName}
                      </h4>

                      {/* Category Tag */}
                      <div className="mb-2.5">
                        <Badge category={task.category} size="sm" />
                      </div>

                      {/* Progress Photo Thumbnail if exists */}
                      {task.progressPhotos && task.progressPhotos.length > 0 && (
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 bg-slate-100">
                          <img
                            src={task.progressPhotos[0].url}
                            alt={task.taskName}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Camera className="w-2.5 h-2.5" />
                            {task.progressPhotos.length}
                          </span>
                        </div>
                      )}

                      {/* Schedule & Due Status */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 truncate">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          {formatDate(task.dueDate)}
                        </span>

                        {dueInfo.isOverdue ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {dueInfo.label}
                          </span>
                        ) : dueInfo.isDueToday ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                            Today
                          </span>
                        ) : null}
                      </div>

                      {/* Financials & Worker */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                        <span className="truncate max-w-[110px]">By: {task.assignedWorker}</span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(task.actualCost || 0)}
                        </span>
                      </div>

                      {/* Quick Move Status Arrows */}
                      <div
                        className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            if (col.status === 'in_progress') onUpdateStatus(task._id, 'not_started');
                            if (col.status === 'completed') onUpdateStatus(task._id, 'in_progress');
                            if (col.status === 'on_hold') onUpdateStatus(task._id, 'in_progress');
                          }}
                          disabled={col.status === 'not_started'}
                          className="p-1 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 rounded"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[9px] uppercase font-semibold text-slate-400">
                          Move State
                        </span>

                        <button
                          onClick={() => {
                            if (col.status === 'not_started') onUpdateStatus(task._id, 'in_progress');
                            if (col.status === 'in_progress') onUpdateStatus(task._id, 'completed');
                            if (col.status === 'on_hold') onUpdateStatus(task._id, 'completed');
                          }}
                          disabled={col.status === 'completed'}
                          className="p-1 hover:text-brand-600 disabled:opacity-20 hover:bg-slate-100 rounded"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
