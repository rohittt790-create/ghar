import React from 'react';
import { Modal } from '../common/Modal.js';
import { Owner } from '../../types/index.js';
import { ProgressBar } from '../common/ProgressBar.js';
import { Badge } from '../common/Badge.js';
import { Button } from '../common/Button.js';
import { Phone, Mail, MapPin, Building, Edit, ShieldAlert, FileText } from 'lucide-react';

interface OwnerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: Owner | null;
  onEdit: (owner: Owner) => void;
  onViewProperty?: (propertyId: string) => void;
}

export const OwnerDetailModal: React.FC<OwnerDetailModalProps> = ({
  isOpen,
  onClose,
  owner,
  onEdit,
  onViewProperty,
}) => {
  if (!owner) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="House Owner Profile"
      subtitle={`Client ID: ${owner._id.substring(owner._id.length - 8).toUpperCase()}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-brand-50/40 border border-slate-200/80">
          <img
            src={
              owner.profilePicture ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            }
            alt={owner.name}
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
            }}
            className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-sm shrink-0"
          />

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-slate-900">{owner.name}</h3>
              <Button
                variant="outline"
                size="sm"
                icon={<Edit className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onEdit(owner);
                }}
              >
                Edit Profile
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                {owner.phone}
              </span>
              {owner.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  {owner.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                {owner.address}, {owner.city} {owner.state} {owner.zipCode}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Contact & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Emergency Contact
            </h4>
            {owner.emergencyContact?.name ? (
              <div className="text-xs space-y-1 text-slate-700">
                <p>
                  <strong>Name:</strong> {owner.emergencyContact.name}
                </p>
                <p>
                  <strong>Phone:</strong> {owner.emergencyContact.phone}
                </p>
                <p>
                  <strong>Relationship:</strong> {owner.emergencyContact.relationship || 'Relative'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No emergency contact recorded.</p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-brand-500" />
              Owner Notes & Preferences
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {owner.notes || 'No special preferences noted.'}
            </p>
          </div>
        </div>

        {/* Owned Properties List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-brand-600" />
              Associated Properties ({owner.properties?.length || 0})
            </h4>
          </div>

          {(!owner.properties || owner.properties.length === 0) ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No active property projects associated with this owner yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {owner.properties.map((prop) => (
                <div
                  key={prop._id}
                  onClick={() => {
                    if (onViewProperty) {
                      onClose();
                      onViewProperty(prop._id);
                    }
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-400 bg-white hover:shadow-sm transition-all cursor-pointer flex items-start gap-3"
                >
                  <img
                    src={
                      prop.coverPhoto ||
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={prop.name}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{prop.name}</span>
                      <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {prop.propertyId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge status={prop.status} size="sm" />
                      <span className="text-xs font-bold text-slate-700">
                        {prop.progressPercentage}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar progress={prop.progressPercentage} size="sm" showLabel={false} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
