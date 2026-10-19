import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { MonthlyReportData, Property, Owner } from '../../types/index.js';
import { reportsApi, propertiesApi, ownersApi } from '../../services/api.js';
import { exportMonthlyReportToPdf } from '../../utils/exportPdf.js';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building,
  User,
  Filter,
  IndianRupee,
  TrendingUp,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(10); // October (current context)
  const [propertyId, setPropertyId] = useState<string>('all');
  const [ownerId, setOwnerId] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');

  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = [2025, 2026, 2027];

  useEffect(() => {
    propertiesApi.getAll().then((res) => {
      if (res.success) setProperties(res.properties);
    });
    ownersApi.getAll().then((res) => {
      if (res.success) setOwners(res.owners);
    });
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getMonthlyReport({
        year,
        month,
        propertyId: propertyId !== 'all' ? propertyId : undefined,
        ownerId: ownerId !== 'all' ? ownerId : undefined,
        category: category !== 'all' ? category : undefined,
      });
      setReportData(data);
    } catch (err) {
      console.error('[Reports] Error fetching monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [year, month, propertyId, ownerId, category]);

  const handleExportPDF = () => {
    if (reportData) {
      exportMonthlyReportToPdf(reportData);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar (Hidden on print) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              Monthly Progress & Financial Report Generator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyze work completion rates, expenses vs budget, and photo documentation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportPDF}
              disabled={!reportData}
            >
              Export as PDF
            </Button>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
          {/* Month Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Select Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 py-2 px-2.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Select Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 py-2 px-2.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Property Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Filter Property
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 py-2 px-2.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Properties ({properties.length})</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Owner Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Filter Owner
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 py-2 px-2.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Owners ({owners.length})</option>
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 py-2 px-2.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
              <option value="Inspection">Inspection</option>
              <option value="Exterior">Exterior</option>
              <option value="Interior Finish">Interior Finish</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Report Document Container */}
      {loading ? (
        <LoadingSpinner label="Generating comprehensive monthly report..." fullHeight />
      ) : !reportData ? (
        <div className="text-center py-16 text-slate-500">
          <p>Failed to generate report.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Printable Report Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-600 text-white">
                Construction Report
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                {reportData.reportMetadata.monthName} {reportData.reportMetadata.year}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Target Scope:{' '}
                <strong>
                  {reportData.reportMetadata.propertyInfo
                    ? `${reportData.reportMetadata.propertyInfo.name} (${reportData.reportMetadata.propertyInfo.propertyId})`
                    : reportData.reportMetadata.ownerInfo
                    ? `Client: ${reportData.reportMetadata.ownerInfo.name}`
                    : 'All Monitored Projects'}
                </strong>{' '}
                • Category: <strong>{reportData.reportMetadata.filterCategory}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 space-y-1">
              <p>Generated: {formatDate(new Date(), 'PPpp')}</p>
              <p>KAILASH BHAWAN System v1.0</p>
              <p className="font-semibold text-emerald-600">
                {reportData.summary.budgetHealth}
              </p>
            </div>
          </div>

          {/* 1. Key Performance Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Progress
              </span>
              <p className="text-2xl font-black text-brand-600 mt-1">
                {reportData.summary.progressPercentage}%
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {reportData.summary.completedTasks} of {reportData.summary.totalTasks} tasks done
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                In Progress
              </span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {reportData.summary.inProgressTasks}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Active site tasks</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Overdue Tasks
              </span>
              <p
                className={`text-2xl font-black mt-1 ${
                  reportData.summary.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {reportData.summary.overdueTasks}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Past due date</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cost Variance
              </span>
              <p
                className={`text-2xl font-black mt-1 ${
                  reportData.summary.costVariance <= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {reportData.summary.costVariance <= 0 ? '-' : '+'}
                {formatCurrency(Math.abs(reportData.summary.costVariance))}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Actual: {formatCurrency(reportData.summary.totalActualCost)}
              </p>
            </div>
          </div>

          {/* 2. Charts Section: Expenses by Category + Daily Activity Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Planned vs Actual Expenses */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Planned vs Actual Expenses by Category
                  </h3>
                  <p className="text-xs text-slate-500">
                    Estimated allocation vs incurred costs in INR (₹)
                  </p>
                </div>
              </div>

              {reportData.categoryBreakdown.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No trade category cost records for this month
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.categoryBreakdown}
                      margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 10 }}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `₹${v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${v / 1000}k`}`}
                      />
                      <Tooltip
                        formatter={(val: number) => formatCurrency(val)}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Bar dataKey="estimatedCost" name="Estimated Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actualCost" name="Actual Cost" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Daily Activity & Work Completion Trends */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Daily Activity & Completion Trend
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tasks started and completed day by day in {reportData.reportMetadata.monthName}
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reportData.dailyActivityChart}
                    margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="dayNumber" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Tasks Completed"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="started"
                      name="Tasks Commenced"
                      stroke="#0284c7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. Trade Category Breakdown Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Trade Category & Financial Breakdown
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Trade Category</th>
                    <th className="py-2.5 px-3">Tasks (Completed/Total)</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3">Estimated Budget</th>
                    <th className="py-2.5 px-3">Actual Spent</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.categoryBreakdown.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{cat.category}</td>
                      <td className="py-2.5 px-3">
                        {cat.completed} of {cat.total} tasks
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-brand-600">{cat.progress}%</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {formatCurrency(cat.estimatedCost)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {formatCurrency(cat.actualCost)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          cat.variance <= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {cat.variance <= 0 ? '-' : '+'}
                        {formatCurrency(Math.abs(cat.variance))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Photo Records Section (as specified in requirements) */}
          {reportData.photoRecords && reportData.photoRecords.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-brand-600" />
                  Site Progress Photo Records ({reportData.photoRecords.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {reportData.photoRecords.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setFullscreenPhoto(photo.url)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video cursor-pointer hover:shadow-md transition-all"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.taskName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded w-max mb-1 ${
                          photo.stage === 'after'
                            ? 'bg-emerald-600'
                            : photo.stage === 'before'
                            ? 'bg-slate-700'
                            : 'bg-blue-600'
                        }`}
                      >
                        {photo.stage}
                      </span>
                      <p className="text-[11px] font-bold truncate leading-tight">
                        {photo.taskName}
                      </p>
                      <p className="text-[9px] text-slate-300 truncate">{photo.propertyName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Complete Tasks Record Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Detailed Task Log ({reportData.tasks.length} items)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Task Name</th>
                    <th className="py-2.5 px-3">Site</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Worker</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actual Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{task.taskName}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {(task.property as any)?.name || 'Property'}
                      </td>
                      <td className="py-2 px-3">
                        <Badge category={task.category} size="sm" />
                      </td>
                      <td className="py-2 px-3 text-slate-600">{task.assignedWorker}</td>
                      <td className="py-2 px-3 text-slate-600">{formatDate(task.dueDate)}</td>
                      <td className="py-2 px-3">
                        <Badge status={task.status} size="sm" />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800">
                        {formatCurrency(task.actualCost || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {fullscreenPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullscreenPhoto(null)}
        >
          <img
            src={fullscreenPhoto}
            alt="Fullscreen"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};
