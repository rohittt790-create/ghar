import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Camera,
  Activity,
  Plus,
  ArrowRight,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  User,
  ExternalLink,
} from 'lucide-react';
import { DashboardSummary, Task } from '../../types/index.js';
import { dashboardApi, tasksApi } from '../../services/api.js';
import { StatCard } from '../common/StatCard.js';
import { ProgressBar } from '../common/ProgressBar.js';
import { Badge } from '../common/Badge.js';
import { Button } from '../common/Button.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { formatCurrency, formatDate, getDueStatus } from '../../utils/formatters.js';
import { TabKey } from '../layout/Sidebar.js';

interface DashboardViewProps {
  onNavigateTab: (tab: TabKey) => void;
  onOpenAddTask: () => void;
  onOpenAddProperty: () => void;
  onOpenAddOwner: () => void;
  onSelectTask: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenAddTask,
  onOpenAddProperty,
  onOpenAddOwner,
  onSelectTask,
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const summary = await dashboardApi.getSummary();
      setData(summary);
    } catch (err) {
      console.error('[Dashboard] Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleQuickComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setCompletingTaskId(task._id);
      await tasksApi.updateStatus(task._id, {
        status: 'completed',
        notes: 'Marked completed directly from Dashboard alert panel.',
      });
      await fetchSummary();
    } catch (err) {
      console.error('[Dashboard] Error completing task:', err);
    } finally {
      setCompletingTaskId(null);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner label="Loading construction dashboard..." fullHeight />;
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p>Could not load dashboard data. Please verify backend connection.</p>
        <Button variant="primary" className="mt-4" onClick={fetchSummary}>
          Retry
        </Button>
      </div>
    );
  }

  const {
    counts,
    overallProgress,
    financials,
    overdueTasks,
    upcomingDeadlines,
    recentPhotos,
    recentActivities,
    properties,
  } = data;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TOP OF DASHBOARD: OWNER DETAILS & PROPERTY IMAGE SHOWCASE */}
      {/* ======================================================== */}
      {properties.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
          {/* Top Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 px-5 sm:px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Featured Property & House Owner
                </span>
                <span className="hidden sm:inline text-xs text-slate-400">|</span>
                <span className="hidden sm:inline text-xs text-slate-300 font-medium">
                  KAILASH BHAWAN Command Center
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Property & House Owner Spotlight
              </h2>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={onOpenAddTask}
              >
                Add Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
                icon={<Building className="w-3.5 h-3.5" />}
                onClick={onOpenAddProperty}
              >
                Add Property
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
                icon={<Users className="w-3.5 h-3.5" />}
                onClick={onOpenAddOwner}
              >
                Add Owner
              </Button>
            </div>
          </div>

          {/* Properties Showcase Cards */}
          <div className="p-4 sm:p-6 space-y-6">
            {properties.map((prop) => {
              const ownerObj = typeof prop.owner === 'object' && prop.owner !== null ? (prop.owner as any) : null;
              const ownerName = ownerObj?.name || 'Owner Not Assigned';
              const ownerPhone = ownerObj?.phone || '';
              const ownerEmail = ownerObj?.email || '';
              const ownerAddress = ownerObj?.address || '';
              const ownerCity = ownerObj?.city ? `${ownerObj.city}${ownerObj.state ? `, ${ownerObj.state}` : ''}` : '';
              const ownerPic = ownerObj?.profilePicture;

              const coverImage =
                prop.coverPhoto ||
                (prop.propertyPhotos && prop.propertyPhotos[0]) ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80';

              return (
                <div
                  key={prop._id}
                  className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0"
                >
                  {/* Property Image Showcase (Left Column 5 / 12) */}
                  <div className="lg:col-span-5 relative h-64 sm:h-72 lg:h-auto min-h-[280px] bg-slate-900 group overflow-hidden">
                    <img
                      src={coverImage}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Property Badges (Top) */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-900/85 backdrop-blur-md text-white border border-white/20 shadow-sm">
                        {prop.propertyId || 'PROPERTY'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-600/90 text-white shadow-sm">
                          {prop.propertyType}
                        </span>
                        <Badge status={prop.status} size="sm" />
                      </div>
                    </div>

                    {/* Property Details (Bottom of Image) */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-300">
                        Property Site
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md truncate">
                        {prop.name}
                      </h3>
                      <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-1 drop-shadow-sm truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                        <span>{prop.address}{prop.city ? `, ${prop.city}` : ''}</span>
                      </p>
                    </div>
                  </div>

                  {/* Owner Details & Construction Info (Right Column 7 / 12) */}
                  <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-slate-50/50">
                    {/* OWNER DETAILS PROFILE BOX */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
                        <span className="text-xs font-black uppercase tracking-wider text-brand-700 flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-600" />
                          <span>House Owner Details</span>
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                          Registered Owner
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Owner Profile Picture */}
                        {ownerPic ? (
                          <img
                            src={ownerPic}
                            alt={ownerName}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-400 shrink-0 shadow-md ring-4 ring-brand-50"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md ring-4 ring-brand-50">
                            {ownerName.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        {/* Owner Information */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">
                              {ownerName}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              Client / Property Owner
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {ownerPhone && (
                              <a
                                href={`tel:${ownerPhone}`}
                                className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 border border-emerald-200/60 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="font-bold truncate">{ownerPhone}</span>
                              </a>
                            )}

                            {ownerEmail && (
                              <a
                                href={`mailto:${ownerEmail}`}
                                className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/60 hover:bg-blue-100/70 text-blue-900 border border-blue-200/60 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="font-medium truncate">{ownerEmail}</span>
                              </a>
                            )}
                          </div>

                          {(ownerAddress || ownerCity) && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{ownerAddress || ownerCity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Construction Progress & Key Metrics */}
                    <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                            Site Construction Progress
                          </span>
                          <span className="font-black text-brand-600 text-base">
                            {prop.progressPercentage}%
                          </span>
                        </div>
                        <ProgressBar progress={prop.progressPercentage} size="md" showLabel={false} />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                            Budget
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {formatCurrency(prop.estimatedBudget || 0)}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                            Area / Size
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {prop.squareFeet ? `${prop.squareFeet.toLocaleString()} sq ft` : 'N/A'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                            Target End
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {formatDate(prop.expectedCompletionDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 font-bold shadow-sm"
                        icon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => onNavigateTab('properties')}
                      >
                        View Full Property Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={onOpenAddTask}
                      >
                        Add Task to Site
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Fallback Banner if no property added yet */
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Welcome to KAILASH BHAWAN
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Get Started with Your Construction Project
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Add your property and owner details to start tracking live construction progress, tasks, expenses, and site photos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              icon={<Building className="w-3.5 h-3.5" />}
              onClick={onOpenAddProperty}
            >
              Add Property
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              icon={<Users className="w-3.5 h-3.5" />}
              onClick={onOpenAddOwner}
            >
              Add Owner
            </Button>
          </div>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={counts.totalProperties}
          subtitle={`${counts.totalOwners} registered house owners`}
          icon={<Building className="w-6 h-6 text-brand-600" />}
          iconColor="bg-brand-50"
          onClick={() => onNavigateTab('properties')}
        />
        <StatCard
          title="Tasks Completed"
          value={`${counts.completedTasks} / ${counts.totalTasks}`}
          subtitle={`${counts.inProgressTasks} currently in progress`}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          iconColor="bg-emerald-50"
          trend={{
            value: `${Math.round((counts.completedTasks / (counts.totalTasks || 1)) * 100)}% complete`,
            isPositive: true,
          }}
          onClick={() => onNavigateTab('tasks')}
        />
        <StatCard
          title="Overdue Tasks"
          value={counts.overdueTasksCount}
          subtitle={counts.overdueTasksCount > 0 ? 'Requires immediate action' : 'All tasks on schedule'}
          icon={<AlertTriangle className="w-6 h-6 text-rose-600" />}
          iconColor={counts.overdueTasksCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}
          trend={
            counts.overdueTasksCount > 0
              ? { value: `${counts.overdueTasksCount} tasks past due date`, isPositive: false }
              : undefined
          }
          onClick={() => onNavigateTab('tasks')}
        />
        <StatCard
          title="Construction Budget"
          value={formatCurrency(financials.totalSpent)}
          subtitle={`Budget: ${formatCurrency(financials.totalBudget)}`}
          icon={<IndianRupee className="w-6 h-6 text-purple-600" />}
          iconColor="bg-purple-50"
          trend={{
            value:
              financials.variance <= 0
                ? 'Within planned allocation'
                : `+₹${financials.variance.toLocaleString('en-IN')} variance`,
            isPositive: financials.variance <= 0,
          }}
          onClick={() => onNavigateTab('reports')}
        />
      </div>

      {/* Construction Progress Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Overall Construction Progress</h3>
            <p className="text-xs text-slate-500">
              Aggregated across all active foundation, framing, finish, and exterior work
            </p>
          </div>
          <span className="text-2xl font-black text-brand-600">{overallProgress}%</span>
        </div>
        <ProgressBar progress={overallProgress} size="lg" showLabel={false} />

        {/* Task State Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs text-slate-600">
              <strong>{counts.completedTasks}</strong> Completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <span className="text-xs text-slate-600">
              <strong>{counts.inProgressTasks}</strong> In Progress
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
            <span className="text-xs text-slate-600">
              <strong>{counts.notStartedTasks}</strong> Not Started
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <span className="text-xs text-slate-600">
              <strong>{counts.overdueTasksCount}</strong> Overdue
            </span>
          </div>
        </div>
      </div>


      {/* Main Grid: Left Column (Alerts & Deadlines) + Right Column (Properties & Activities) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Tasks Section */}
          {overdueTasks.length > 0 && (
            <div className="bg-rose-50/50 rounded-2xl border border-rose-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-950">Overdue Tasks Requiring Action</h3>
                    <p className="text-xs text-rose-700">Past due date and pending resolution</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-700 hover:bg-rose-100"
                  onClick={() => onNavigateTab('tasks')}
                >
                  View All
                </Button>
              </div>

              <div className="space-y-2">
                {overdueTasks.map((task) => {
                  const dueInfo = getDueStatus(task.dueDate, task.status);
                  return (
                    <div
                      key={task._id}
                      onClick={() => onSelectTask(task._id)}
                      className="bg-white rounded-xl border border-rose-200/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-400 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-100 border border-rose-200">
                            {dueInfo.label}
                          </span>
                          <Badge priority={task.priority} size="sm" />
                          <Badge category={task.category} size="sm" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{task.taskName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Property: <strong>{(task.property as any)?.name}</strong> • Assigned: {task.assignedWorker}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="success"
                          size="sm"
                          loading={completingTaskId === task._id}
                          onClick={(e) => handleQuickComplete(task, e)}
                        >
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines (Next 7 Days) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-brand-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines (Next 7 Days)</h3>
                  <p className="text-xs text-slate-500">Scheduled milestones approaching this week</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-600 hover:bg-brand-50"
                onClick={() => onNavigateTab('calendar')}
              >
                Calendar View
              </Button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No deadlines in the next 7 days.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingDeadlines.map((task) => {
                  const dueInfo = getDueStatus(task.dueDate, task.status);
                  return (
                    <div
                      key={task._id}
                      onClick={() => onSelectTask(task._id)}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {task.taskName}
                          </span>
                          <Badge priority={task.priority} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {(task.property as any)?.name} • Worker: {task.assignedWorker}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                          {dueInfo.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Progress Photos */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Progress Photos</h3>
                  <p className="text-xs text-slate-500">Live documentation uploaded from sites</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-600 hover:bg-brand-50"
                onClick={() => onNavigateTab('tasks')}
              >
                Gallery
              </Button>
            </div>

            {recentPhotos.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No progress photos uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recentPhotos.map((photo, idx) => (
                  <div
                    key={`${photo.taskId}-${idx}`}
                    onClick={() => onSelectTask(photo.taskId)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer hover:shadow-md transition-all"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.taskName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded w-max mb-1 text-white ${
                          photo.stage === 'after'
                            ? 'bg-emerald-600'
                            : photo.stage === 'before'
                            ? 'bg-slate-700'
                            : 'bg-blue-600'
                        }`}
                      >
                        {photo.stage}
                      </span>
                      <p className="text-[11px] font-semibold text-white leading-tight truncate">
                        {photo.taskName}
                      </p>
                      <p className="text-[9px] text-slate-300 truncate">{photo.propertyName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col on lg) */}
        <div className="space-y-6">
          {/* Active Properties Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Properties Overview</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-600 hover:bg-brand-50"
                onClick={() => onNavigateTab('properties')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {properties.map((prop) => {
                const ownerObj = typeof prop.owner === 'object' && prop.owner !== null ? (prop.owner as any) : null;
                const ownerName = ownerObj?.name || 'Owner';
                const ownerPhone = ownerObj?.phone || '';
                const ownerPic = ownerObj?.profilePicture;
                const coverImage =
                  prop.coverPhoto ||
                  (prop.propertyPhotos && prop.propertyPhotos[0]) ||
                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={prop._id}
                    onClick={() => onNavigateTab('properties')}
                    className="rounded-xl border border-slate-200/80 bg-white hover:border-brand-400 hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                  >
                    {/* Property Image Banner */}
                    <div className="relative h-32 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={coverImage}
                        alt={prop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900/80 text-white border border-white/20 shadow-sm">
                          {prop.propertyId || 'PROPERTY'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-600/90 text-white shadow-sm">
                          {prop.propertyType}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                        <span className="text-xs font-bold truncate drop-shadow-sm">{prop.name}</span>
                        <span className="text-xs font-black text-brand-300 shrink-0">
                          {prop.progressPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Owner Details & Progress */}
                    <div className="p-3 bg-slate-50/50">
                      <div className="flex items-center gap-2.5 mb-2.5 pb-2.5 border-b border-slate-100">
                        {ownerPic ? (
                          <img
                            src={ownerPic}
                            alt={ownerName}
                            className="w-8 h-8 rounded-full object-cover border-2 border-brand-200 shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {ownerName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {ownerName}
                          </p>
                          {ownerPhone ? (
                            <p className="text-[11px] text-emerald-700 font-medium truncate flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{ownerPhone}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">House Owner</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Construction Progress</span>
                          <span className="font-bold text-slate-800">{prop.progressPercentage}%</span>
                        </div>
                        <ProgressBar progress={prop.progressPercentage} size="sm" showLabel={false} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Work History / Activity Stream */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Recent Activity Log</h3>
              </div>
            </div>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No recent logged actions.</p>
            ) : (
              <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-100">
                {recentActivities.slice(0, 7).map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white shrink-0 mt-1" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800">
                        {act.action}: <span className="font-normal">{act.taskName}</span>
                      </p>
                      {act.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{act.notes}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        By {act.changedBy} • {formatDate(act.timestamp, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
