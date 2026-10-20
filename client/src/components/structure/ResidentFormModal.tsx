import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Select } from '../common/Select.js';
import { Button } from '../common/Button.js';
import {
  Floor,
  Room,
  Resident,
  ResidentRelationship,
  ResidentStatus,
} from '../../types/index.js';
import { structureApi } from '../../services/api.js';
import { Upload, X, User as UserIcon } from 'lucide-react';

interface ResidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  propertyId: string;
  floors: Floor[];
  rooms: Room[];
  residentToEdit?: Resident | null;
  initialRoomId?: string;
}

const RELATIONSHIP_OPTIONS: Array<{ value: ResidentRelationship; label: string }> = [
  { value: 'owner', label: 'Primary Owner' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child / Son / Daughter' },
  { value: 'parent', label: 'Parent / Mother / Father' },
  { value: 'relative', label: 'Relative / Family Member' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'other', label: 'Other Resident / Guest' },
];

export const ResidentFormModal: React.FC<ResidentFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  propertyId,
  floors,
  rooms,
  residentToEdit,
  initialRoomId,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<ResidentRelationship>('relative');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [floorId, setFloorId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [moveInDate, setMoveInDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ResidentStatus>('currently_living');
  const [notes, setNotes] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter rooms when floor changes
  const availableRooms = floorId
    ? rooms.filter((r) => {
        const rFloorId = typeof r.floor === 'object' ? (r.floor as any)?._id : r.floor;
        return rFloorId === floorId;
      })
    : rooms;

  useEffect(() => {
    if (residentToEdit) {
      setName(residentToEdit.name);
      setRelationship(residentToEdit.relationship);
      setPhone(residentToEdit.phone || '');
      setEmail(residentToEdit.email || '');
      setAge(residentToEdit.age !== undefined ? String(residentToEdit.age) : '');
      setDob(residentToEdit.dob || '');

      const currentFloorId =
        typeof residentToEdit.currentFloor === 'object'
          ? (residentToEdit.currentFloor as any)?._id
          : residentToEdit.currentFloor || '';
      const currentRoomId =
        typeof residentToEdit.currentRoom === 'object'
          ? (residentToEdit.currentRoom as any)?._id
          : residentToEdit.currentRoom || '';

      setFloorId(currentFloorId);
      setRoomId(currentRoomId);
      setMoveInDate(
        residentToEdit.moveInDate
          ? new Date(residentToEdit.moveInDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setStatus(residentToEdit.status || 'currently_living');
      setNotes(residentToEdit.notes || '');
      setProfilePhoto(residentToEdit.profilePhoto || '');
    } else {
      setName('');
      setRelationship('child');
      setPhone('');
      setEmail('');
      setAge('');
      setDob('');

      let defaultFloor = '';
      let defaultRoom = '';

      if (initialRoomId) {
        const foundRoom = rooms.find((r) => r._id === initialRoomId);
        if (foundRoom) {
          defaultRoom = foundRoom._id;
          defaultFloor = typeof foundRoom.floor === 'object' ? (foundRoom.floor as any)?._id : foundRoom.floor;
        }
      } else if (floors.length > 0) {
        defaultFloor = floors[0]._id;
      }

      setFloorId(defaultFloor);
      setRoomId(defaultRoom);
      setMoveInDate(new Date().toISOString().split('T')[0]);
      setStatus('currently_living');
      setNotes('');
      setProfilePhoto('');
    }
    setError('');
  }, [residentToEdit, isOpen, initialRoomId, floors, rooms]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide the resident full name.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        name: name.trim(),
        relationship,
        phone: phone.trim(),
        email: email.trim(),
        age: age ? Number(age) : undefined,
        dob: dob || undefined,
        currentFloor: floorId || undefined,
        currentRoom: roomId || undefined,
        moveInDate: moveInDate || undefined,
        status,
        notes: notes.trim(),
        profilePhoto,
      };

      if (residentToEdit) {
        await structureApi.updateResident(residentToEdit._id, payload);
      } else {
        await structureApi.createResident(propertyId, payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving resident:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save resident profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={residentToEdit ? `Edit Resident: ${residentToEdit.name}` : 'Add Resident to House'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Profile Photo & Basic Identity */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="relative">
            {profilePhoto ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-sm relative group">
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setProfilePhoto('')}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white flex flex-col items-center justify-center cursor-pointer transition-colors">
                <UserIcon className="w-6 h-6 text-slate-400" />
                <span className="text-[9px] text-slate-500 font-semibold mt-0.5">Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Resident Photo & Privacy</h4>
            <p className="text-[11px] text-slate-500">
              Only authorized household administrators can view contact details. No government IDs required.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Sharma"
            required
          />

          <Select
            label="Relationship to Family / Owner"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as ResidentRelationship)}
            options={RELATIONSHIP_OPTIONS}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="resident@example.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Age (Years)"
            type="number"
            min="0"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 28"
          />

          <Input
            label="Move-In Date"
            type="date"
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
            required
          />
        </div>

        {/* Floor and Room Allocation */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Room & Floor Allocation
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Floor</label>
              <select
                value={floorId}
                onChange={(e) => {
                  setFloorId(e.target.value);
                  setRoomId('');
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Room</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
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
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tip: Multiple residents can comfortably share a bedroom or suite.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Living Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ResidentStatus)}
            options={[
              { value: 'currently_living', label: 'Currently Living' },
              { value: 'temporarily_away', label: 'Temporarily Away' },
              { value: 'moved_out', label: 'Moved Out' },
            ]}
          />

          <Input
            label="Notes / Special Requirements"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dietary preferences, parking space, key tag..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="bg-amber-600 hover:bg-amber-700">
            {residentToEdit ? 'Update Resident' : 'Register Resident'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
