import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { Input } from '../common/Input.js';
import { Floor, Room, Resident } from '../../types/index.js';
import { structureApi } from '../../services/api.js';
import { ArrowLeftRight, UserMinus, History, CheckCircle2 } from 'lucide-react';

interface ResidentReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  resident: Resident | null;
  floors: Floor[];
  rooms: Room[];
}

export const ResidentReassignModal: React.FC<ResidentReassignModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  resident,
  floors,
  rooms,
}) => {
  if (!resident) return null;

  const [activeMode, setActiveMode] = useState<'reassign' | 'move_out'>('reassign');
  const [selectedFloorId, setSelectedFloorId] = useState<string>(
    typeof resident.currentFloor === 'object'
      ? (resident.currentFloor as any)?._id || ''
      : resident.currentFloor || ''
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    typeof resident.currentRoom === 'object'
      ? (resident.currentRoom as any)?._id || ''
      : resident.currentRoom || ''
  );
  const [reason, setReason] = useState<string>('');
  const [moveOutDate, setMoveOutDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [moveOutNotes, setMoveOutNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableRooms = selectedFloorId
    ? rooms.filter((r) => {
        const fId = typeof r.floor === 'object' ? (r.floor as any)?._id : r.floor;
        return fId === selectedFloorId;
      })
    : rooms;

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await structureApi.reassignResident(resident._id, {
        floorId: selectedFloorId || undefined,
        roomId: selectedRoomId || undefined,
        reason: reason.trim(),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reassign resident');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await structureApi.markResidentMoveOut(resident._id, {
        moveOutDate,
        notes: moveOutNotes.trim(),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to record resident move-out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resident Management: ${resident.name}`}
    >
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Tab selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('reassign')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeMode === 'reassign'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-amber-600" />
            Transfer Room / Floor
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('move_out')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeMode === 'move_out'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-600 hover:text-red-600'
            }`}
          >
            <UserMinus className="w-4 h-4 text-red-600" />
            Mark as Moved Out
          </button>
        </div>

        {activeMode === 'reassign' ? (
          <form onSubmit={handleReassign} className="space-y-4">
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900">
              Transferring will update {resident.name}'s active room while permanently archiving the previous room assignment history.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Destination Floor
              </label>
              <select
                value={selectedFloorId}
                onChange={(e) => {
                  setSelectedFloorId(e.target.value);
                  setSelectedRoomId('');
                }}
                className="w-full text-sm bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">-- No Floor Assigned --</option>
                {floors.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} (Level {f.floorNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Destination Room
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">-- No Room Assigned --</option>
                {availableRooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.roomId}) - {r.roomType.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Transfer Reason (Optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Moved to larger master bedroom on 1st floor"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={loading} className="bg-amber-600 hover:bg-amber-700">
                Confirm Room Transfer
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMoveOut} className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
              Marking as moved out releases current room occupancy and updates status to <strong>Moved Out</strong> while permanently preserving history.
            </div>

            <Input
              label="Move-Out Date"
              type="date"
              value={moveOutDate}
              onChange={(e) => setMoveOutDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departure Notes / Forwarding Info
              </label>
              <textarea
                value={moveOutNotes}
                onChange={(e) => setMoveOutNotes(e.target.value)}
                rows={3}
                placeholder="Lease term completed, keys handed over, forwarding address..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
                Cancel
              </Button>
              <Button variant="danger" type="submit" loading={loading}>
                Confirm Resident Departure
              </Button>
            </div>
          </form>
        )}

        {/* Historical Assignment Log */}
        {resident.assignmentHistory && resident.assignmentHistory.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Room Assignment Timeline
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {resident.assignmentHistory.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{item.roomName || 'Unassigned'} ({item.floorName || 'General'})</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.assignedAt).toLocaleDateString()}
                      {item.vacatedAt ? ` → ${new Date(item.vacatedAt).toLocaleDateString()}` : ' (Active)'}
                    </span>
                  </div>
                  {item.reason && <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
