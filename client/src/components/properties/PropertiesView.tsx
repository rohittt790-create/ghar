import React, { useState, useEffect } from 'react';
import { Property, Owner } from '../../types/index.js';
import { propertiesApi, ownersApi } from '../../services/api.js';
import { PropertyCard } from './PropertyCard.js';
import { PropertyFormModal } from './PropertyFormModal.js';
import { PropertyDetailView } from './PropertyDetailView.js';
import { Button } from '../common/Button.js';
import { Input } from '../common/Input.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { EmptyState } from '../common/EmptyState.js';
import { formatCurrency } from '../../utils/formatters.js';
import {
  Building,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
} from 'lucide-react';

interface PropertiesViewProps {
  onAddTaskForProperty: (propertyId: string) => void;
  onSelectTask: (taskId: string) => void;
  openCreateModalDirectly?: boolean;
  onClearCreateModalTrigger?: () => void;
  selectedPropertyId?: string | null;
  onClearSelectedProperty?: () => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  onAddTaskForProperty,
  onSelectTask,
  openCreateModalDirectly = false,
  onClearCreateModalTrigger,
  selectedPropertyId,
  onClearSelectedProperty,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [activePropertyDetail, setActivePropertyDetail] = useState<Property | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertiesApi.getAll({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        owner: ownerFilter !== 'all' ? ownerFilter : undefined,
        propertyType: typeFilter !== 'all' ? typeFilter : undefined,
      });
      if (data.success) {
        setProperties(data.properties);

        // If a specific property was requested or is currently active, re-sync it
        if (selectedPropertyId) {
          const found = data.properties.find((p) => p._id === selectedPropertyId);
          if (found) {
            const detail = await propertiesApi.getById(found._id);
            if (detail.success) setActivePropertyDetail(detail.property);
          }
        }
      }
    } catch (err) {
      console.error('[Properties] Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOwners = async () => {
    try {
      const data = await ownersApi.getAll();
      if (data.success) {
        setOwners(data.owners);
      }
    } catch (err) {
      console.error('[Properties] Error fetching owners for filter:', err);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [search, statusFilter, ownerFilter, typeFilter]);

  useEffect(() => {
    if (openCreateModalDirectly) {
      setPropertyToEdit(null);
      setIsFormOpen(true);
      if (onClearCreateModalTrigger) onClearCreateModalTrigger();
    }
  }, [openCreateModalDirectly]);

  useEffect(() => {
    if (selectedPropertyId) {
      propertiesApi.getById(selectedPropertyId).then((res) => {
        if (res.success) setActivePropertyDetail(res.property);
      });
    }
  }, [selectedPropertyId]);

  const handleViewDetails = async (property: Property) => {
    try {
      const res = await propertiesApi.getById(property._id);
      if (res.success) {
        setActivePropertyDetail(res.property);
      } else {
        setActivePropertyDetail(property);
      }
    } catch (err) {
      setActivePropertyDetail(property);
    }
  };

  const handleDeleteProperty = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete property "${name}"? This will also remove all its tasks and reminders.`
      )
    ) {
      try {
        await propertiesApi.delete(id);
        if (activePropertyDetail?._id === id) {
          setActivePropertyDetail(null);
        }
        await fetchProperties();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete property.');
      }
    }
  };

  // If in detail mode, render the PropertyDetailView
  if (activePropertyDetail) {
    return (
      <PropertyDetailView
        property={activePropertyDetail}
        onBack={() => {
          setActivePropertyDetail(null);
          if (onClearSelectedProperty) onClearSelectedProperty();
          fetchProperties();
        }}
        onEditProperty={(prop) => {
          setPropertyToEdit(prop);
          setIsFormOpen(true);
        }}
        onAddTaskForProperty={onAddTaskForProperty}
        onSelectTask={onSelectTask}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search by name, site ID, address..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setPropertyToEdit(null);
                setIsFormOpen(true);
              }}
            >
              Add Property Site
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="planning">Planning</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Owners ({owners.length})</option>
            {owners.map((o) => (
              <option key={o._id} value={o._id}>
                {o.name}
              </option>
            ))}
          </select>

          {/* Property Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Types</option>
            <option value="villa">Villa</option>
            <option value="residential">Residential</option>
            <option value="renovation">Renovation</option>
            <option value="duplex">Duplex</option>
            <option value="commercial">Commercial</option>
          </select>

          {(statusFilter !== 'all' || ownerFilter !== 'all' || typeFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setOwnerFilter('all');
                setTypeFilter('all');
                setSearch('');
              }}
              className="text-xs text-rose-600 font-semibold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading construction properties..." fullHeight />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Building className="w-10 h-10" />}
          title="No properties found"
          description={
            search || statusFilter !== 'all'
              ? 'No property records match your search criteria. Try adjusting your filters.'
              : 'Add your first property site to start scheduling tasks, recording progress photos, and tracking construction milestones.'
          }
          actionLabel="Add Property Site"
          onAction={() => {
            setPropertyToEdit(null);
            setIsFormOpen(true);
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onViewDetails={handleViewDetails}
              onEdit={(p) => {
                setPropertyToEdit(p);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteProperty}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Site / Project</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Expenses / Budget</th>
                  <th className="py-3.5 px-4">Completion Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => {
                  const ownerObj = typeof p.owner === 'object' ? p.owner : null;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => handleViewDetails(p)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              p.coverPhoto ||
                              p.propertyPhotos[0] ||
                              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{p.name}</span>
                              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1 py-0.5 rounded">
                                {p.propertyId}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] truncate">{p.address}, {p.city}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {ownerObj?.name || 'Owner'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-brand-600 h-full rounded-full"
                              style={{ width: `${p.progressPercentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">{p.progressPercentage}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-bold">{formatCurrency(p.actualExpenses)}</span>
                        <span className="text-slate-400"> / {formatCurrency(p.estimatedBudget)}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(p.expectedCompletionDate).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(p);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setPropertyToEdit(null);
        }}
        onSaved={fetchProperties}
        propertyToEdit={propertyToEdit}
      />
    </div>
  );
};
