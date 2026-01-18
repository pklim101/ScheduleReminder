import type { Reminder } from '../types';

const STORAGE_KEY = 'reminders';

export const getReminders = async (): Promise<Reminder[]> => {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as Reminder[]) || [];
};

export const saveReminders = async (reminders: Reminder[]): Promise<void> => {
  await chrome.storage.local.set({ [STORAGE_KEY]: reminders });
};

export const addReminder = async (reminder: Reminder): Promise<void> => {
  const reminders = await getReminders();
  reminders.push(reminder);
  await saveReminders(reminders);
};

export const updateReminder = async (updatedReminder: Reminder): Promise<void> => {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === updatedReminder.id);
  if (index !== -1) {
    reminders[index] = updatedReminder;
    await saveReminders(reminders);
  }
};

export const deleteReminder = async (id: string): Promise<void> => {
  const reminders = await getReminders();
  const newReminders = reminders.filter(r => r.id !== id);
  await saveReminders(newReminders);
};
