import React, { useState, useEffect } from 'react';
import {
  Property,
  Floor,
  Room,
  Resident,
  HouseStructureOverview,
  RoomType,
  RoomConstructionStatus,
} from '../../types/index.js';
import { propertiesApi, structureApi } from '../../services/api.js';
import { FloorFormModal } from './FloorFormModal.js';
import { RoomFormModal } from './RoomFormModal.js';
import { ResidentFormModal } from './ResidentFormModal.js';
import { ResidentReassignModal } from './ResidentReassignModal.js';
import { RoomDetailModal } from './RoomDetailModal.js';
import { HouseReportModal } from './HouseReportModal.js';
import { Button } from '../common/Button.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { EmptyState } from '../common/EmptyState.js';
import {
  Layers,
  DoorOpen,
  Bed,
  Bath,
  Users,
  Maximize2,
  Building2,
  Plus,
  Search,
  Filter,
  FileText,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Pencil,
  Trash2,
  ArrowUpDown,
  Home,
  Compass,
  ArrowLeftRight,
  ShieldCheck,
  Eye,
  Check,
  Sparkles,
} from 'lucide-react';

interface HouseStructureViewProps {
  initialPropertyId?: string;
}

type StructureTab = 'explorer' | 'floors' | 'rooms' | 'residents' | 'occupancy';

