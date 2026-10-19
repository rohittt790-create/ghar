import React, { useState, useEffect } from 'react';
import { Owner } from '../../types/index.js';
import { ownersApi } from '../../services/api.js';
import { OwnerFormModal } from './OwnerFormModal.js';
import { OwnerDetailModal } from './OwnerDetailModal.js';
import { Button } from '../common/Button.js';
import { Input } from '../common/Input.js';
import { ProgressBar } from '../common/ProgressBar.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { EmptyState } from '../common/EmptyState.js';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';

interface OwnersViewProps {
  onViewProperty?: (propertyId: string) => void;
  openCreateModalDirectly?: boolean;
  onClearCreateModalTrigger?: () => void;
}

export const OwnersView: React.FC<OwnersViewProps> = ({
  onViewProperty,
  openCreateModalDirectly = false,
  onClearCreateModalTrigger,
}) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ownerToEdit, setOwnerToEdit] = useState<Owner | null>(null);
  const [viewOwner, setViewOwner] = useState<Owner | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const data = await ownersApi.getAll({
        search: search || undefined,
        city: selectedCity || undefined,
      });
      if (data.success) {
        setOwners(data.owners);
      }
    } catch (err) {
      console.error('[Owners] Error fetching owners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [search, selectedCity]);

  useEffect(() => {
    if (openCreateModalDirectly) {
      setOwnerToEdit(null);
      setIsFormOpen(true);
      if (onClearCreateModalTrigger) onClearCreateModalTrigger();
    }
  }, [openCreateModalDirectly]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove owner "${name}"?`)) {
      try {
        setDeletingId(id);
        await ownersApi.delete(id);
        await fetchOwners();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete owner.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Extract unique cities for filter dropdown
  const cities = Array.from(new Set(owners.map((o) => o.city).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, City Filter, Add Owner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search by name, phone, address..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {cities.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full sm:w-44 text-xs font-medium rounded-lg border border-slate-300 py-2.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Locations ({cities.length})</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setOwnerToEdit(null);
            setIsFormOpen(true);
          }}
        >
          Add House Owner
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading house owners directory..." fullHeight />
      ) : owners.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="No house owners found"
          description={
            search
              ? `No owner records matched "${search}". Try searching for another name or location.`
              : 'Start by creating your first house owner record to manage properties and construction progress.'
          }
          actionLabel="Add House Owner"
          onAction={() => {
            setOwnerToEdit(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {owners.map((owner) => {
            const propCount = owner.propertiesCount || owner.properties?.length || 0;
            // Compute average progress
            const avgProgress =
              owner.properties && owner.properties.length > 0
                ? Math.round(
                    owner.properties.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) /
                      owner.properties.length
                  )
                : 0;

            return (
              <div
                key={owner._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Avatar and Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
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
                        className="w-13 h-13 rounded-full object-cover border-2 border-brand-500 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">{owner.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Registered: {new Date(owner.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewOwner(owner)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setOwnerToEdit(owner);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit owner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(owner._id, owner.name)}
                        disabled={deletingId === owner._id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete owner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 py-3 border-y border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="font-medium text-slate-800">{owner.phone}</span>
                    </div>
                    {owner.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="truncate">{owner.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">
                        {owner.address}, {owner.city} {owner.state}
                      </span>
                    </div>
                  </div>

                  {/* Associated Properties Preview */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-brand-600" />
                        {propCount} Propert{propCount === 1 ? 'y' : 'ies'} Managed
                      </span>
                      {propCount > 0 && <span className="text-brand-600">{avgProgress}% avg</span>}
                    </div>

                    {propCount > 0 ? (
                      <ProgressBar progress={avgProgress} size="sm" showLabel={false} />
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No assigned properties yet.</p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-brand-600 hover:bg-brand-50 p-0"
                    onClick={() => setViewOwner(owner)}
                  >
                    View Details & Properties →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <OwnerFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setOwnerToEdit(null);
        }}
        onSaved={fetchOwners}
        ownerToEdit={ownerToEdit}
      />

      <OwnerDetailModal
        isOpen={Boolean(viewOwner)}
        onClose={() => setViewOwner(null)}
        owner={viewOwner}
        onEdit={(o) => {
          setViewOwner(null);
          setOwnerToEdit(o);
          setIsFormOpen(true);
        }}
        onViewProperty={onViewProperty}
      />
    </div>
  );
};
