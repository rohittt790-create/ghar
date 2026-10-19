import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal.js';
import { Badge } from '../common/Badge.js';
import { Button } from '../common/Button.js';
import { Task, TaskStatus, PhotoStage } from '../../types/index.js';
import { tasksApi } from '../../services/api.js';
import { formatCurrency, formatDate, getDueStatus } from '../../utils/formatters.js';
import {
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  User,
  Phone,
  Building,
  Upload,
  Camera,
  History,
  AlertTriangle,
  Edit2,
  Trash2,
  FileText,
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
  onTaskUpdated: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onTaskUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'history' | 'details'>('photos');
  const [photoFilter, setPhotoFilter] = useState<'all' | PhotoStage>('all');
  const [uploadStage, setUploadStage] = useState<PhotoStage>('during');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  if (!task) return null;

  const propertyObj = typeof task.property === 'object' ? task.property : null;
  const ownerObj = propertyObj && typeof propertyObj.owner === 'object' ? propertyObj.owner : null;
  const dueInfo = getDueStatus(task.dueDate, task.status);

  // Group photos into before, during, after
  const beforePhotos = task.progressPhotos?.filter((p) => p.stage === 'before') || [];
  const duringPhotos = task.progressPhotos?.filter((p) => p.stage === 'during') || [];
  const afterPhotos = task.progressPhotos?.filter((p) => p.stage === 'after') || [];

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      setUpdatingStatus(true);
      if (newStatus === 'completed') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
      await tasksApi.updateStatus(task._id, {
        status: newStatus,
        notes: `Status changed to ${newStatus.replace('_', ' ')} from Task Detail panel.`,
      });
      onTaskUpdated();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUploadPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('stage', uploadStage);
      formData.append('caption', uploadCaption.trim() || `${uploadStage} stage work documentation`);
      uploadFiles.forEach((file) => {
        formData.append('photos', file);
      });

      await tasksApi.uploadPhotos(task._id, formData);
      setUploadFiles([]);
      setUploadCaption('');
      onTaskUpdated();
    } catch (err) {
      console.error('Failed to upload photos:', err);
    } finally {
      setUploading(false);
    }
  };

  const displayedPhotos =
    photoFilter === 'all'
      ? task.progressPhotos || []
      : task.progressPhotos?.filter((p) => p.stage === photoFilter) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.taskName}
      subtitle={`Task ID: ${task._id.substring(task._id.length - 8).toUpperCase()}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Top Badges and Property Snippet */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <Badge status={task.status} size="md" />
            <Badge priority={task.priority} size="md" />
            <Badge category={task.category} size="md" />
            {dueInfo.isOverdue && (
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {dueInfo.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onEdit(task);
              }}
            >
              Edit Task
            </Button>
          </div>
        </div>

        {/* Quick Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Status Update:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStatusChange('not_started')}
              disabled={updatingStatus || task.status === 'not_started'}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                task.status === 'not_started'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Not Started
            </button>
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={updatingStatus || task.status === 'in_progress'}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                task.status === 'in_progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={updatingStatus || task.status === 'completed'}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                task.status === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              ✓ Complete
            </button>
            <button
              onClick={() => handleStatusChange('on_hold')}
              disabled={updatingStatus || task.status === 'on_hold'}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                task.status === 'on_hold'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              On Hold
            </button>
          </div>
        </div>

        {/* Details Grid (Worker, Dates, Financials) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Worker */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-brand-600" />
              Assigned Contractor
            </p>
            <p className="text-xs font-bold text-slate-900">{task.assignedWorker}</p>
            {task.workerPhone ? (
              <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-brand-600" />
                {task.workerPhone}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-0.5">No direct phone</p>
            )}
          </div>

          {/* Schedule */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-brand-600" />
              Schedule & Due Date
            </p>
            <p className="text-xs font-bold text-slate-900">
              Start: {formatDate(task.startDate)}
            </p>
            <p className="text-xs text-slate-700 mt-0.5 font-medium">
              Due: {formatDate(task.dueDate)}
            </p>
            {task.completedDate && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Completed: {formatDate(task.completedDate)}
              </p>
            )}
          </div>

          {/* Financials */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-brand-600" />
              Cost Tracking
            </p>
            <p className="text-xs font-bold text-slate-900">
              Actual: {formatCurrency(task.actualCost)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Estimated: {formatCurrency(task.estimatedCost)}
            </p>
            <p
              className={`text-[10px] font-semibold mt-0.5 ${
                (task.actualCost || 0) <= (task.estimatedCost || 0)
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {(task.actualCost || 0) <= (task.estimatedCost || 0)
                ? 'Within estimated cost'
                : `Over budget by ${formatCurrency((task.actualCost || 0) - (task.estimatedCost || 0))}`}
            </p>
          </div>
        </div>

        {/* Description & Notes */}
        {task.description && (
          <div className="p-3.5 bg-white rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              Work Scope & Description
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          </div>
        )}

        {/* Tab Navigation: Progress Photos vs Work History */}
        <div className="border-b border-slate-200 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Progress Photos ({task.progressPhotos?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Work History & Log ({task.history?.length || 0})
          </button>
        </div>

        {/* TAB 1: Progress Photos & Before/After Comparison */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            {/* Before vs After Side-by-Side Highlight (if both exist) */}
            {beforePhotos.length > 0 && afterPhotos.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Before & After Comparison
                  </h4>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                    Milestone Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Before */}
                  <div className="rounded-xl overflow-hidden bg-slate-950/60 border border-white/10">
                    <div className="relative aspect-video">
                      <img
                        src={beforePhotos[0].url}
                        alt="Before"
                        onClick={() => setFullscreenPhoto(beforePhotos[0].url)}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-slate-900/90 text-white px-2 py-0.5 rounded">
                        Before Work
                      </span>
                    </div>
                    <p className="text-[11px] p-2 text-slate-300 truncate">
                      {beforePhotos[0].caption || 'Initial state before work commenced'}
                    </p>
                  </div>

                  {/* After */}
                  <div className="rounded-xl overflow-hidden bg-slate-950/60 border border-white/10">
                    <div className="relative aspect-video">
                      <img
                        src={afterPhotos[0].url}
                        alt="After"
                        onClick={() => setFullscreenPhoto(afterPhotos[0].url)}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">
                        After Completion
                      </span>
                    </div>
                    <p className="text-[11px] p-2 text-slate-300 truncate">
                      {afterPhotos[0].caption || 'Finished installation sign-off'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Filter pills: All, Before, During, After */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { key: 'all', label: `All (${task.progressPhotos?.length || 0})` },
                  { key: 'before', label: `Before (${beforePhotos.length})` },
                  { key: 'during', label: `During (${duringPhotos.length})` },
                  { key: 'after', label: `After (${afterPhotos.length})` },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setPhotoFilter(item.key as any)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      photoFilter === item.key
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photos Grid */}
            {displayedPhotos.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No photos in this stage category.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {displayedPhotos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setFullscreenPhoto(photo.url)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer hover:shadow-md transition-all"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Photo'}
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
                      {photo.caption && (
                        <p className="text-[11px] font-semibold truncate leading-tight">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Additional Progress Photos Form */}
            <form
              onSubmit={handleUploadPhotos}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-brand-600" />
                  Upload Additional Progress Photos
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Stage:</span>
                  <select
                    value={uploadStage}
                    onChange={(e) => setUploadStage(e.target.value as PhotoStage)}
                    className="text-xs font-bold rounded-lg border border-slate-300 py-1 px-2 bg-white"
                  >
                    <option value="before">Before</option>
                    <option value="during">During</option>
                    <option value="after">After</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm shrink-0">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  Choose Files ({uploadFiles.length})
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) setUploadFiles(Array.from(e.target.files));
                    }}
                  />
                </label>
                <input
                  type="text"
                  placeholder="Caption for this update..."
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="flex-1 w-full text-xs rounded-lg border border-slate-300 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={uploading}
                  disabled={uploadFiles.length === 0}
                >
                  Upload
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Work History Log */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {(!task.history || task.history.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-6">No history records logged yet.</p>
            ) : (
              <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-200">
                {task.history.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-white shrink-0 mt-1" />
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{h.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(h.timestamp, 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {h.previousStatus && h.newStatus && (
                        <p className="text-xs text-brand-700 mt-0.5">
                          Status transition: {h.previousStatus.replace('_', ' ')} →{' '}
                          <strong>{h.newStatus.replace('_', ' ')}</strong>
                        </p>
                      )}
                      {h.notes && <p className="text-xs text-slate-600 mt-1">{h.notes}</p>}
                      <p className="text-[10px] text-slate-400 mt-1">Logged by: {h.changedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Photo Lightbox Modal */}
        {fullscreenPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
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
    </Modal>
  );
};
