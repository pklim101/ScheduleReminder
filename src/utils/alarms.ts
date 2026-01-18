import type { Reminder } from '../types';
import { getNextOccurrence } from './date';

export const scheduleAlarm = async (reminder: Reminder) => {
  if (!reminder.enabled) {
    await chrome.alarms.clear(reminder.id);
    return;
  }

  const nextTime = getNextOccurrence(reminder.targetTime, reminder.repeat);
  const now = Date.now();

  if (nextTime > now) {
    await chrome.alarms.create(reminder.id, { when: nextTime });
  } else {
     await chrome.alarms.clear(reminder.id);
  }
};

export const clearAlarm = async (id: string) => {
  await chrome.alarms.clear(id);
};