export const HouseStructureView: React.FC<HouseStructureViewProps> = ({
  initialPropertyId,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialPropertyId || '');
  const [overview, setOverview] = useState<HouseStructureOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StructureTab>('explorer');

  // Selected floor in visual explorer
  const [selectedExplorerFloorId, setSelectedExplorerFloorId] = useState<string>('all');

  // Modals
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [floorToEdit, setFloorToEdit] = useState<Floor | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [roomInitialFloorId, setRoomInitialFloorId] = useState<string | undefined>(undefined);

  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [residentToEdit, setResidentToEdit] = useState<Resident | null>(null);
  const [residentInitialRoomId, setResidentInitialRoomId] = useState<string | undefined>(undefined);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [residentToReassign, setResidentToReassign] = useState<Resident | null>(null);

  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);
  const [detailedRoom, setDetailedRoom] = useState<Room | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Filters for Room Tab
  const [roomFilterFloor, setRoomFilterFloor] = useState<string>('all');
  const [roomFilterType, setRoomFilterType] = useState<string>('all');
  const [roomFilterStatus, setRoomFilterStatus] = useState<string>('all');
  const [roomSearch, setRoomSearch] = useState<string>('');
  const [roomViewMode, setRoomViewMode] = useState<'grid' | 'table'>('grid');

  // Filters for Residents Tab
  const [residentStatusFilter, setResidentStatusFilter] = useState<string>('all');
  const [residentSearch, setResidentSearch] = useState<string>('');

  // Initial load properties
  useEffect(() => {
    loadProperties();
  }, []);

  // Update selected property if prop changes
  useEffect(() => {
    if (initialPropertyId) {
      setSelectedPropertyId(initialPropertyId);
    }
  }, [initialPropertyId]);

  // Load house structure when selectedPropertyId changes
  useEffect(() => {
    if (selectedPropertyId) {
      loadStructureOverview(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const loadProperties = async () => {
    try {
      const data = await propertiesApi.getAll();
      if (data.success && data.properties.length > 0) {
        setProperties(data.properties);
        if (!selectedPropertyId) {
          setSelectedPropertyId(data.properties[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load properties list:', err);
    }
  };

  const loadStructureOverview = async (propId: string) => {
    try {
      setLoading(true);
      const res = await structureApi.getOverview(propId);
      if (res.success) {
        setOverview(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch house structure overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedPropertyId) {
      loadStructureOverview(selectedPropertyId);
    }
  };

  const handleDeleteFloor = async (floor: Floor) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${floor.name}"? Rooms on this floor will become unassigned.`
      )
    ) {
      try {
        await structureApi.deleteFloor(floor._id);
        handleRefresh();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete floor');
      }
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (
      window.confirm(
        `Are you sure you want to delete room "${room.name}" (${room.roomId})?`
      )
    ) {
      try {
        await structureApi.deleteRoom(room._id);
        handleRefresh();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const handleDeleteResident = async (resident: Resident) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete resident record "${resident.name}"?`
      )
    ) {
      try {
        await structureApi.deleteResident(resident._id);
        handleRefresh();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete resident');
      }
    }
  };

  if (!properties || properties.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="w-10 h-10 text-slate-400" />}
        title="No Properties Registered"
        description="Please register a property in the Properties tab first before configuring house structure, floors, rooms, and residents."
        actionLabel="Create Property First"
        onAction={() => (window.location.hash = '#properties')}
      />
    );
  }

  const currentProperty = overview?.property || properties.find((p) => p._id === selectedPropertyId);
  const ownerObj = currentProperty && typeof currentProperty.owner === 'object' ? currentProperty.owner : null;
  const floors = overview?.floors || [];
  const rooms = overview?.rooms || [];
  const residents = overview?.residents || [];

  // Filtered rooms for Room Tab
  const filteredRooms = rooms.filter((r) => {
    const fId = typeof r.floor === 'object' ? (r.floor as any)?._id : r.floor;
    if (roomFilterFloor !== 'all' && fId !== roomFilterFloor) return false;
    if (roomFilterType !== 'all' && r.roomType !== roomFilterType) return false;
    if (roomFilterStatus !== 'all' && r.constructionStatus !== roomFilterStatus) return false;
    if (roomSearch.trim()) {
      const q = roomSearch.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchId = r.roomId.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  // Filtered residents for Residents Tab
  const filteredResidents = residents.filter((res) => {
    if (residentStatusFilter !== 'all' && res.status !== residentStatusFilter) return false;
    if (residentSearch.trim()) {
      const q = residentSearch.toLowerCase();
      const matchName = res.name.toLowerCase().includes(q);
      const matchPhone = res.phone && res.phone.includes(q);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  // Explorer active floor rooms
  const explorerRooms =
    selectedExplorerFloorId === 'all'
      ? rooms
      : rooms.filter((r) => {
          const fId = typeof r.floor === 'object' ? (r.floor as any)?._id : r.floor;
          return fId === selectedExplorerFloorId;
        });

  // Occupancy metrics
  const bedrooms = rooms.filter((r) => r.roomType === 'bedroom' || r.roomType === 'master_bedroom');
  const occupiedBedrooms = bedrooms.filter((b) => (b.activeOccupants?.length || 0) > 0);
  const vacantBedrooms = bedrooms.filter((b) => !b.activeOccupants || b.activeOccupants.length === 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Property Switcher & Action Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                HOUSE STRUCTURE COMMAND
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">Live Database Connected</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="font-black text-lg sm:text-xl text-slate-900 bg-transparent border-b-2 border-amber-500/40 hover:border-amber-600 py-0.5 outline-none cursor-pointer pr-4"
              >
                {properties.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.propertyId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>House Report</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFloorToEdit(null);
              setIsFloorModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Add Floor</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setRoomToEdit(null);
              setRoomInitialFloorId(undefined);
              setIsRoomModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <DoorOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Add Room</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setResidentToEdit(null);
              setResidentInitialRoomId(undefined);
              setIsResidentModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Register Resident</span>
          </Button>
        </div>
      </div>

      {loading && !overview ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Calibrating house blueprints and occupancy telemetry..." />
        </div>
      ) : (
        <>
          {/* Section 1: House Overview Presidential Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Cover & Owner Dossier */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {currentProperty?.propertyType || 'Residential'} Estate
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {currentProperty?.propertyId}
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-white mb-2">
                  {currentProperty?.name}
                </h1>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {currentProperty?.address}, {currentProperty?.city}
                </p>

                {/* Owner Mini Badge */}
                {ownerObj && (
                  <div className="mt-4 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600/30 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/40">
                      {ownerObj.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Estate Owner
                      </span>
                      <p className="text-xs font-bold text-white truncate">{ownerObj.name}</p>
                      {ownerObj.phone && (
                        <p className="text-[11px] text-slate-400">{ownerObj.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Construction Progress Bar */}
              <div className="relative z-10 mt-6 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                  <span className="text-slate-300">Overall Construction & Finishes</span>
                  <span className="text-amber-400">
                    {overview?.constructionProgressPercentage || currentProperty?.progressPercentage || 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-linear-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700"
                    style={{
                      width: `${overview?.constructionProgressPercentage || currentProperty?.progressPercentage || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Architectural & Space Summary Matrix (6 cards) */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Floors */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Floors</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">{overview?.floorsCount || 0}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">Levels configured</span>
                </div>
              </div>

              {/* Total Rooms */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rooms & Spaces</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">{overview?.roomsCount || 0}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">Total measured spaces</span>
                </div>
              </div>

              {/* Bedrooms (Occupied / Vacant) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bedrooms</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Bed className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">{overview?.bedroomsCount || 0}</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      ({overview?.occupiedBedroomsCount || 0} Occ / {overview?.vacantBedroomsCount || 0} Vac)
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">Master suites & bedrooms</span>
                </div>
              </div>

              {/* Bathrooms & Balconies */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Baths & Balconies</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Bath className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">
                    {overview?.bathroomsCount || 0} / {overview?.balconiesCount || 0}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">Baths / Verandas</span>
                </div>
              </div>

              {/* Active Residents */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Residents</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-purple-700">
                    {overview?.activeResidentsCount || 0}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">Distinct living members</span>
                </div>
              </div>

              {/* Total Measured Area */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Area</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">
                    {(overview?.totalAreaSqFt || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">Square Feet (sq ft)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 overflow-x-auto gap-2 sm:gap-6 pt-2">
            {[
              {
                id: 'explorer' as StructureTab,
                label: 'Visual House Explorer',
                icon: <Compass className="w-4 h-4" />,
                count: undefined,
              },
              {
                id: 'floors' as StructureTab,
                label: 'Floor Management',
                icon: <Layers className="w-4 h-4" />,
                count: floors.length,
              },
              {
                id: 'rooms' as StructureTab,
                label: 'Room Inventory',
                icon: <DoorOpen className="w-4 h-4" />,
                count: rooms.length,
              },
              {
                id: 'residents' as StructureTab,
                label: 'Residents Directory',
                icon: <Users className="w-4 h-4" />,
                count: residents.length,
              },
              {
                id: 'occupancy' as StructureTab,
                label: 'Room Occupancy Matrix',
                icon: <Bed className="w-4 h-4" />,
                count: bedrooms.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                      activeTab === tab.id
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: VISUAL HOUSE EXPLORER */}
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-5 rounded-3xl text-white border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-400" />
                      Vertical Floor Stacker & Blueprint Visualizer
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Click any floor to filter rooms and inspect architectural finishes, dimensions, and live resident occupancy.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedExplorerFloorId('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedExplorerFloorId === 'all'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      All Floors ({rooms.length})
                    </button>
                  </div>
                </div>

                {/* Vertical Floor Cards Stack */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                  {[...floors]
                    .sort((a, b) => b.floorNumber - a.floorNumber) // Top level down to basement
                    .map((floor) => {
                      const isSelected = selectedExplorerFloorId === floor._id;
                      return (
                        <div
                          key={floor._id}
                          onClick={() => setSelectedExplorerFloorId(floor._id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/30'
                              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                              Level {floor.floorNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                floor.status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {floor.status.replace('_', ' ')}
                            </span>
                          </div>

                          <h4 className="font-bold text-white text-base truncate">{floor.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {floor.stats?.roomsCount || 0} rooms • {floor.stats?.totalAreaSqFt || 0} sq ft
                          </p>

                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Progress</span>
                            <span className="font-bold text-amber-300">{floor.progressPercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${floor.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Rooms Grid for Selected Floor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-amber-600" />
                    <span>
                      {selectedExplorerFloorId === 'all'
                        ? 'Rooms Across All Floors'
                        : `Rooms on ${floors.find((f) => f._id === selectedExplorerFloorId)?.name || 'Selected Floor'}`}
                    </span>
                    <span className="text-xs font-bold text-slate-400">({explorerRooms.length})</span>
                  </h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setRoomToEdit(null);
                      setRoomInitialFloorId(
                        selectedExplorerFloorId !== 'all' ? selectedExplorerFloorId : undefined
                      );
                      setIsRoomModalOpen(true);
                    }}
                    className="text-xs"
                  >
                    + Add Room Here
                  </Button>
                </div>

                {explorerRooms.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                    <DoorOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No rooms configured for this floor.</p>
                    <p className="text-xs text-slate-400 mt-1">Add bedrooms, kitchen, halls, or bathrooms to view here.</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setRoomToEdit(null);
                        setRoomInitialFloorId(
                          selectedExplorerFloorId !== 'all' ? selectedExplorerFloorId : undefined
                        );
                        setIsRoomModalOpen(true);
                      }}
                      className="mt-3 bg-amber-600 hover:bg-amber-700"
                    >
                      Add First Room
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {explorerRooms.map((room) => {
                      const hasDefects = room.defects && room.defects.some((d) => !d.resolved);
                      const isOccupied = room.occupancyStatus === 'occupied';
                      const fObj = typeof room.floor === 'object' ? room.floor : null;

                      return (
                        <div
                          key={room._id}
                          onClick={() => {
                            setDetailedRoom(room);
                            setIsRoomDetailOpen(true);
                          }}
                          className="bg-white rounded-2xl border border-slate-200/80 hover:border-amber-500/80 shadow-xs hover:shadow-md transition-all cursor-pointer p-4 flex flex-col justify-between group"
                        >
                          <div>
                            {/* Photo / Preview Placeholder */}
                            <div className="aspect-video w-full rounded-xl bg-slate-100 overflow-hidden mb-3 relative border border-slate-100">
                              {room.photos && room.photos.length > 0 ? (
                                <img
                                  src={room.photos[0]}
                                  alt={room.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                  <DoorOpen className="w-8 h-8 opacity-40 mb-1" />
                                  <span className="text-[10px] uppercase font-bold tracking-wider">
                                    {room.roomType.replace('_', ' ')}
                                  </span>
                                </div>
                              )}

                              {/* Status Badges */}
                              <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 backdrop-blur-xs text-white">
                                  {room.roomId}
                                </span>
                              </div>

                              <div className="absolute top-2 right-2">
                                {isOccupied ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{room.activeOccupants?.length || 1}</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                    Vacant
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                              <span className="capitalize">{room.roomType.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{fObj?.name || 'Level'}</span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors truncate mt-0.5">
                              {room.name}
                            </h4>

                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mt-2 pt-2 border-t border-slate-100">
                              <span className="text-amber-700 font-bold font-mono">
                                {room.areaSqFt ? `${room.areaSqFt} sq ft` : 'N/A'}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                {room.dimensions ? `${room.dimensions.length}' × ${room.dimensions.width}'` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span
                              className={`capitalize font-semibold text-[11px] ${
                                room.constructionStatus === 'completed'
                                  ? 'text-emerald-700'
                                  : room.constructionStatus === 'needs_repair'
                                  ? 'text-red-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {room.constructionStatus.replace('_', ' ')}
                            </span>

                            {hasDefects && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3" />
                                Snags
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FLOOR MANAGEMENT */}
          {activeTab === 'floors' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Floor Blueprint Management</h3>
                  <p className="text-xs text-slate-500">Add, calibrate, and oversee structural levels and drawings.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setFloorToEdit(null);
                    setIsFloorModalOpen(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add New Floor
                </Button>
              </div>

              {floors.length === 0 ? (
                <EmptyState
                  icon={<Layers className="w-10 h-10 text-slate-400" />}
                  title="No Floors Configured"
                  description="Begin by adding the Ground Floor, Basement, or First Floor for this house."
                  actionLabel="Add First Floor"
                  onAction={() => setIsFloorModalOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {floors.map((floor) => (
                    <div
                      key={floor._id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:border-amber-400 transition-all"
                    >
                      <div>
                        {/* Blueprint Thumbnail */}
                        {floor.floorPlanImage ? (
                          <div className="aspect-video w-full rounded-xl bg-slate-900 overflow-hidden mb-3 border border-slate-200">
                            <img
                              src={floor.floorPlanImage}
                              alt="Blueprint"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 mb-3">
                            <Layers className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-[11px] font-semibold">No Blueprint Attached</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-amber-700 uppercase">
                            Level {floor.floorNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              floor.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {floor.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h4 className="text-lg font-black text-slate-900">{floor.name}</h4>
                        {floor.notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{floor.notes}</p>}

                        {/* Floor Stats Breakdown */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rooms</span>
                            <span className="text-sm font-black text-slate-900">{floor.stats?.roomsCount || 0}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Baths</span>
                            <span className="text-sm font-black text-slate-900">{floor.stats?.bathroomsCount || 0}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Area</span>
                            <span className="text-sm font-black text-amber-700 font-mono">
                              {floor.stats?.totalAreaSqFt || 0}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between items-center text-xs font-bold mb-1">
                            <span className="text-slate-600">Progress</span>
                            <span className="text-amber-600">{floor.progressPercentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${floor.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setFloorToEdit(floor);
                            setIsFloorModalOpen(true);
                          }}
                          className="text-xs flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFloor(floor)}
                          className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 p-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ROOM MANAGEMENT */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              {/* Filter & View Switcher Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search rooms by name or Room ID (e.g. GF-R101)..."
                      value={roomSearch}
                      onChange={(e) => setRoomSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setRoomViewMode('grid')}
                        className={`p-1.5 rounded-lg ${
                          roomViewMode === 'grid' ? 'bg-white shadow-xs text-amber-700' : 'text-slate-500'
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoomViewMode('table')}
                        className={`p-1.5 rounded-lg ${
                          roomViewMode === 'table' ? 'bg-white shadow-xs text-amber-700' : 'text-slate-500'
                        }`}
                        title="Table View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setRoomToEdit(null);
                        setRoomInitialFloorId(undefined);
                        setIsRoomModalOpen(true);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Room
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Filter Floor</label>
                    <select
                      value={roomFilterFloor}
                      onChange={(e) => setRoomFilterFloor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none"
                    >
                      <option value="all">All Floors</option>
                      {floors.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Space Type</label>
                    <select
                      value={roomFilterType}
                      onChange={(e) => setRoomFilterType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none capitalize"
                    >
                      <option value="all">All Room Types</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="master_bedroom">Master Bedroom</option>
                      <option value="living_room">Living Room</option>
                      <option value="hall">Main Hall</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="balcony">Balcony</option>
                      <option value="pooja_room">Pooja Room</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Construction Status</label>
                    <select
                      value={roomFilterStatus}
                      onChange={(e) => setRoomFilterStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="needs_repair">Needs Repair</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredRooms.length === 0 ? (
                <EmptyState
                  icon={<DoorOpen className="w-10 h-10 text-slate-400" />}
                  title="No Matching Rooms Found"
                  description="Adjust your search filters or click '+ Add Room' to register new rooms."
                  actionLabel="Add Room"
                  onAction={() => setIsRoomModalOpen(true)}
                />
              ) : roomViewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredRooms.map((room) => {
                    const fObj = typeof room.floor === 'object' ? room.floor : null;
                    return (
                      <div
                        key={room._id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 p-4 flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              {room.roomId}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                room.constructionStatus === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : room.constructionStatus === 'needs_repair'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {room.constructionStatus.replace('_', ' ')}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-base">{room.name}</h4>
                          <p className="text-xs text-slate-500 capitalize">
                            {room.roomType.replace('_', ' ')} • {fObj?.name || 'Floor'}
                          </p>

                          <div className="mt-3 p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-slate-500">Dimensions:</span>
                            <span className="font-semibold text-slate-800">
                              {room.dimensions ? `${room.dimensions.length}' × ${room.dimensions.width}'` : 'N/A'}
                            </span>
                          </div>
                          <div className="mt-1 p-2.5 bg-amber-50/50 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-amber-800 font-semibold">Calculated Area:</span>
                            <span className="font-black text-amber-900 font-mono">
                              {room.areaSqFt ? `${room.areaSqFt} sq ft` : 'N/A'}
                            </span>
                          </div>

                          {/* Occupants badge */}
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">Occupants:</span>
                            <span className="font-bold text-slate-700">
                              {room.activeOccupants && room.activeOccupants.length > 0
                                ? `${room.activeOccupants.length} Resident(s)`
                                : 'Vacant'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setDetailedRoom(room);
                              setIsRoomDetailOpen(true);
                            }}
                            className="text-xs flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </Button>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setRoomToEdit(room);
                                setIsRoomModalOpen(true);
                              }}
                              className="text-xs p-1.5"
                              title="Edit Room"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRoom(room)}
                              className="text-red-500 hover:text-red-700 p-1.5"
                              title="Delete Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View */
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Room ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Floor</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Area</th>
                        <th className="p-3">Construction</th>
                        <th className="p-3">Occupancy</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRooms.map((room) => {
                        const fObj = typeof room.floor === 'object' ? room.floor : null;
                        return (
                          <tr key={room._id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-amber-700">{room.roomId}</td>
                            <td className="p-3 font-bold text-slate-900">{room.name}</td>
                            <td className="p-3 text-slate-600">{fObj?.name || '-'}</td>
                            <td className="p-3 capitalize">{room.roomType.replace('_', ' ')}</td>
                            <td className="p-3 font-mono font-semibold">{room.areaSqFt} sq ft</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                  room.constructionStatus === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {room.constructionStatus.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                  room.occupancyStatus === 'occupied'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {room.occupancyStatus}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setDetailedRoom(room);
                                    setIsRoomDetailOpen(true);
                                  }}
                                  className="text-xs py-1"
                                >
                                  Inspect
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setRoomToEdit(room);
                                    setIsRoomModalOpen(true);
                                  }}
                                  className="text-xs p-1"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRoom(room)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RESIDENTS MANAGEMENT */}
          {activeTab === 'residents' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Household Residents Directory</h3>
                  <p className="text-xs text-slate-500">
                    Track who lives in the house, bedroom assignments, and historical moves.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setResidentToEdit(null);
                    setResidentInitialRoomId(undefined);
                    setIsResidentModalOpen(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Register Resident
                </Button>
              </div>

              {/* Filters */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search residents by name or phone..."
                    value={residentSearch}
                    onChange={(e) => setResidentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={residentStatusFilter}
                    onChange={(e) => setResidentStatusFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none"
                  >
                    <option value="all">All Resident Statuses</option>
                    <option value="currently_living">Currently Living</option>
                    <option value="temporarily_away">Temporarily Away</option>
                    <option value="moved_out">Moved Out</option>
                  </select>
                </div>
              </div>

              {filteredResidents.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-10 h-10 text-slate-400" />}
                  title="No Residents Registered"
                  description="Register family members, owners, or tenants living in this house."
                  actionLabel="Register First Resident"
                  onAction={() => setIsResidentModalOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResidents.map((res) => {
                    const roomObj = typeof res.currentRoom === 'object' ? res.currentRoom : null;
                    const floorObj = typeof res.currentFloor === 'object' ? res.currentFloor : null;

                    return (
                      <div
                        key={res._id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between hover:border-amber-400 transition-all"
                      >
                        <div>
                          <div className="flex items-start gap-3">
                            {res.profilePhoto ? (
                              <img
                                src={res.profilePhoto}
                                alt={res.name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 font-black text-xl flex items-center justify-center shrink-0 border border-amber-200">
                                {res.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-slate-900 text-base truncate">{res.name}</h4>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize shrink-0 ${
                                    res.status === 'currently_living'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : res.status === 'temporarily_away'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {res.status.replace('_', ' ')}
                                </span>
                              </div>
                              <span className="text-xs text-amber-700 font-bold capitalize block">
                                {res.relationship}
                              </span>
                              {res.phone && <p className="text-xs text-slate-500 mt-0.5">{res.phone}</p>}
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Assigned Room:</span>
                              <strong className="text-slate-800">
                                {roomObj ? `${roomObj.name} (${roomObj.roomId})` : 'Unassigned'}
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Floor Level:</span>
                              <strong className="text-slate-800">{floorObj?.name || 'General'}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Move-In Date:</span>
                              <span className="text-slate-700">
                                {res.moveInDate ? new Date(res.moveInDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setResidentToReassign(res);
                              setIsReassignModalOpen(true);
                            }}
                            className="text-xs flex items-center gap-1 text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>Transfer / Move Out</span>
                          </Button>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setResidentToEdit(res);
                                setIsResidentModalOpen(true);
                              }}
                              className="text-xs p-1.5"
                              title="Edit Resident Profile"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteResident(res)}
                              className="text-red-500 hover:text-red-700 p-1.5"
                              title="Delete Resident"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ROOM OCCUPANCY & AVAILABILITY MATRIX */}
          {activeTab === 'occupancy' && (
            <div className="space-y-6">
              <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      TELEMETRY MATRIX
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">Bedroom Occupancy & Availability</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Real-time breakdown of occupied versus vacant bedrooms. Residents are computed distinctly.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center px-4 py-2 bg-slate-800 rounded-2xl border border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Occupied</span>
                      <span className="text-xl font-black text-blue-400">{occupiedBedrooms.length}</span>
                    </div>
                    <div className="text-center px-4 py-2 bg-slate-800 rounded-2xl border border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Vacant Ready</span>
                      <span className="text-xl font-black text-emerald-400">{vacantBedrooms.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vacant Bedrooms Ready for Allocation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Vacant Bedrooms Ready for Resident Assignment ({vacantBedrooms.length})
                </h4>

                {vacantBedrooms.length === 0 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium">
                    All configured bedrooms in {currentProperty?.name} are currently occupied!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {vacantBedrooms.map((room) => {
                      const fObj = typeof room.floor === 'object' ? room.floor : null;
                      return (
                        <div
                          key={room._id}
                          className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-mono text-xs font-bold text-emerald-700">{room.roomId}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Vacant
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-base">{room.name}</h5>
                            <p className="text-xs text-slate-500 capitalize">
                              {room.roomType.replace('_', ' ')} • {fObj?.name || 'Floor'}
                            </p>
                            <p className="text-xs text-amber-700 font-bold font-mono mt-2">
                              {room.areaSqFt ? `${room.areaSqFt} sq ft` : ''}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setResidentToEdit(null);
                                setResidentInitialRoomId(room._id);
                                setIsResidentModalOpen(true);
                              }}
                              className="w-full text-xs bg-emerald-600 hover:bg-emerald-700"
                            >
                              + Assign Resident to Room
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Occupied Bedrooms */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Occupied Bedrooms & Active Residents ({occupiedBedrooms.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {occupiedBedrooms.map((room) => {
                    const fObj = typeof room.floor === 'object' ? room.floor : null;
                    return (
                      <div
                        key={room._id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-xs font-bold text-amber-700">{room.roomId}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {room.activeOccupants?.length || 1} Occupant(s)
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base">{room.name}</h5>
                          <p className="text-xs text-slate-500 capitalize">
                            {room.roomType.replace('_', ' ')} • {fObj?.name || 'Floor'}
                          </p>

                          <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                              Active Residents
                            </span>
                            {room.activeOccupants?.map((occ) => (
                              <div key={occ._id} className="flex items-center gap-2 text-xs text-slate-800 font-semibold">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                                  {occ.name.charAt(0)}
                                </div>
                                <span>{occ.name}</span>
                                <span className="text-[10px] text-slate-400 capitalize">({occ.relationship})</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setDetailedRoom(room);
                              setIsRoomDetailOpen(true);
                            }}
                            className="w-full text-xs"
                          >
                            Inspect Room
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {selectedPropertyId && (
        <>
          <FloorFormModal
            isOpen={isFloorModalOpen}
            onClose={() => setIsFloorModalOpen(false)}
            onSaved={handleRefresh}
            propertyId={selectedPropertyId}
            floorToEdit={floorToEdit}
            existingFloorCount={floors.length}
          />

          <RoomFormModal
            isOpen={isRoomModalOpen}
            onClose={() => setIsRoomModalOpen(false)}
            onSaved={handleRefresh}
            propertyId={selectedPropertyId}
            floors={floors}
            roomToEdit={roomToEdit}
            initialFloorId={roomInitialFloorId}
          />

          <ResidentFormModal
            isOpen={isResidentModalOpen}
            onClose={() => setIsResidentModalOpen(false)}
            onSaved={handleRefresh}
            propertyId={selectedPropertyId}
            floors={floors}
            rooms={rooms}
            residentToEdit={residentToEdit}
            initialRoomId={residentInitialRoomId}
          />

          <ResidentReassignModal
            isOpen={isReassignModalOpen}
            onClose={() => setIsReassignModalOpen(false)}
            onSaved={handleRefresh}
            resident={residentToReassign}
            floors={floors}
            rooms={rooms}
          />

          <RoomDetailModal
            isOpen={isRoomDetailOpen}
            onClose={() => setIsRoomDetailOpen(false)}
            room={detailedRoom}
            onEditRoom={(r) => {
              setRoomToEdit(r);
              setIsRoomModalOpen(true);
            }}
            onRoomUpdated={handleRefresh}
            onAssignResident={(r) => {
              setResidentToEdit(null);
              setResidentInitialRoomId(r._id);
              setIsResidentModalOpen(true);
            }}
          />

          <HouseReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            overview={overview}
          />
        </>
      )}
    </div>
  );
};
