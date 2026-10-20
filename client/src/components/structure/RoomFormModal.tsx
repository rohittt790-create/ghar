import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Select } from '../common/Select.js';
import { Button } from '../common/Button.js';
import {
  Floor,
  Room,
  RoomType,
  RoomConstructionStatus,
  RoomInteriorStatus,
  RoomChecklist,
  TradeStatus,
} from '../../types/index.js';
import { structureApi } from '../../services/api.js';
import { Upload, X, Image as ImageIcon, CheckCircle, Calculator } from 'lucide-react';

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  propertyId: string;
  floors: Floor[];
  roomToEdit?: Room | null;
  initialFloorId?: string;
}

const ROOM_TYPE_OPTIONS: Array<{ value: RoomType; label: string }> = [
  { value: 'master_bedroom', label: 'Master Bedroom' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'living_room', label: 'Living Room' },
  { value: 'hall', label: 'Main Hall' },
  { value: 'kitchen', label: 'Kitchen / Modular' },
  { value: 'bathroom', label: 'Bathroom / Restroom' },
  { value: 'dining_room', label: 'Dining Room' },
  { value: 'pooja_room', label: 'Pooja / Prayer Room' },
  { value: 'balcony', label: 'Balcony / Veranda' },
  { value: 'study_room', label: 'Study / Home Office' },
  { value: 'store_room', label: 'Store Room' },
  { value: 'utility_room', label: 'Utility / Laundry' },
  { value: 'other', label: 'Other Space' },
];

