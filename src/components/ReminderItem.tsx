import React, { useState, useEffect } from 'react';
import type { Reminder } from '../types';
import { deleteReminder, updateReminder } from '../utils/storage';
import { scheduleAlarm, clearAlarm } from '../utils/alarms';
import { format } from 'date-fns';
import { Trash2, Bell, BellOff, Edit2 } from 'lucide-react';

interface Props {
  reminder: Reminder;
  onUpdate: () => void;
  onEdit: (reminder: Reminder) => void;
}

const ReminderItem: React.FC<Props> = ({ reminder, onUpdate, onEdit }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = reminder.targetTime - now;
      
      if (diff <= 0) {
        setTimeLeft('Overdue');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      
      setTimeLeft(parts.join(' '));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [reminder.targetTime]);

  const handleDelete = async () => {
    await clearAlarm(reminder.id);
    await deleteReminder(reminder.id);
    onUpdate();
  };

  const toggleEnable = async () => {
    const updated = { ...reminder, enabled: !reminder.enabled };
    await updateReminder(updated);
    if (updated.enabled) {
      await scheduleAlarm(updated);
    } else {
      await clearAlarm(updated.id);
    }
    onUpdate();
  };

  return (
    <div className={`p-4 mb-3 bg-white rounded-lg shadow-sm border-l-4 ${reminder.enabled ? 'border-blue-500' : 'border-gray-300'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className={`font-semibold text-gray-800 ${!reminder.enabled && 'line-through text-gray-500'}`}>{reminder.title}</h4>
          <p className="text-sm text-gray-500">
            {format(reminder.targetTime, 'PPpp')} 
            {reminder.repeat !== 'none' && <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">{reminder.repeat}</span>}
          </p>
          {reminder.enabled && <p className="mt-1 text-sm font-mono text-blue-600 font-medium">{timeLeft}</p>}
          {reminder.note && <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{reminder.note}</p>}
        </div>
        <div className="flex space-x-1 ml-2">
          <button onClick={toggleEnable} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50">
            {reminder.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button onClick={() => onEdit(reminder)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderItem;
