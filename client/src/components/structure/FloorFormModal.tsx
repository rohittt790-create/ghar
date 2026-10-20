import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Select } from '../common/Select.js';
import { Button } from '../common/Button.js';
import { Floor, FloorStatus } from '../../types/index.js';
import { structureApi } from '../../services/api.js';
import { Upload, X, Layers, Image as ImageIcon } from 'lucide-react';

interface FloorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  propertyId: string;
  floorToEdit?: Floor | null;
  existingFloorCount?: number;
}

const COMMON_FLOORS = [
  { name: 'Basement', number: -1 },
  { name: 'Ground Floor', number: 0 },
  { name: 'First Floor', number: 1 },
  { name: 'Second Floor', number: 2 },
  { name: 'Third Floor', number: 3 },
  { name: 'Terrace / Rooftop', number: 4 },
];

export const FloorFormModal: React.FC<FloorFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  propertyId,
  floorToEdit,
  existingFloorCount = 0,
}) => {
  const [name, setName] = useState('');
  const [floorNumber, setFloorNumber] = useState<number>(existingFloorCount);
  const [status, setStatus] = useState<FloorStatus>('in_progress');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [floorPlanImage, setFloorPlanImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (floorToEdit) {
      setName(floorToEdit.name);
      setFloorNumber(floorToEdit.floorNumber);
      setStatus(floorToEdit.status);
      setProgressPercentage(floorToEdit.progressPercentage || 0);
      setNotes(floorToEdit.notes || '');
      setFloorPlanImage(floorToEdit.floorPlanImage || '');
    } else {
      // Suggest next logical floor
      const defaultFloor = COMMON_FLOORS.find((f) => f.number === existingFloorCount) || {
        name: `Floor ${existingFloorCount}`,
        number: existingFloorCount,
      };
      setName(defaultFloor.name);
      setFloorNumber(defaultFloor.number);
      setStatus('in_progress');
      setProgressPercentage(0);
      setNotes('');
      setFloorPlanImage('');
    }
    setError('');
  }, [floorToEdit, isOpen, existingFloorCount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image file size must be under 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFloorPlanImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a floor name.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        name: name.trim(),
        floorNumber: Number(floorNumber),
        status,
        progressPercentage: Number(progressPercentage),
        notes: notes.trim(),
        floorPlanImage,
      };

      if (floorToEdit) {
        await structureApi.updateFloor(floorToEdit._id, payload);
      } else {
        await structureApi.createFloor(propertyId, payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving floor:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save floor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={floorToEdit ? `Edit Floor: ${floorToEdit.name}` : 'Add New House Floor'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Quick presets */}
        {!floorToEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_FLOORS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setName(preset.name);
                    setFloorNumber(preset.number);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    name === preset.name
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Floor Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ground Floor, First Floor"
            required
          />

          <Input
            label="Floor Index / Level"
            type="number"
            value={floorNumber}
            onChange={(e) => setFloorNumber(parseInt(e.target.value) || 0)}
            helperText="-1 for Basement, 0 for Ground, 1 for 1st Floor, etc."
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Construction Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as FloorStatus)}
            options={[
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Floor Progress ({progressPercentage}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercentage}
              onChange={(e) => setProgressPercentage(Number(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Floor Plan / Layout Blueprint Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Floor Plan / Architectural Blueprint (Optional)
          </label>
          {floorPlanImage ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-900">
              <img
                src={floorPlanImage}
                alt="Floor Plan"
                className="w-full h-44 object-contain bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setFloorPlanImage('')}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-amber-50/20">
              <ImageIcon className="w-8 h-8 text-slate-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-700">Upload Blueprint or Layout Photo</span>
              <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 8MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes / Structural Specifications
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="Add structural notes, ceiling height, wiring shafts..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="bg-amber-600 hover:bg-amber-700">
            {floorToEdit ? 'Update Floor' : 'Create Floor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
