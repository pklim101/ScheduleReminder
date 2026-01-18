import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Reminder } from '../types';
import { addReminder, updateReminder } from '../utils/storage';
import { scheduleAlarm, clearAlarm } from '../utils/alarms';
import { Plus } from 'lucide-react';

interface Props {
  onAdd: () => void;
  initialData?: Reminder | null;
  onCancel?: () => void;
}

const AddReminderForm: React.FC<Props> = ({ onAdd, initialData, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [repeat, setRepeat] = useState<Reminder['repeat']>('none');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setIsOpen(true);
      setTitle(initialData.title);
      // Format datetime-local string
      const date = new Date(initialData.targetTime);
      const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setDatetime(isoString);
      setRepeat(initialData.repeat);
      setNote(initialData.note || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !datetime) return;

    const targetTime = new Date(datetime).getTime();
    
    if (initialData) {
        // Update existing
        const updated: Reminder = {
            ...initialData,
            title,
            targetTime,
            repeat,
            note,
        };
        
        await updateReminder(updated);
        // Reschedule
        await clearAlarm(updated.id);
        if (updated.enabled) {
            await scheduleAlarm(updated);
        }
    } else {
        // Create new
        const newReminder: Reminder = {
          id: uuidv4(),
          title,
          targetTime,
          repeat,
          note,
          enabled: true,
          createdAt: Date.now(),
        };
        await addReminder(newReminder);
        await scheduleAlarm(newReminder);
    }

    onAdd();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDatetime('');
    setRepeat('none');
    setNote('');
    setIsOpen(false);
    if (onCancel) onCancel();
  };

  if (!isOpen && !initialData) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-full p-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Reminder
      </button>
    );
  }

  return (
    <div className="p-4 mt-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">{initialData ? 'Edit Reminder' : 'New Reminder'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Meeting with Team"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Repeat</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as Reminder['repeat'])}
            className="w-full p-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Prepare slides..."
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-semibold"
          >
            Save
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReminderForm;
