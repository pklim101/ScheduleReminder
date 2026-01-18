import React, { useState } from 'react';
import { AlertCircle, Edit2, Check, X } from 'lucide-react';
import type { Reminder } from '../types';
import { updateReminder } from '../utils/storage';
import { scheduleAlarm, clearAlarm } from '../utils/alarms';

interface Props {
  id: string;
  title: string;
  note: string;
}

const ReminderPopup: React.FC<Props> = ({ id, title, note }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartEdit = () => {
    // Set default value to now (ISO string cut to minutes)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Suggest 1 minute later
    const iso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setNewTime(iso);
    setIsEditing(true);
    setError('');
  };

  const handleSave = async () => {
    if (!newTime) return;

    const targetTime = new Date(newTime).getTime();
    const now = Date.now();

    if (targetTime <= now) {
      setError('Time must be in the future');
      // Reset to now + 1 min
      const resetDate = new Date();
      resetDate.setMinutes(resetDate.getMinutes() + 1);
      const iso = new Date(resetDate.getTime() - (resetDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setNewTime(iso);
      return;
    }

    setLoading(true);
    try {
        // We need to fetch the full reminder first to update it properly
        // However, in this isolated popup context, we might not have the full object.
        // We can cheat a bit: we only need to update the time.
        // But wait, 'updateReminder' expects a full object.
        // We should probably fetch it from storage first.
        // Since we are inside the extension context (App.tsx), we can use storage utils.
        
        // Dynamic import to avoid circular dependencies if any? No, static is fine.
        const { getReminders } = await import('../utils/storage');
        const reminders = await getReminders();
        const existing = reminders.find(r => r.id === id);

        if (existing) {
            const updated: Reminder = {
                ...existing,
                targetTime: targetTime,
                enabled: true // Re-enable if it was disabled
            };
            
            await updateReminder(updated);
            await clearAlarm(id);
            await scheduleAlarm(updated);
            
            // Close window on success
            window.close();
        } else {
            setError('Reminder not found');
        }
    } catch (err) {
        console.error(err);
        setError('Failed to save');
    } finally {
        setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full h-full bg-white flex flex-col p-4 text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Reschedule</h2>
        
        <div className="flex-1 flex flex-col justify-center space-y-4">
            <div>
                <input 
                    type="datetime-local" 
                    value={newTime}
                    onChange={(e) => {
                        setNewTime(e.target.value);
                        setError('');
                    }}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {error && <p className="text-red-500 text-xs mt-1 text-left">{error}</p>}
            </div>
        </div>

        <div className="flex space-x-2 mt-4">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Save
            </button>
            <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 flex items-center justify-center py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
                <X className="w-4 h-4 mr-1" />
                Cancel
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col relative p-4 text-center">
        <button 
            onClick={handleStartEdit}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Edit Reminder"
        >
            <Edit2 className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 animate-pulse">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{title}</h1>
            {note && (
                <div className="bg-gray-50 p-2 rounded-lg w-full mb-4 max-h-20 overflow-y-auto">
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{note}</p>
                </div>
            )}
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">Time's Up</p>
        </div>

        <button 
            onClick={() => window.close()}
            className="w-full py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors shadow-sm"
        >
            Dismiss
        </button>
    </div>
  );
};

export default ReminderPopup;
