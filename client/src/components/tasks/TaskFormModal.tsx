import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Select } from '../common/Select.js';
import { Button } from '../common/Button.js';
import {
  Task,
  Property,
  TaskCategory,
  TaskStatus,
  TaskPriority,
  PhotoStage,
} from '../../types/index.js';
import { tasksApi, propertiesApi } from '../../services/api.js';
import { Upload, X } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  taskToEdit?: Task | null;
  initialPropertyId?: string;
  initialDate?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  taskToEdit,
  initialPropertyId,
  initialDate,
}) => {
  const [property, setProperty] = useState('');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Framing');
  const [assignedWorker, setAssignedWorker] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedCost, setEstimatedCost] = useState<number | string>(15000);
  const [actualCost, setActualCost] = useState<number | string>(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not_started');

  // Photo uploads
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoStage, setPhotoStage] = useState<PhotoStage>('before');
  const [photoCaption, setPhotoCaption] = useState('');

  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await propertiesApi.getAll();
        if (res.success) {
          setPropertiesList(res.properties);
          if (!property && res.properties.length > 0) {
            setProperty(initialPropertyId || res.properties[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load properties for task modal:', err);
      }
    };
    if (isOpen) {
      loadProperties();
    }
  }, [isOpen, initialPropertyId]);

  useEffect(() => {
    if (taskToEdit) {
      setProperty(
        typeof taskToEdit.property === 'object'
          ? (taskToEdit.property as any)._id
          : taskToEdit.property
      );
      setTaskName(taskToEdit.taskName || '');
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category || 'Framing');
      setAssignedWorker(taskToEdit.assignedWorker || '');
      setWorkerPhone(taskToEdit.workerPhone || '');
      setStartDate(taskToEdit.startDate ? taskToEdit.startDate.split('T')[0] : '');
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
      setPriority(taskToEdit.priority || 'medium');
      setEstimatedCost(taskToEdit.estimatedCost || 0);
      setActualCost(taskToEdit.actualCost || 0);
      setNotes(taskToEdit.notes || '');
      setStatus(taskToEdit.status || 'not_started');
      setPhotoFiles([]);
    } else {
      setTaskName('');
      setDescription('');
      setCategory('Framing');
      setAssignedWorker('');
      setWorkerPhone('');
      const defaultStart = initialDate || new Date().toISOString().split('T')[0];
      const defaultDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      setStartDate(defaultStart);
      setDueDate(defaultDue);
      setPriority('medium');
      setEstimatedCost(12000);
      setActualCost(0);
      setNotes('');
      setStatus('not_started');
      setPhotoFiles([]);
      setPhotoStage('before');
      setPhotoCaption('');
    }
    setError('');
  }, [taskToEdit, isOpen, initialDate]);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotoFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removePhotoFile = (idx: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !taskName.trim() || !category || !assignedWorker.trim() || !startDate || !dueDate) {
      setError('Please provide Property, Task Name, Category, Assigned Worker, and Start/Due dates.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('property', property);
      formData.append('taskName', taskName.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('assignedWorker', assignedWorker.trim());
      formData.append('workerPhone', workerPhone.trim());
      formData.append('startDate', startDate);
      formData.append('dueDate', dueDate);
      formData.append('priority', priority);
      formData.append('estimatedCost', String(estimatedCost));
      formData.append('actualCost', String(actualCost));
      formData.append('notes', notes.trim());
      formData.append('status', status);

      if (photoFiles.length > 0) {
        formData.append('stage', photoStage);
        formData.append('caption', photoCaption.trim() || `${photoStage} stage photo`);
        photoFiles.forEach((file) => {
          formData.append('progressPhotos', file);
        });
      }

      if (taskToEdit) {
        await tasksApi.update(taskToEdit._id, formData);
      } else {
        await tasksApi.create(formData);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions: { value: TaskCategory; label: string }[] = [
    { value: 'Foundation', label: 'Foundation & Earthwork' },
    { value: 'Framing', label: 'Structural Timber / Steel Framing' },
    { value: 'Roofing', label: 'Roofing & Waterproofing' },
    { value: 'Plumbing', label: 'Plumbing & Drainage' },
    { value: 'Electrical', label: 'Electrical & Wiring' },
    { value: 'HVAC', label: 'HVAC & Climate Control' },
    { value: 'Drywall', label: 'Drywall & Insulation' },
    { value: 'Painting', label: 'Painting & Surface Finish' },
    { value: 'Flooring', label: 'Flooring & Tiling' },
    { value: 'Masonry', label: 'Masonry & Concrete Works' },
    { value: 'Carpentry', label: 'Custom Carpentry & Cabinetry' },
    { value: 'Landscaping', label: 'Landscaping & Hardscape' },
    { value: 'Inspection', label: 'Permit & Safety Inspection' },
    { value: 'Exterior', label: 'Exterior Cladding & Facade' },
    { value: 'Interior Finish', label: 'Interior Fit-out & Fixtures' },
    { value: 'Other', label: 'General / Other Trades' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Construction Task' : 'Create New Construction Task'}
      subtitle="Define task parameters, assign contractor, set deadlines, and track expenses."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Property & Task Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Property Site"
            required
            value={property}
            onChange={(e) => setProperty(e.target.value)}
            options={propertiesList.map((p) => ({
              value: p._id,
              label: `${p.name} (${p.propertyId})`,
            }))}
          />
          <div className="sm:col-span-2">
            <Input
              label="Task Name"
              required
              placeholder="e.g. Rough-in Plumbing & Air Pressure Test"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>
        </div>

        {/* Category & Worker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Work Category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            options={categoryOptions}
          />
          <Input
            label="Assigned Contractor / Worker"
            required
            placeholder="e.g. Antonio Russo (Lead Plumber)"
            value={assignedWorker}
            onChange={(e) => setAssignedWorker(e.target.value)}
          />
          <Input
            label="Worker Phone / Contact"
            placeholder="e.g. +1 (512) 662-8819"
            value={workerPhone}
            onChange={(e) => setWorkerPhone(e.target.value)}
          />
        </div>

        {/* Dates & Status & Priority */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Start Date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Due Date"
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'on_hold', label: 'On Hold' },
            ]}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />
        </div>

        {/* Financials: Estimated vs Actual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Estimated Cost (₹ INR)"
            type="number"
            min="0"
            step="100"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
          />
          <Input
            label="Actual Incurred Cost (₹ INR)"
            type="number"
            min="0"
            step="100"
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Task Description & Work Scope
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            placeholder="Detailed scope of work, technical guidelines, or material specs..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Initial Progress Photos Upload */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Attach Work Documentation Photos
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Stage:</span>
              <select
                value={photoStage}
                onChange={(e) => setPhotoStage(e.target.value as PhotoStage)}
                className="text-xs font-bold rounded-lg border border-slate-300 py-1 px-2 bg-white"
              >
                <option value="before">Before</option>
                <option value="during">During</option>
                <option value="after">After</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Select Photo Files
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFilesSelect}
              />
            </label>
            <Input
              placeholder="Photo caption (e.g. Trenches dug and rebar positioned)"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>

          {photoFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {photoFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md text-xs text-slate-700"
                >
                  <span className="max-w-[140px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removePhotoFile(idx)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
