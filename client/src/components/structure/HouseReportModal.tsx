import React, { useRef } from 'react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { HouseStructureOverview } from '../../types/index.js';
import { Printer, Download, Building, Users, Layers, Bed, Bath, ShieldCheck } from 'lucide-react';

interface HouseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  overview: HouseStructureOverview | null;
}

export const HouseReportModal: React.FC<HouseReportModalProps> = ({
  isOpen,
  onClose,
  overview,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!overview) return null;

  const { property, floors, rooms, residents } = overview;
  const ownerObj = typeof property.owner === 'object' ? property.owner : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="House Structure & Residents Audit Report"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Print Action Bar */}
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl print:hidden">
          <div className="text-xs text-amber-900 font-medium">
            Official structural inventory & resident occupancy certification for {property.name}.
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="bg-amber-600 hover:bg-amber-700 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </Button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div
          ref={reportRef}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-slate-800 space-y-6 print:border-none print:p-0 print:m-0"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-600">
                  HOMETRACK ARCHITECTURAL DOSSIER
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{property.name}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Property ID: <span className="font-bold text-slate-800">{property.propertyId}</span> • Address: {property.address}, {property.city}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Generated On</span>
                <span className="text-xs font-bold text-slate-800">
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Database Record</span>
                </div>
              </div>
            </div>

            {/* Owner Details */}
            {ownerObj && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap gap-x-6 gap-y-1">
                <div>
                  <span className="text-slate-500">Owner Name: </span>
                  <strong className="text-slate-800">{ownerObj.name}</strong>
                </div>
                {ownerObj.phone && (
                  <div>
                    <span className="text-slate-500">Phone: </span>
                    <strong className="text-slate-800">{ownerObj.phone}</strong>
                  </div>
                )}
                {ownerObj.email && (
                  <div>
                    <span className="text-slate-500">Email: </span>
                    <strong className="text-slate-800">{ownerObj.email}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metric Summary Cards */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Executive Structure & Occupancy Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Total Floors</span>
                <span className="text-xl font-black text-slate-900">{overview.floorsCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Total Rooms</span>
                <span className="text-xl font-black text-slate-900">{overview.roomsCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Bedrooms (Occupied / Vacant)</span>
                <span className="text-xl font-black text-slate-900">
                  {overview.occupiedBedroomsCount} / {overview.vacantBedroomsCount}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Active Residents</span>
                <span className="text-xl font-black text-amber-700">{overview.activeResidentsCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Total Bathrooms</span>
                <span className="text-xl font-black text-slate-900">{overview.bathroomsCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Balconies & Kitchens</span>
                <span className="text-xl font-black text-slate-900">
                  {overview.balconiesCount} Balc / {overview.kitchensCount} Kit
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Constructed Area</span>
                <span className="text-xl font-black text-slate-900">
                  {overview.totalAreaSqFt.toLocaleString()} sq ft
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Under Maintenance</span>
                <span className="text-xl font-black text-orange-600">
                  {overview.roomsUnderMaintenanceCount}
                </span>
              </div>
            </div>
          </div>

          {/* Floor Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Floor-by-Floor Specifications
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-2.5">Level</th>
                  <th className="p-2.5">Floor Name</th>
                  <th className="p-2.5">Rooms</th>
                  <th className="p-2.5">Area (sq ft)</th>
                  <th className="p-2.5">Construction Status</th>
                  <th className="p-2.5">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {floors.map((floor) => (
                  <tr key={floor._id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold">Level {floor.floorNumber}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{floor.name}</td>
                    <td className="p-2.5">{floor.stats?.roomsCount || 0} rooms</td>
                    <td className="p-2.5 font-mono">{floor.stats?.totalAreaSqFt || 0}</td>
                    <td className="p-2.5 capitalize">{floor.status.replace('_', ' ')}</td>
                    <td className="p-2.5 font-bold">{floor.progressPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Room Inventory Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Complete Room & Space Inventory
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Room Name</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Dimensions</th>
                  <th className="p-2.5">Area</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Occupancy</th>
                  <th className="p-2.5">Occupants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-amber-700">{room.roomId}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{room.name}</td>
                    <td className="p-2.5 capitalize">{room.roomType.replace('_', ' ')}</td>
                    <td className="p-2.5">
                      {room.dimensions
                        ? `${room.dimensions.length}' × ${room.dimensions.width}'`
                        : '-'}
                    </td>
                    <td className="p-2.5 font-mono">{room.areaSqFt} sq ft</td>
                    <td className="p-2.5 capitalize">{room.constructionStatus.replace('_', ' ')}</td>
                    <td className="p-2.5 capitalize font-medium">{room.occupancyStatus.replace('_', ' ')}</td>
                    <td className="p-2.5">
                      {room.activeOccupants && room.activeOccupants.length > 0
                        ? room.activeOccupants.map((o) => o.name).join(', ')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resident Directory Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Resident Directory & Household Roster
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-2.5">Resident Name</th>
                  <th className="p-2.5">Relationship</th>
                  <th className="p-2.5">Contact</th>
                  <th className="p-2.5">Assigned Room</th>
                  <th className="p-2.5">Move-In Date</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {residents.map((resident) => {
                  const roomObj = typeof resident.currentRoom === 'object' ? resident.currentRoom : null;
                  return (
                    <tr key={resident._id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{resident.name}</td>
                      <td className="p-2.5 capitalize">{resident.relationship}</td>
                      <td className="p-2.5">{resident.phone || '-'}</td>
                      <td className="p-2.5 font-medium">{roomObj ? roomObj.name : 'General'}</td>
                      <td className="p-2.5">
                        {resident.moveInDate ? new Date(resident.moveInDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            resident.status === 'currently_living'
                              ? 'bg-emerald-100 text-emerald-800'
                              : resident.status === 'temporarily_away'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {resident.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[11px] text-slate-400">
            <div>HomeTrack Property Management Platform • Kailash Bhawan Suite</div>
            <div>Confidential • Household Record</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
