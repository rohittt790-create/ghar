import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Select } from '../common/Select.js';
import { Button } from '../common/Button.js';
import { Property, Owner, PropertyStatus, PropertyType } from '../../types/index.js';
import { propertiesApi, ownersApi } from '../../services/api.js';
import { Upload, X } from 'lucide-react';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  propertyToEdit?: Property | null;
  initialOwnerId?: string;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  propertyToEdit,
  initialOwnerId,
}) => {
  const [propertyId, setPropertyId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [owner, setOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [status, setStatus] = useState<PropertyStatus>('in_progress');
  const [estimatedBudget, setEstimatedBudget] = useState<number | string>(300000);
  const [squareFeet, setSquareFeet] = useState<number | string>(2800);
  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  const [notes, setNotes] = useState('');
  const [ownersList, setOwnersList] = useState<Owner[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOwners = async () => {
      try {
        const data = await ownersApi.getAll();
        if (data.success) {
          setOwnersList(data.owners);
          if (!owner && data.owners.length > 0) {
            setOwner(initialOwnerId || data.owners[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load owners list:', err);
      }
    };
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen, initialOwnerId]);

  useEffect(() => {
    if (propertyToEdit) {
      setPropertyId(propertyToEdit.propertyId || '');
      setName(propertyToEdit.name || '');
      setAddress(propertyToEdit.address || '');
      setCity(propertyToEdit.city || '');
      setState(propertyToEdit.state || '');
      setZipCode(propertyToEdit.zipCode || '');
      setOwner(
        typeof propertyToEdit.owner === 'object'
          ? (propertyToEdit.owner as any)._id
          : propertyToEdit.owner
      );
      setStartDate(propertyToEdit.startDate ? propertyToEdit.startDate.split('T')[0] : '');
      setExpectedCompletionDate(
        propertyToEdit.expectedCompletionDate
          ? propertyToEdit.expectedCompletionDate.split('T')[0]
          : ''
      );
      setStatus(propertyToEdit.status || 'in_progress');
      setEstimatedBudget(propertyToEdit.estimatedBudget || 0);
      setSquareFeet(propertyToEdit.squareFeet || 0);
      setPropertyType(propertyToEdit.propertyType || 'residential');
      setNotes(propertyToEdit.notes || '');
      setExistingPhotos(propertyToEdit.propertyPhotos || []);
      setPhotoFiles([]);
    } else {
      const generatedId = `PROP-${Math.floor(100 + Math.random() * 900)}`;
      setPropertyId(generatedId);
      setName('');
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setStartDate(new Date().toISOString().split('T')[0]);
      // Default expected 6 months ahead
      const next6Months = new Date();
      next6Months.setMonth(next6Months.getMonth() + 6);
      setExpectedCompletionDate(next6Months.toISOString().split('T')[0]);
      setStatus('in_progress');
      setEstimatedBudget(350000);
      setSquareFeet(3000);
      setPropertyType('residential');
      setNotes('');
      setExistingPhotos([]);
      setPhotoFiles([]);
    }
    setError('');
  }, [propertyToEdit, isOpen]);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotoFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !name || !address || !city || !owner || !startDate || !expectedCompletionDate) {
      setError('Please fill in Property ID, Name, Address, City, Owner, and Timeline Dates.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('propertyId', propertyId.trim().toUpperCase());
      formData.append('name', name.trim());
      formData.append('address', address.trim());
      formData.append('city', city.trim());
      formData.append('state', state.trim());
      formData.append('zipCode', zipCode.trim());
      formData.append('owner', owner);
      formData.append('startDate', startDate);
      formData.append('expectedCompletionDate', expectedCompletionDate);
      formData.append('status', status);
      formData.append('estimatedBudget', String(estimatedBudget));
      formData.append('squareFeet', String(squareFeet));
      formData.append('propertyType', propertyType);
      formData.append('notes', notes.trim());

      photoFiles.forEach((file) => {
        formData.append('propertyPhotos', file);
      });

      if (propertyToEdit) {
        await propertiesApi.update(propertyToEdit._id, formData);
      } else {
        await propertiesApi.create(formData);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save property record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={propertyToEdit ? 'Edit Property Site' : 'Add New Property Site'}
      subtitle="Configure site location, client ownership, budget, and construction timeline."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Property ID"
            required
            placeholder="e.g. PROP-101"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value.toUpperCase())}
          />
          <div className="sm:col-span-2">
            <Input
              label="Property / Project Name"
              required
              placeholder="e.g. Skyline Modern Villa"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Owner Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="House Owner (Client)"
            required
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            options={ownersList.map((o) => ({
              value: o._id,
              label: `${o.name} (${o.phone})`,
            }))}
          />
          <Select
            label="Property Type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            options={[
              { value: 'residential', label: 'Single Family Residential' },
              { value: 'villa', label: 'Luxury Custom Villa' },
              { value: 'duplex', label: 'Duplex / Multi-unit' },
              { value: 'renovation', label: 'Major Renovation / Gut' },
              { value: 'commercial', label: 'Light Commercial' },
              { value: 'other', label: 'Other Construction' },
            ]}
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Site Street Address"
            required
            placeholder="e.g. 450 Hillside Ridge Drive"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="City"
              required
              placeholder="Austin"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="State"
              placeholder="TX"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Input
              label="ZIP Code"
              placeholder="78746"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>
        </div>

        {/* Timeline & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Construction Start Date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Expected Completion Date"
            type="date"
            required
            value={expectedCompletionDate}
            onChange={(e) => setExpectedCompletionDate(e.target.value)}
          />
          <Select
            label="Current Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyStatus)}
            options={[
              { value: 'planning', label: 'Planning & Permitting' },
              { value: 'in_progress', label: 'In Progress (Active)' },
              { value: 'completed', label: 'Completed' },
              { value: 'on_hold', label: 'On Hold' },
            ]}
          />
        </div>

        {/* Financials & Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Estimated Total Budget (₹ INR)"
            type="number"
            min="0"
            step="1000"
            value={estimatedBudget}
            onChange={(e) => setEstimatedBudget(e.target.value)}
          />
          <Input
            label="Total Area (Square Feet)"
            type="number"
            min="0"
            value={squareFeet}
            onChange={(e) => setSquareFeet(e.target.value)}
          />
        </div>

        {/* Upload Property Photos */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Property Photos & Architectural Renderings
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Choose Images to Upload
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFilesSelect}
              />
            </label>
            <span className="text-xs text-slate-500">
              {photoFiles.length} new photo(s) selected
            </span>
          </div>

          {/* New files preview chips */}
          {photoFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {photoFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md text-xs text-slate-700"
                >
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Existing Photos thumbnails */}
          {existingPhotos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Existing photos ({existingPhotos.length}):</p>
              <div className="flex flex-wrap gap-2">
                {existingPhotos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Existing ${i}`}
                    className="w-12 h-12 object-cover rounded-md border border-slate-300"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Site Notes & Structural Specs
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            placeholder="Special architectural notes, permits, environmental requirements..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {propertyToEdit ? 'Save Changes' : 'Create Property Site'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
