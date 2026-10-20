import React, { useState } from 'react';
import { Property, Task } from '../../types/index.js';
import { ProgressBar } from '../common/ProgressBar.js';
import { Badge } from '../common/Badge.js';
import { Button } from '../common/Button.js';
import { formatCurrency, formatDate, getDueStatus } from '../../utils/formatters.js';
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Edit2,
} from 'lucide-react';

interface PropertyDetailViewProps {
  property: Property;
  onBack: () => void;
  onEditProperty: (property: Property) => void;
  onAddTaskForProperty: (propertyId: string) => void;
  onSelectTask: (taskId: string) => void;
  onExploreStructure?: (propertyId: string) => void;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  property,
  onBack,
  onEditProperty,
  onAddTaskForProperty,
  onSelectTask,
  onExploreStructure,
}) => {
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<string>(
    property.coverPhoto || property.propertyPhotos[0] || ''
  );

  const ownerObj = typeof property.owner === 'object' ? property.owner : null;
  const tasks = property.tasks || [];
  const stats = property.stats || {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
    notStartedTasks: tasks.filter((t) => t.status === 'not_started').length,
    onHoldTasks: tasks.filter((t) => t.status === 'on_hold').length,
    overdueTasks: tasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length,
    categoryBreakdown: [],
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'overdue') return t.status !== 'completed' && new Date(t.dueDate) < new Date();
    return t.status === taskFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header with Back button and Edit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors w-max"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties Directory
        </button>

        <div className="flex items-center gap-2">
          {onExploreStructure && (
            <Button
              variant="outline"
              size="sm"
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
              icon={<Layers className="w-3.5 h-3.5 text-amber-600" />}
              onClick={() => onExploreStructure(property._id)}
            >
              Structure & Rooms
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={() => onEditProperty(property)}
          >
            Edit Property
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => onAddTaskForProperty(property._id)}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Hero Banner with Photo and Summary Details */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full bg-slate-900">
          <img
            src={
              activePhoto ||
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
            }
            alt={property.name}
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
            }}
            className="w-full h-full object-cover opacity-90 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-xs font-black tracking-wider px-2.5 py-1 rounded-md bg-white text-slate-900 shadow">
              {property.propertyId}
            </span>
            <Badge status={property.status} size="md" className="bg-white/95 shadow" />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900/80 text-white backdrop-blur-sm border border-white/20 capitalize">
              {property.propertyType}
            </span>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{property.name}</h1>
            <p className="text-sm text-slate-200 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
              {property.address}, {property.city} {property.state} {property.zipCode}
            </p>
          </div>
        </div>

        {/* Property Photos Strip if multiple */}
        {property.propertyPhotos && property.propertyPhotos.length > 1 && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1 shrink-0">
              Site Photos:
            </span>
            {property.propertyPhotos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Photo ${idx}`}
                onClick={() => setActivePhoto(url)}
                className={`w-14 h-10 object-cover rounded-md cursor-pointer border-2 transition-all shrink-0 ${
                  activePhoto === url ? 'border-brand-500 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        )}

        {/* Owner Card & Key Project Metrics */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Owner details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                Property Owner
              </h4>
              <div className="flex items-center gap-3">
                <img
                  src={
                    ownerObj?.profilePicture ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={ownerObj?.name || 'Owner'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-500 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {ownerObj?.name || 'Assigned Client'}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {ownerObj?.phone}
                  </p>
                  {ownerObj?.email && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {ownerObj.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {ownerObj?.emergencyContact?.name && (
              <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
                Emergency Contact: <strong>{ownerObj.emergencyContact.name}</strong> ({ownerObj.emergencyContact.phone})
              </p>
            )}
          </div>

          {/* Construction Timeline & Progress */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                Construction Schedule
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-slate-400">Start Date:</span>
                  <p className="font-semibold text-slate-800">{formatDate(property.startDate)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Target Date:</span>
                  <p className="font-semibold text-slate-800">
                    {formatDate(property.expectedCompletionDate)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Completion</span>
                <span className="font-black text-brand-600">{property.progressPercentage}%</span>
              </div>
              <ProgressBar progress={property.progressPercentage} size="md" showLabel={false} />
            </div>
          </div>

          {/* Financials & Square Footage */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-brand-600" />
                Budget & Costs
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Budget:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(property.estimatedBudget)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actual Construction Spent:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(property.actualExpenses)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Total Built Area:</span>
                  <span className="font-bold text-slate-900">{property.squareFeet?.toLocaleString()} sq.ft.</span>
                </div>
              </div>
            </div>

            {property.notes && (
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic">
                "{property.notes}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category Progress Breakdown */}
      {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-600" />
            Trade Category Progress Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-800">{cat.category}</span>
                  <span className="font-extrabold text-brand-600">{cat.progress}%</span>
                </div>
                <ProgressBar progress={cat.progress} size="sm" showLabel={false} />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>
                    {cat.completed}/{cat.total} tasks
                  </span>
                  <span>{formatCurrency(cat.actualCost)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated Tasks Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Site Tasks ({tasks.length})
            </h3>
            <p className="text-xs text-slate-500">
              Work items, assigned trades, before/after documentation, and costs
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { key: 'all', label: `All (${tasks.length})` },
              { key: 'in_progress', label: `In Progress (${stats.inProgressTasks})` },
              { key: 'completed', label: `Completed (${stats.completedTasks})` },
              { key: 'not_started', label: `Not Started (${stats.notStartedTasks})` },
              { key: 'overdue', label: `Overdue (${stats.overdueTasks})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTaskFilter(tab.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  taskFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm font-medium">No tasks found for the selected filter.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onAddTaskForProperty(property._id)}
            >
              Add New Task
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const dueInfo = getDueStatus(task.dueDate, task.status);
              return (
                <div
                  key={task._id}
                  onClick={() => onSelectTask(task._id)}
                  className="py-3.5 hover:bg-slate-50/80 rounded-xl px-3 -mx-3 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge status={task.status} size="sm" />
                      <Badge priority={task.priority} size="sm" />
                      <Badge category={task.category} size="sm" />
                      {dueInfo.isOverdue && (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {dueInfo.label}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{task.taskName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      Assigned: <strong>{task.assignedWorker}</strong> • Due: {formatDate(task.dueDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">
                        {formatCurrency(task.actualCost || 0)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Est: {formatCurrency(task.estimatedCost || 0)}
                      </p>
                    </div>

                    {task.progressPhotos && task.progressPhotos.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        <Camera className="w-3.5 h-3.5 text-slate-600" />
                        {task.progressPhotos.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
