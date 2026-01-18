import { useState, useEffect } from 'react';
import type { Reminder } from './types';
import { getReminders } from './utils/storage';
import ReminderItem from './components/ReminderItem';
import AddReminderForm from './components/AddReminderForm';
import ReminderPopup from './components/ReminderPopup';
import { Clock } from 'lucide-react';

function App() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderMode, setReminderMode] = useState<{id: string, title: string, note: string} | null>(null);

  const fetchReminders = async () => {
    try {
      const data = await getReminders();
      // Sort: enabled first, then by time
      const sorted = data.sort((a, b) => {
        if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
        return a.targetTime - b.targetTime;
      });
      setReminders(sorted);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for URL parameters to see if we are in "Reminder Popup" mode
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    
    if (type === 'reminder') {
        const id = params.get('id') || '';
        const title = params.get('title') || 'Reminder';
        const note = params.get('note') || '';
        setReminderMode({ id, title, note });
        setLoading(false); // No need to load list
    } else {
        fetchReminders();
    }
  }, []);

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
  };

  const handleAddOrUpdate = () => {
    fetchReminders();
    setEditingReminder(null);
  };

  const handleCancelEdit = () => {
    setEditingReminder(null);
  };

  // Render "Reminder Popup" Mode
  if (reminderMode) {
      return (
          <ReminderPopup 
              id={reminderMode.id}
              title={reminderMode.title}
              note={reminderMode.note}
          />
      );
  }

  // Render Normal List Mode
  return (
    <div className="w-[400px] min-h-[400px] max-h-[600px] bg-gray-100 flex flex-col">
      <header className="p-4 bg-white border-b flex items-center shadow-sm">
        <Clock className="w-6 h-6 text-blue-600 mr-2" />
        <h1 className="text-xl font-bold text-gray-800">Schedule Reminder</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {!editingReminder && reminders.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <p>No reminders yet.</p>
                <p className="text-sm">Click below to add one!</p>
              </div>
            )}

            {!editingReminder && (
              <div>
                {reminders.map((reminder) => (
                  <ReminderItem
                    key={reminder.id}
                    reminder={reminder}
                    onUpdate={fetchReminders}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
            
            <AddReminderForm 
              onAdd={handleAddOrUpdate} 
              initialData={editingReminder}
              onCancel={handleCancelEdit}
            />
          </>
        )}
      </main>

      <footer className="p-2 bg-gray-50 border-t text-center text-[10px] text-gray-400">
        Schedule Reminder Extension v1.0.0
      </footer>
    </div>
  );
}

export default App;