const TRADE_STATUS_OPTIONS: Array<{ value: TradeStatus; label: string }> = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'not_applicable', label: 'N/A' },
];

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  propertyId,
  floors,
  roomToEdit,
  initialFloorId,
}) => {
  const [floorId, setFloorId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [roomType, setRoomType] = useState<RoomType>('bedroom');
  const [length, setLength] = useState<number>(14);
  const [width, setWidth] = useState<number>(12);
  const [height, setHeight] = useState<number>(10);
  const [constructionStatus, setConstructionStatus] = useState<RoomConstructionStatus>('in_progress');
  const [interiorStatus, setInteriorStatus] = useState<RoomInteriorStatus>('not_started');
  const [notes, setNotes] = useState<string>('');

  const [checklist, setChecklist] = useState<RoomChecklist>({
    electrical: 'not_started',
    plumbing: 'not_started',
    flooring: 'not_started',
    painting: 'not_started',
    doors: 'not_started',
    windows: 'not_started',
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto calculate square feet
  const calculatedArea = Math.round(Number(length || 0) * Number(width || 0) * 100) / 100;

  useEffect(() => {
    if (roomToEdit) {
      const fId = typeof roomToEdit.floor === 'object' ? (roomToEdit.floor as any)?._id : roomToEdit.floor;
      setFloorId(fId || (floors[0]?._id || ''));
      setRoomId(roomToEdit.roomId);
      setName(roomToEdit.name);
      setRoomType(roomToEdit.roomType);
      setLength(roomToEdit.dimensions?.length || 14);
      setWidth(roomToEdit.dimensions?.width || 12);
      setHeight(roomToEdit.dimensions?.height || 10);
      setConstructionStatus(roomToEdit.constructionStatus || 'in_progress');
      setInteriorStatus(roomToEdit.interiorStatus || 'not_started');
      setNotes(roomToEdit.notes || '');
      setChecklist(
        roomToEdit.checklist || {
          electrical: 'not_started',
          plumbing: 'not_started',
          flooring: 'not_started',
          painting: 'not_started',
          doors: 'not_started',
          windows: 'not_started',
        }
      );
      setPhotos(roomToEdit.photos || []);
    } else {
      const selectedFId = initialFloorId || (floors.length > 0 ? floors[0]._id : '');
      setFloorId(selectedFId);
      const randomNum = Math.floor(100 + Math.random() * 900);
      setRoomId(`RM-${randomNum}`);
      setName('Master Bedroom');
      setRoomType('master_bedroom');
      setLength(14);
      setWidth(12);
      setHeight(10);
      setConstructionStatus('in_progress');
      setInteriorStatus('not_started');
      setNotes('');
      setChecklist({
        electrical: 'not_started',
        plumbing: 'not_started',
        flooring: 'not_started',
        painting: 'not_started',
        doors: 'not_started',
        windows: 'not_started',
      });
      setPhotos([]);
    }
    setError('');
  }, [roomToEdit, isOpen, initialFloorId, floors]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image file must be under 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTrade = (trade: keyof RoomChecklist, value: TradeStatus) => {
    setChecklist((prev) => ({ ...prev, [trade]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floorId) {
      setError('Please select a floor for this room.');
      return;
    }
    if (!roomId.trim() || !name.trim()) {
      setError('Please provide a Room ID and Name.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        floor: floorId,
        roomId: roomId.trim().toUpperCase(),
        name: name.trim(),
        roomType,
        dimensions: {
          length: Number(length) || 0,
          width: Number(width) || 0,
          height: Number(height) || 0,
        },
        constructionStatus,
        interiorStatus,
        checklist,
        notes: notes.trim(),
        photos,
      };

      if (roomToEdit) {
        await structureApi.updateRoom(roomToEdit._id, payload);
      } else {
        await structureApi.createRoom(propertyId, payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving room:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={roomToEdit ? `Edit Room: ${roomToEdit.name}` : 'Add Room to Floor'}
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Floor Location"
            value={floorId}
            onChange={(e) => setFloorId(e.target.value)}
            options={floors.map((f) => ({
              value: f._id,
              label: `${f.name} (Level ${f.floorNumber})`,
            }))}
            required
          />

          <Select
            label="Room Space Type"
            value={roomType}
            onChange={(e) => {
              const val = e.target.value as RoomType;
              setRoomType(val);
              // auto suggest name if empty or generic
              const option = ROOM_TYPE_OPTIONS.find((o) => o.value === val);
              if (option && (!name || name.includes('Room') || name.includes('Bedroom'))) {
                setName(option.label);
              }
            }}
            options={ROOM_TYPE_OPTIONS}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Room Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Master Suite 1, Kids Room"
            required
          />

          <Input
            label="Unique Room Identifier"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="e.g. GF-R101, FF-MBD01"
            helperText="Code used in architectural prints"
            required
          />
        </div>

        {/* Dimensions & Area Auto-Calculation */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-600" />
              Dimensions & Calculated Area
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
              {calculatedArea.toLocaleString()} sq. ft.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Length (ft)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Width (ft)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Height (ft)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Statuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Construction Shell Status"
            value={constructionStatus}
            onChange={(e) => setConstructionStatus(e.target.value as RoomConstructionStatus)}
            options={[
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'needs_repair', label: 'Needs Repair' },
            ]}
          />

          <Select
            label="Interior Finishing Status"
            value={interiorStatus}
            onChange={(e) => setInteriorStatus(e.target.value as RoomInteriorStatus)}
            options={[
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>

        {/* MEP & Finishes Trade Checklist */}
        <div className="border border-slate-200 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Trade & Finishes Verification Checklist
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(
              [
                { key: 'electrical', label: 'Electrical' },
                { key: 'plumbing', label: 'Plumbing' },
                { key: 'flooring', label: 'Flooring / Tiles' },
                { key: 'painting', label: 'Painting' },
                { key: 'doors', label: 'Doors / Frames' },
                { key: 'windows', label: 'Windows & Glazing' },
              ] as const
            ).map((item) => (
              <div key={item.key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[11px] font-bold text-slate-700 mb-1.5">{item.label}</span>
                <select
                  value={checklist[item.key]}
                  onChange={(e) => updateTrade(item.key, e.target.value as TradeStatus)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {TRADE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Room Photos */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Room Photographs ({photos.length})
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                <img src={src} alt="Room" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <label className="w-20 h-20 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-amber-50/20">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-medium mt-1">Add Photo</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes / Finishes Details
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="Add specific ceiling fixtures, wall colors, AC points..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="bg-amber-600 hover:bg-amber-700">
            {roomToEdit ? 'Update Room' : 'Add Room'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
