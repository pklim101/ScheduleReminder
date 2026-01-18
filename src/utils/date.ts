import { addDays, addWeeks, addMonths, isBefore } from 'date-fns';
import type { Reminder } from '../types';

export const getNextOccurrence = (targetTime: number, repeat: Reminder['repeat']): number => {
  let date = new Date(targetTime);
  const now = new Date();

  if (!isBefore(date, now)) {
    return date.getTime();
  }

  if (repeat === 'none') {
    return targetTime;
  }

  while (isBefore(date, now)) {
    switch (repeat) {
      case 'daily':
        date = addDays(date, 1);
        break;
      case 'weekly':
        date = addWeeks(date, 1);
        break;
      case 'monthly':
        date = addMonths(date, 1);
        break;
    }
  }
  return date.getTime();
};
