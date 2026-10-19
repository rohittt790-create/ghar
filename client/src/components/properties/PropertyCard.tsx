import React from 'react';
import { Property } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { ProgressBar } from '../common/ProgressBar.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import {
  Calendar,
  AlertTriangle,
  User,
  ArrowRight,
  Edit2,
  Trash2,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string, name: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const ownerObj = typeof property.owner === 'object' ? property.owner : null;
  const overdueCount = property.overdueTasks || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Cover Image & Badges */}
        <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden group">
          <img
            src={
              property.coverPhoto ||
              property.propertyPhotos[0] ||
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
            }
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wider px-2 py-0.5 rounded-md bg-white/95 text-slate-900 shadow-sm">
              {property.propertyId}
            </span>
            <Badge status={property.status} size="sm" className="bg-white/90 shadow-sm" />
          </div>

          {/* Quick Edit/Delete on image */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(property);
              }}
              className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white hover:text-brand-600 transition-colors shadow-sm"
              title="Edit Property"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(property._id, property.name);
              }}
              className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600 transition-colors shadow-sm"
              title="Delete Property"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-base font-bold truncate drop-shadow-sm">{property.name}</h3>
            <p className="text-xs text-slate-200 truncate mt-0.5 drop-shadow-sm">
              {property.address}, {property.city} {property.state}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3.5">
          {/* Owner info */}
          <div className="flex items-center justify-between text-xs text-slate-600 py-1 border-b border-slate-100">
            <span className="flex items-center gap-1.5 font-medium text-slate-800 truncate">
              <User className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              Owner: {ownerObj?.name || 'Assigned Client'}
            </span>
            {ownerObj?.phone && <span className="text-slate-400 shrink-0">{ownerObj.phone}</span>}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Construction Progress</span>
              <span className="font-extrabold text-brand-600">{property.progressPercentage}%</span>
            </div>
            <ProgressBar progress={property.progressPercentage} size="md" showLabel={false} />
          </div>

          {/* Financials & Dates Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Budget vs Spent</p>
              <p className="font-bold text-slate-800 mt-0.5">
                {formatCurrency(property.actualExpenses)}
                <span className="text-[10px] font-normal text-slate-400">
                  {' '}
                  / {formatCurrency(property.estimatedBudget)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Target Completion</p>
              <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-500 shrink-0" />
                {formatDate(property.expectedCompletionDate, 'MMM yyyy')}
              </p>
            </div>
          </div>

          {/* Task Status Overview Chips */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 text-[11px]">
              <strong>{property.completedTasks || 0}</strong> of{' '}
              <strong>{property.totalTasks || 0}</strong> tasks done
            </span>

            {overdueCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <AlertTriangle className="w-3 h-3" />
                {overdueCount} overdue
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 font-semibold">On Schedule</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Details Button */}
      <div className="px-4 pb-4 pt-1">
        <button
          onClick={() => onViewDetails(property)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 transition-colors"
        >
          <span>View Site Details & Work Breakdown</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
