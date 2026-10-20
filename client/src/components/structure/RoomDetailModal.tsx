import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { Room, RoomDefect } from '../../types/index.js';
import { structureApi } from '../../services/api.js';
import {
  Maximize2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Wrench,
  Camera,
  Calendar,
  Sparkles,
  Check,
  X,
  Plus,
} from 'lucide-react';

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onEditRoom: (room: Room) => void;
  onRoomUpdated: () => void;
  onAssignResident?: (room: Room) => void;
}

const TRADE_LABELS: Record<string, string> = {
  electrical: 'Electrical Wiring',
  plumbing: 'Plumbing & Drainage',
  flooring: 'Tiles & Flooring',
  painting: 'Wall Painting & Primer',
  doors: 'Doors & Locks',
  windows: 'Windows & Glazing',
};

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  isOpen,
  onClose,
  room,
  onEditRoom,
  onRoomUpdated,
  onAssignResident,
}) => {
  if (!room) return null;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showDefectForm, setShowDefectForm] = useState(false);
  const [defectDesc, setDefectDesc] = useState('');
  const [defectSeverity, setDefectSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [defectPhoto, setDefectPhoto] = useState('');
  const [resolvingDefectId, setResolvingDefectId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const floorObj = typeof room.floor === 'object' ? room.floor : null;
  const floorName = floorObj?.name || 'Assigned Floor';

  const handleAddDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectDesc.trim()) return;
    try {
      setLoading(true);
      setError('');
      await structureApi.addDefect(room._id, {
        description: defectDesc.trim(),
        severity: defectSeverity,
        photo: defectPhoto || undefined,
      });
      setDefectDesc('');
      setDefectPhoto('');
      setShowDefectForm(false);
      onRoomUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to report defect');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDefect = async (defectId: string) => {
    try {
      setLoading(true);
      setError('');
      await structureApi.resolveDefect(room._id, defectId, resolutionNotes.trim());
      setResolvingDefectId(null);
      setResolutionNotes('');
      onRoomUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to resolve defect');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setDefectPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = () => {
    if (room.occupancyStatus === 'occupied') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Occupied ({room.activeOccupants?.length || 0})
        </span>
      );
    }
    if (room.occupancyStatus === 'under_maintenance') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5" />
          Under Maintenance
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Vacant / Ready
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${room.name} (${room.roomId})`}
      maxWidth="2xl"
    >
      <div className="space-y-6 max-h-[82vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {room.roomType.replace('_', ' ')}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  {floorName}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{room.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEditRoom(room);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
              >
                Edit Room
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Floor Area</span>
              <p className="text-lg font-black text-amber-300">
                {room.areaSqFt ? `${room.areaSqFt} sq ft` : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Dimensions</span>
              <p className="text-sm font-bold text-white">
                {room.dimensions
                  ? `${room.dimensions.length}' × ${room.dimensions.width}' × ${room.dimensions.height}'`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Construction</span>
              <p className="text-sm font-bold text-emerald-400 capitalize">
                {room.constructionStatus.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Interiors</span>
              <p className="text-sm font-bold text-sky-400 capitalize">
                {room.interiorStatus.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery / Photos */}
        {room.photos && room.photos.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-600" />
              Room Photographs ({room.photos.length})
            </h4>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video max-h-72 flex items-center justify-center">
              <img
                src={room.photos[activePhotoIdx] || room.photos[0]}
                alt="Room photograph"
                className="w-full h-full object-contain"
              />
            </div>
            {room.photos.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {room.photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                      activePhotoIdx === i ? 'border-amber-600' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Occupants Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              Assigned Residents ({room.activeOccupants?.length || 0})
            </h4>
            {onAssignResident && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onAssignResident(room);
                }}
                className="text-xs py-1"
              >
                + Assign Resident
              </Button>
            )}
          </div>

          {room.activeOccupants && room.activeOccupants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.activeOccupants.map((occ) => (
                <div
                  key={occ._id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-xs"
                >
                  {occ.profilePhoto ? (
                    <img
                      src={occ.profilePhoto}
                      alt={occ.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm border border-amber-200">
                      {occ.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm text-slate-800 truncate">{occ.name}</h5>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="capitalize">{occ.relationship}</span>
                      {occ.phone && <span>• {occ.phone}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500 italic">
              No residents currently assigned to this room.
            </div>
          )}
        </div>

        {/* Trade & Finishes Checklist */}
        <div className="border border-slate-200 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Finishes & Trade Handover Checklist
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(TRADE_LABELS).map(([tradeKey, tradeTitle]) => {
              const statusVal = room.checklist?.[tradeKey as keyof typeof room.checklist] || 'not_started';
              const isDone = statusVal === 'completed';
              const isProgress = statusVal === 'in_progress';
              return (
                <div
                  key={tradeKey}
                  className={`p-3 rounded-xl border ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : isProgress
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{tradeTitle}</span>
                    {isDone ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : isProgress ? (
                      <Clock className="w-4 h-4 text-amber-600" />
                    ) : null}
                  </div>
                  <span className="text-[11px] capitalize font-medium opacity-80">
                    {statusVal.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Defects & Maintenance Log */}
        <div className="border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Defects & Snag List ({room.defects?.length || 0})
            </h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDefectForm(!showDefectForm)}
              className="text-xs py-1"
            >
              {showDefectForm ? 'Cancel' : '+ Report Defect'}
            </Button>
          </div>

          {showDefectForm && (
            <form onSubmit={handleAddDefect} className="bg-red-50/50 border border-red-200 rounded-xl p-3 mb-4 space-y-3">
              <h5 className="text-xs font-bold text-red-900">Record Snag or Maintenance Defect</h5>
              <div>
                <input
                  type="text"
                  value={defectDesc}
                  onChange={(e) => setDefectDesc(e.target.value)}
                  placeholder="Defect description (e.g. leaking faucet, paint crack on east wall)..."
                  className="w-full text-xs px-3 py-2 bg-white border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={defectSeverity}
                  onChange={(e) => setDefectSeverity(e.target.value as any)}
                  className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                >
                  <option value="low">Low Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="high">High Severity</option>
                  <option value="critical">Critical / Urgent</option>
                </select>

                <label className="text-xs font-medium text-slate-600 cursor-pointer flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>{defectPhoto ? 'Photo Added' : 'Attach Photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>

                <Button variant="danger" size="sm" type="submit" loading={loading} className="ml-auto text-xs py-1.5">
                  Save Defect
                </Button>
              </div>
            </form>
          )}

          {room.defects && room.defects.length > 0 ? (
            <div className="space-y-2">
              {room.defects.map((defect) => (
                <div
                  key={defect._id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    defect.resolved
                      ? 'bg-slate-50 border-slate-200 opacity-75'
                      : 'bg-red-50/40 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                        defect.severity === 'critical'
                          ? 'bg-red-600 text-white'
                          : defect.severity === 'high'
                          ? 'bg-orange-500 text-white'
                          : defect.severity === 'medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {defect.severity}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{defect.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>Reported {new Date(defect.reportedAt).toLocaleDateString()}</span>
                        {defect.resolved && (
                          <span className="text-emerald-700 font-bold">
                            • Resolved {defect.resolvedAt ? new Date(defect.resolvedAt).toLocaleDateString() : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!defect.resolved && (
                    <div className="shrink-0 flex items-center gap-2">
                      {resolvingDefectId === defect._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Resolution notes..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="text-xs px-2 py-1 bg-white border border-slate-300 rounded"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => defect._id && handleResolveDefect(defect._id)}
                            loading={loading}
                            className="text-xs py-1"
                          >
                            Save
                          </Button>
                          <button
                            type="button"
                            onClick={() => setResolvingDefectId(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setResolvingDefectId(defect._id || null)}
                          className="text-xs py-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No defects or repair snags recorded for this room.</p>
          )}
        </div>

        {/* Structural Notes */}
        {room.notes && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            <span className="font-bold block mb-1">Architectural & Material Notes:</span>
            {room.notes}
          </div>
        )}
      </div>
    </Modal>
  );
};
