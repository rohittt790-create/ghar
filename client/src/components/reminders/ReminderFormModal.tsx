import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Select } from '../common/Select.js';
import { Button } from '../common/Button.js';
import { Property, Task, TaskPriority } from '../../types/index.js';
import { remindersApi, propertiesApi, tasksApi } from '../../services/api.js';

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ReminderFormModal: React.FC<ReminderFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [property, setProperty] = useState('');
  const [task, setTask] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [type, setType] = useState('deadline');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [channels, setChannels] = useState<string[]>(['browser', 'in_app']);

  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      propertiesApi.getAll().then((res) => {
        if (res.success) setPropertiesList(res.properties);
      });
      tasksApi.getAll().then((res) => {
        if (res.success) setTasksList(res.tasks);
      });
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setReminderDate(tomorrow);
      setTitle('');
      setDescription('');
      setProperty('');
      setTask('');
      setPriority('medium');
      setType('deadline');
      setChannels(['browser', 'in_app']);
      setError('');
    }
  }, [isOpen]);

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reminderDate) {
      setError('Please provide a Reminder Title and Date.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await remindersApi.create({
        title: title.trim(),
        description: description.trim(),
        property: property || undefined,
        task: task || undefined,
        reminderDate,
        reminderTime,
        type,
        priority,
        channels,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reminder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Construction Reminder"
      subtitle="Configure deadline notifications, inspection alerts, and sync settings."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <Input
          label="Reminder Title"
          required
          placeholder="e.g. City Structural Framing Inspection"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Related Property (Optional)"
            value={property}
            onChange={(e) => setProperty(e.target.value)}
            options={[
              { value: '', label: 'General / No Specific Site' },
              ...propertiesList.map((p) => ({ value: p._id, label: `${p.name} (${p.propertyId})` })),
            ]}
          />
          <Select
            label="Related Task (Optional)"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            options={[
              { value: '', label: 'None' },
              ...tasksList.map((t) => ({ value: t._id, label: t.taskName })),
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Reminder Date"
            type="date"
            required
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
          />
          <Input
            label="Reminder Time"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Alert Category"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'deadline', label: 'Milestone Deadline' },
              { value: 'inspection', label: 'Permit / Inspection' },
              { value: 'task_due', label: 'Task Due' },
              { value: 'payment', label: 'Contractor Payment' },
              { value: 'general', label: 'General Site Notice' },
            ]}
          />
          <Select
            label="Priority Level"
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

        {/* Channels */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Notification Delivery Channels
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'browser', label: 'Web Browser' },
              { id: 'in_app', label: 'In-App Alerts' },
              { id: 'email', label: 'Email Digest' },
              { id: 'whatsapp', label: 'WhatsApp' },
            ].map((ch) => (
              <label
                key={ch.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={channels.includes(ch.id)}
                  onChange={() => toggleChannel(ch.id)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="font-medium text-slate-700">{ch.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes / Instructions
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            placeholder="Important instructions, documents needed, inspector phone number..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Save Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
};
