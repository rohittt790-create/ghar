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
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Compass,
  ChevronRight,
  Sun,
  Wind,
  Droplets,
  Maximize2,
  Eye,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardSummary, Task, PhotoStage } from '../../types/index.js';
import { dashboardApi, tasksApi } from '../../services/api.js';
import { Badge } from '../common/Badge.js';
import { Button } from '../common/Button.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { formatCurrency, formatDate, getDueStatus } from '../../utils/formatters.js';
import { TabKey } from '../layout/Sidebar.js';
import { useAuth } from '../../context/AuthContext.js';

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
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'deadlines' | 'photos' | 'activity'>('deadlines');
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; caption?: string; stage?: string; taskName?: string } | null>(null);

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
        notes: 'Marked completed directly from Executive Dashboard.',
      });

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      } catch (err) {}

      await fetchSummary();
    } catch (err) {
      console.error('[Dashboard] Error completing task:', err);
    } finally {
      setCompletingTaskId(null);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner label="Loading KAILASH BHAWAN Executive Command Deck..." fullHeight />;
  }

  if (!data) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-xl mx-auto my-12 p-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-100 shadow-sm">
          <Building className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Could Not Load Command Deck</h3>
        <p className="text-sm text-slate-500 mt-2">
          Unable to establish communication with the database engine. Please check your connection.
        </p>
        <Button variant="primary" className="mt-6 font-bold shadow-md" onClick={fetchSummary}>
          Reconnect Dashboard
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

  // Active property (first or main)
  const primaryProperty = properties[0] || null;
  const ownerObj = primaryProperty && typeof primaryProperty.owner === 'object' && primaryProperty.owner !== null
    ? (primaryProperty.owner as any)
    : null;

  // Indian format date string
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  // Calculate days remaining to target completion
  let daysRemaining: number | null = null;
  if (primaryProperty?.expectedCompletionDate) {
    const end = new Date(primaryProperty.expectedCompletionDate).getTime();
    const now = new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  // 5 Major Construction Lifecycle Phases
  const constructionPhases = [
    {
      id: 1,
      name: 'Foundation & Raft',
      description: 'Excavation, anti-termite, PCC & plinth beam',
      range: [0, 20],
      status: overallProgress > 20 ? 'completed' : overallProgress > 0 ? 'in_progress' : 'active',
    },
    {
      id: 2,
      name: 'RCC Superstructure',
      description: 'Columns, tie beams & reinforced roof slabs',
      range: [21, 45],
      status: overallProgress > 45 ? 'completed' : overallProgress >= 20 ? 'in_progress' : 'upcoming',
    },
    {
      id: 3,
      name: 'Masonry & Brickwork',
      description: 'First-class red bricks, AAC blocks & plaster',
      range: [46, 65],
      status: overallProgress > 65 ? 'completed' : overallProgress >= 45 ? 'in_progress' : 'upcoming',
    },
    {
      id: 4,
      name: 'MEP Infrastructure',
      description: 'Concealed wiring, piping, drainage & tanks',
      range: [66, 80],
      status: overallProgress > 80 ? 'completed' : overallProgress >= 65 ? 'in_progress' : 'upcoming',
    },
    {
      id: 5,
      name: 'Luxury Finishing',
      description: 'Vitrified tiles, POP, acrylic paint & handover',
      range: [81, 100],
      status: overallProgress === 100 ? 'completed' : overallProgress >= 80 ? 'in_progress' : 'upcoming',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* ======================================================== */}
      {/* 1. EXECUTIVE COMMAND DECK HEADER */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#0b172a] to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-gradient-to-r from-brand-500/30 to-emerald-500/30 text-brand-300 border border-brand-400/30 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Command Deck
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                {todayFormatted}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
              KAILASH BHAWAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-emerald-300 to-amber-200">Executive Console</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Real-time architectural supervision, construction cashflow, milestone velocity, and verified client stewardship.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40 text-xs font-bold backdrop-blur-md transition-all shadow-sm"
              icon={<Plus className="w-4 h-4 text-brand-300" />}
              onClick={onOpenAddTask}
            >
              Log Work Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40 text-xs font-bold backdrop-blur-md transition-all shadow-sm"
              icon={<Building className="w-4 h-4 text-emerald-300" />}
              onClick={onOpenAddProperty}
            >
              Add Property
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40 text-xs font-bold backdrop-blur-md transition-all shadow-sm"
              icon={<Users className="w-4 h-4 text-amber-300" />}
              onClick={onOpenAddOwner}
            >
              Register Owner
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-black text-xs shadow-lg shadow-brand-500/25 border border-brand-400/40"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigateTab('reports')}
            >
              Generate Report
            </Button>
          </div>
        </div>

        {/* Live Weather & Site Conditions Advisory Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Surajgarh, Bihar • <strong className="text-white">29°C Clear Sky</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>Humidity: <strong className="text-white">42% (Optimal)</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Wind className="w-4 h-4 text-emerald-400" />
              <span>Wind: <strong className="text-white">8 km/h NW</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-300 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Site Conditions: Prime for Curing & Brickwork</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. GRAND VILLA & PRINCIPAL HOUSE OWNER SPOTLIGHT */}
      {/* ======================================================== */}
      {properties.length > 0 ? (
        <div className="space-y-6">
          {properties.map((prop) => {
            const currentOwner = typeof prop.owner === 'object' && prop.owner !== null ? (prop.owner as any) : null;
            const ownerName = currentOwner?.name || 'Owner Not Assigned';
            const ownerPhone = currentOwner?.phone || '';
            const ownerEmail = currentOwner?.email || '';
            const ownerAddress = currentOwner?.address || '';
            const ownerCity = currentOwner?.city ? `${currentOwner.city}${currentOwner.state ? `, ${currentOwner.state}` : ''}` : '';
            const ownerPic = currentOwner?.profilePicture;

            const coverImage =
              prop.coverPhoto ||
              (prop.propertyPhotos && prop.propertyPhotos[0]) ||
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

            // WhatsApp link generator (removes non-digits)
            const cleanPhone = ownerPhone.replace(/\D/g, '');
            const whatsappUrl = cleanPhone
              ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(`Namaste ${ownerName} ji, sharing the latest KAILASH BHAWAN construction update.`)}`
              : null;

            return (
              <div
                key={prop._id}
                className="rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-300 hover:border-brand-300"
              >
                {/* Header Sub-Bar */}
                <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 px-6 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-300">
                        Featured Construction Estate
                      </span>
                      <h2 className="text-base font-black tracking-tight text-white">{prop.name}</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-500/30 text-brand-200 border border-brand-400/40 shadow-sm">
                      {prop.propertyType || 'Residential'}
                    </span>
                    <Badge status={prop.status} size="sm" />
                  </div>
                </div>

                {/* Cinematic 2-Column Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left Column: Architectural Photo & Badges (5 / 12) */}
                  <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-auto min-h-[360px] bg-slate-950 group overflow-hidden">
                    <img
                      src={coverImage}
                      alt={prop.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900/90 backdrop-blur-md text-white border border-white/20 shadow-lg">
                        {prop.propertyId || 'PROP-689'}
                      </span>

                      {daysRemaining !== null && (
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/90 text-white backdrop-blur-md shadow-lg flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{daysRemaining} Days to Handover</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Property Title & Meta */}
                    <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-brand-500 text-white shadow-sm">
                          Flagship Site
                        </span>
                        {prop.squareFeet && (
                          <span className="text-xs text-slate-300 font-semibold">
                            {prop.squareFeet.toLocaleString()} sq ft Built-up
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                        {prop.name}
                      </h3>

                      <p className="text-xs text-slate-200 flex items-center gap-1.5 drop-shadow-sm truncate">
                        <MapPin className="w-4 h-4 text-brand-300 shrink-0" />
                        <span>{prop.address}{prop.city ? `, ${prop.city}` : ''}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Owner Profile & Financial Intelligence (7 / 12) */}
                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-gradient-to-br from-white via-slate-50/40 to-brand-50/20">
                    {/* VIP HOUSE OWNER DOSSIER */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-brand-50 text-brand-600">
                            <ShieldCheck className="w-4 h-4" />
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Principal House Owner Dossier
                          </span>
                        </div>
                        <span className="text-[11px] font-black px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Verified Client
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        {/* Owner Profile Picture / Monogram */}
                        <div className="relative shrink-0">
                          {ownerPic ? (
                            <img
                              src={ownerPic}
                              alt={ownerName}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-brand-500 shadow-xl ring-4 ring-brand-100"
                            />
                          ) : null}
                          <div
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl ring-4 ring-brand-100"
                            style={{ display: ownerPic ? 'none' : 'flex' }}
                          >
                            {ownerName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100 flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </span>
                        </div>

                        {/* Owner Information & Direct Actions */}
                        <div className="flex-1 min-w-0 space-y-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xl font-black text-slate-900 tracking-tight truncate">
                                {ownerName}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                              Client & Chief Stakeholder • KAILASH BHAWAN
                            </p>
                          </div>

                          {/* Quick Interactive Contact Pills */}
                          <div className="flex flex-wrap gap-2 text-xs">
                            {ownerPhone && (
                              <a
                                href={`tel:${ownerPhone}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200/80 transition-all shadow-xs"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{ownerPhone}</span>
                              </a>
                            )}

                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm shadow-emerald-500/20"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            {ownerEmail && (
                              <a
                                href={`mailto:${ownerEmail}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold border border-blue-200/80 transition-all shadow-xs"
                              >
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                <span className="truncate max-w-[180px]">{ownerEmail}</span>
                              </a>
                            )}
                          </div>

                          {(ownerAddress || ownerCity) && (
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{ownerAddress || ownerCity}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* LIVE PROGRESS & FINANCIAL GAUGE */}
                    <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-brand-300 uppercase tracking-widest text-[11px]">
                              Structural Construction Progress
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-300 text-xs font-semibold">Active Milestone</span>
                          </div>
                          <span className="text-2xl font-black text-emerald-400">
                            {prop.progressPercentage}%
                          </span>
                        </div>

                        {/* Multi-gradient precision progress bar */}
                        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 via-emerald-400 to-amber-300 transition-all duration-1000 ease-out shadow-sm shadow-emerald-500/50"
                            style={{ width: `${Math.max(5, prop.progressPercentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Financial & Metric Ledger */}
                      <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-center">
                        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                          <span className="block text-slate-400 text-[10px] uppercase font-black tracking-wider">
                            Total Budget
                          </span>
                          <span className="font-black text-white text-sm sm:text-base text-amber-300">
                            {formatCurrency(prop.estimatedBudget || 0)}
                          </span>
                        </div>

                        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                          <span className="block text-slate-400 text-[10px] uppercase font-black tracking-wider">
                            Capital Spent
                          </span>
                          <span className="font-black text-white text-sm sm:text-base text-emerald-400">
                            {formatCurrency(prop.actualExpenses || 0)}
                          </span>
                        </div>

                        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                          <span className="block text-slate-400 text-[10px] uppercase font-black tracking-wider">
                            Target End
                          </span>
                          <span className="font-black text-white text-xs sm:text-sm">
                            {formatDate(prop.expectedCompletionDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dossier Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full sm:flex-1 font-black bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-md shadow-brand-600/30 rounded-2xl"
                        icon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => onNavigateTab('properties')}
                      >
                        Explore Property Dossier
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        className="w-full sm:w-auto font-bold border-slate-300 hover:bg-slate-100 rounded-2xl"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={onOpenAddTask}
                      >
                        Add Task to Site
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State Luxury Banner */
        <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Welcome to KAILASH BHAWAN
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">Get Started with Your First Estate</h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Register your property details and assign an owner to initiate live construction monitoring, photos, and milestones.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" icon={<Building className="w-4 h-4" />} onClick={onOpenAddProperty}>
              Add Property
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20" icon={<Users className="w-4 h-4" />} onClick={onOpenAddOwner}>
              Add Owner
            </Button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. STRUCTURAL CONSTRUCTION ROADMAP (5 MAJOR PHASES) */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-brand-50 text-brand-600">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Architectural Construction Roadmap
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              5-Stage lifecycle tracking from geotechnical ground-break to final luxury turnkey handover
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Phase Completion:</span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-700 border border-brand-200">
              {overallProgress}% Total Velocity
            </span>
          </div>
        </div>

        {/* Phase Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {constructionPhases.map((phase) => {
            const isCompleted = phase.status === 'completed';
            const isActive = phase.status === 'active' || phase.status === 'in_progress';

            return (
              <div
                key={phase.id}
                className={`relative rounded-2xl p-4 border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : isActive
                    ? 'bg-brand-50/60 border-brand-300 text-brand-950 ring-2 ring-brand-100 shadow-md'
                    : 'bg-slate-50/60 border-slate-200/70 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    Phase 0{phase.id}
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActive ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-ping" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <h4 className="text-sm font-black tracking-tight">{phase.name}</h4>
                <p className="text-[11px] leading-snug mt-1 opacity-80 line-clamp-2">
                  {phase.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold">
                  <span>Target: {phase.range[1]}%</span>
                  <span className="uppercase tracking-wider">
                    {isCompleted ? 'Done' : isActive ? 'Active Now' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. EXECUTIVE BENTO KPI METRIC CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Properties */}
        <div
          onClick={() => onNavigateTab('properties')}
          className="group relative rounded-3xl p-6 bg-gradient-to-br from-white via-white to-brand-50/30 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-brand-400 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Total Estates
            </span>
            <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{counts.totalProperties}</h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {counts.totalOwners} Registered House Owners
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:translate-x-0.5 transition-transform">
            <span>Manage Properties</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Milestones / Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="group relative rounded-3xl p-6 bg-gradient-to-br from-white via-white to-emerald-50/30 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Work Milestones
            </span>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {counts.completedTasks} <span className="text-lg font-bold text-slate-400">/ {counts.totalTasks}</span>
          </h3>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            {counts.inProgressTasks} Currently Active in Field
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
            <span>View Task Board</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Schedule & Critical Path */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="group relative rounded-3xl p-6 bg-gradient-to-br from-white via-white to-amber-50/30 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Critical Timeline
            </span>
            <div className={`p-3 rounded-2xl ${
              counts.overdueTasksCount > 0
                ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
            } transition-colors duration-300 shadow-sm`}>
              {counts.overdueTasksCount > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {counts.overdueTasksCount}
          </h3>
          <p className={`text-xs font-semibold mt-1 ${
            counts.overdueTasksCount > 0 ? 'text-rose-600' : 'text-emerald-700'
          }`}>
            {counts.overdueTasksCount > 0 ? 'Immediate Action Required' : '100% On Schedule • 0 Bottlenecks'}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:translate-x-0.5 transition-transform">
            <span>Inspect Schedule</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Construction Budget & Capital */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="group relative rounded-3xl p-6 bg-gradient-to-br from-white via-white to-purple-50/30 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Capital Budget
            </span>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(financials.totalBudget || 350000)}
          </h3>
          <p className="text-xs font-semibold text-purple-700 mt-1">
            Spent: {formatCurrency(financials.totalSpent || 0)} (100% In Reserve)
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform">
            <span>Audit Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MULTI-TAB WORKSPACE: OPERATIONS & SITE INTELLIGENCE */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Task & Operations Console (8 / 12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 max-w-full overflow-x-auto">
                <button
                  onClick={() => setActiveTab('deadlines')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'deadlines'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming Milestones ({upcomingDeadlines.length})
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'alerts'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  Overdue Alerts ({overdueTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'photos'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:text-brand-700'
                  }`}
                >
                  Live Site Lens ({recentPhotos.length})
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'activity'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  Audit Trail
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-brand-600 hover:bg-brand-50 shrink-0"
                onClick={() => onNavigateTab('tasks')}
              >
                Open Full Board
              </Button>
            </div>

            {/* TAB CONTENT: UPCOMING DEADLINES */}
            {activeTab === 'deadlines' && (
              <div className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <h4 className="text-sm font-bold text-slate-800">No Scheduled Deadlines This Week</h4>
                    <p className="text-xs text-slate-500 mt-1">All active milestones are clear. Click below to add tasks.</p>
                    <Button variant="outline" size="sm" className="mt-4 font-bold" onClick={onOpenAddTask}>
                      + Schedule New Milestone
                    </Button>
                  </div>
                ) : (
                  upcomingDeadlines.map((task) => {
                    const dueInfo = getDueStatus(task.dueDate, task.status);
                    return (
                      <div
                        key={task._id}
                        onClick={() => onSelectTask(task._id)}
                        className="group p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-brand-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-brand-700 px-2.5 py-0.5 rounded-md bg-brand-50 border border-brand-200">
                              {dueInfo.label}
                            </span>
                            <Badge priority={task.priority} size="sm" />
                            <Badge category={task.category} size="sm" />
                          </div>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                            {task.taskName}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-2">
                            <span>Site: <strong>{(task.property as any)?.name}</strong></span>
                            <span>•</span>
                            <span>Assigned: <strong>{task.assignedWorker}</strong></span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Button
                            variant="success"
                            size="sm"
                            loading={completingTaskId === task._id}
                            onClick={(e) => handleQuickComplete(task, e)}
                            className="font-bold shadow-sm"
                          >
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB CONTENT: OVERDUE ALERTS */}
            {activeTab === 'alerts' && (
              <div className="space-y-3">
                {overdueTasks.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-emerald-50/40 border border-dashed border-emerald-200 text-emerald-900">
                    <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h4 className="text-base font-black">Zero Overdue Tasks</h4>
                    <p className="text-xs text-emerald-700 mt-1">Every work item is progressing on or ahead of schedule.</p>
                  </div>
                ) : (
                  overdueTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => onSelectTask(task._id)}
                      className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
                            Overdue Milestone
                          </span>
                          <Badge priority={task.priority} size="sm" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900 truncate">{task.taskName}</h4>
                        <p className="text-xs text-slate-500">
                          Worker: <strong>{task.assignedWorker}</strong> • Due: {formatDate(task.dueDate)}
                        </p>
                      </div>

                      <Button
                        variant="success"
                        size="sm"
                        loading={completingTaskId === task._id}
                        onClick={(e) => handleQuickComplete(task, e)}
                        className="font-bold shadow-sm shrink-0"
                      >
                        Resolve & Complete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: LIVE SITE LENS (PHOTOS) */}
            {activeTab === 'photos' && (
              <div>
                {recentPhotos.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                    <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800">No Site Progress Photos Yet</h4>
                    <p className="text-xs text-slate-500 mt-1">Attach before/after photos to any task to populate the live lens.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {recentPhotos.map((photo, idx) => (
                      <div
                        key={`${photo.taskId}-${idx}`}
                        onClick={() => setPreviewPhoto({
                          url: photo.url,
                          caption: photo.caption,
                          stage: photo.stage,
                          taskName: photo.taskName,
                        })}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[4/3] cursor-pointer hover:shadow-xl transition-all"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || photo.taskName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-3 flex flex-col justify-end text-white">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md w-max mb-1 text-white ${
                            photo.stage === 'after' ? 'bg-emerald-600' : photo.stage === 'before' ? 'bg-slate-700' : 'bg-brand-600'
                          }`}>
                            {photo.stage}
                          </span>
                          <p className="text-xs font-bold truncate leading-tight">{photo.taskName}</p>
                          <p className="text-[10px] text-slate-300 truncate">{photo.propertyName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: AUDIT TRAIL */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No recorded activity yet.</p>
                ) : (
                  <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-100">
                    {recentActivities.slice(0, 8).map((act, idx) => (
                      <div key={idx} className="flex items-start gap-3 relative pl-6">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white shrink-0 mt-1 absolute left-1.5" />
                        <div className="min-w-0 flex-1 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-900">
                            {act.action}: <span className="font-semibold text-brand-700">{act.taskName}</span>
                          </p>
                          {act.notes && (
                            <p className="text-[11px] text-slate-600 mt-1 italic">"{act.notes}"</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            By {act.changedBy} • {formatDate(act.timestamp, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Properties Quick Portfolio & Site Actions (4 / 12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Properties Portfolio */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                  <Building className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Properties Portfolio
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-brand-600"
                onClick={() => onNavigateTab('properties')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {properties.map((prop) => {
                const currentOwner = typeof prop.owner === 'object' && prop.owner !== null ? (prop.owner as any) : null;
                const ownerName = currentOwner?.name || 'Owner Not Assigned';
                const coverImage =
                  prop.coverPhoto ||
                  (prop.propertyPhotos && prop.propertyPhotos[0]) ||
                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={prop._id}
                    onClick={() => onNavigateTab('properties')}
                    className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-400 hover:shadow-md transition-all cursor-pointer p-3.5 flex items-center gap-3.5"
                  >
                    <img
                      src={coverImage}
                      alt={prop.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                          {prop.name}
                        </h4>
                        <span className="text-xs font-black text-emerald-600 shrink-0">
                          {prop.progressPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{ownerName}</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full"
                          style={{ width: `${prop.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Construction Links Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/10 text-brand-300">
                <Compass className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Site Operations Hub
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Access the construction calendar for upcoming concrete casting schedules or download monthly compliance reports.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigateTab('calendar')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span>Construction Calendar & Schedule</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('reports')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <IndianRupee className="w-4 h-4 text-purple-400" />
                  <span>Expense & Budget Audit Ledger</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('reminders')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Automated Deadline Reminders</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. HIGH-RESOLUTION PHOTO LIGHTBOX MODAL */}
      {/* ======================================================== */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border border-white/20 shadow-2xl space-y-4"
          >
            <div className="relative aspect-video w-full bg-slate-950">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption || previewPhoto.taskName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 pt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-brand-50 text-brand-700">
                  {previewPhoto.stage || 'Progress Photo'}
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">{previewPhoto.taskName}</h4>
                {previewPhoto.caption && (
                  <p className="text-xs text-slate-500 mt-0.5">{previewPhoto.caption}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPreviewPhoto(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
