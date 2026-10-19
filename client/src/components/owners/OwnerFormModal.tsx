import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { Owner } from '../../types/index.js';
import { ownersApi } from '../../services/api.js';
import { Upload, User } from 'lucide-react';

interface OwnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  ownerToEdit?: Owner | null;
}

export const OwnerFormModal: React.FC<OwnerFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  ownerToEdit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ownerToEdit) {
      setName(ownerToEdit.name || '');
      setEmail(ownerToEdit.email || '');
      setPhone(ownerToEdit.phone || '');
      setAddress(ownerToEdit.address || '');
      setCity(ownerToEdit.city || '');
      setState(ownerToEdit.state || '');
      setZipCode(ownerToEdit.zipCode || '');
      setNotes(ownerToEdit.notes || '');
      setEmergencyName(ownerToEdit.emergencyContact?.name || '');
      setEmergencyPhone(ownerToEdit.emergencyContact?.phone || '');
      setEmergencyRelation(ownerToEdit.emergencyContact?.relationship || '');
      setPreviewUrl(ownerToEdit.profilePicture || '');
      setProfileImageFile(null);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setNotes('');
      setEmergencyName('');
      setEmergencyPhone('');
      setEmergencyRelation('');
      setProfileImageFile(null);
      setPreviewUrl('');
    }
    setError('');
  }, [ownerToEdit, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Name, phone number, and address are required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      formData.append('city', city.trim());
      formData.append('state', state.trim());
      formData.append('zipCode', zipCode.trim());
      formData.append('notes', notes.trim());

      const emergencyContact = {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relationship: emergencyRelation.trim(),
      };
      formData.append('emergencyContact', JSON.stringify(emergencyContact));

      if (profileImageFile) {
        formData.append('profilePicture', profileImageFile);
      }

      if (ownerToEdit) {
        await ownersApi.update(ownerToEdit._id, formData);
      } else {
        await ownersApi.create(formData);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save owner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ownerToEdit ? 'Edit House Owner' : 'Add New House Owner'}
      subtitle="Store complete contact, property ownership, and emergency details."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Profile Image & Basic Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-200 border-2 border-brand-500 shrink-0 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Upload Profile Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or WEBP up to 10MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Rajesh & Priya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Phone Number"
            required
            placeholder="e.g. +1 (512) 882-9011"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. owner@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Street Address"
            required
            placeholder="e.g. 742 Evergreen Terrace"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="City"
            placeholder="Austin"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label="State / Province"
            placeholder="TX"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
          <Input
            label="ZIP / Postal Code"
            placeholder="78701"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </div>

        {/* Emergency Contact */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Emergency Contact Information (Optional)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Contact Name"
              placeholder="e.g. Arun Sharma"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
            />
            <Input
              label="Contact Phone"
              placeholder="e.g. +1 (512) 993-2144"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
            />
            <Input
              label="Relationship"
              placeholder="e.g. Brother, Attorney"
              value={emergencyRelation}
              onChange={(e) => setEmergencyRelation(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes / Special Preferences
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            placeholder="e.g. Weekly Friday updates, material preferences, noise restrictions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {ownerToEdit ? 'Save Changes' : 'Create Owner Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
