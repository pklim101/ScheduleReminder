import { getReminders, updateReminder } from './utils/storage';
import { getNextOccurrence } from './utils/date';

console.log("Background service worker started");

// Simple bell icon base64 to ensure it works across all platforms (SVG support is flaky in notifications)
const NOTIFICATION_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAQlBMVEUAAAD///+AgID/AAAAAAD/AP//AAAA//8AAAD/AP8AAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD7EbI5AAAAHXRSTlMAAgQGCAoMDhASFBYYGhweICIoLDA0OlBZYGJoenwN1iMAAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gMREwoY677gYAAAAHNJREFUSMft1MsKACAIBVD9/6+9QKBBdGfTAmcvR4SIaBMx28zO5m5+5qWb2ZmX7uZmXrqZm3npZm7mpZu5mZdu5mZeupmXbuZmXrqZm3npZm7mpZu5mZdu5mZeupmXbuZmXrqZm3npZm7mpZu5mZdu5uYF/x4D6r4BHE4AAAAASUVORK5CYII=';

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log("Alarm fired:", alarm);
  
  const reminders = await getReminders();
  const reminder = reminders.find(r => r.id === alarm.name);
  
  if (reminder) {
    // 1. Show System Notification
    // Use try-catch to prevent silent failures
    try {
        chrome.notifications.create({
            type: "basic",
            iconUrl: NOTIFICATION_ICON, 
            title: "Time's up!",
            message: `${reminder.title}\n${reminder.note || ''}`,
            priority: 2,
            requireInteraction: true,
            silent: false
        });
    } catch (e) {
        console.error("Notification failed:", e);
    }

    // 2. Open a Window Popup (More reliable "Pop-up")
    try {
        // Reduced size (1/4 of original 400x500 area approx, keeping aspect ratio somewhat)
        // Original: 400x500 = 200,000 px^2
        // New: 250x300 = 75,000 px^2 (roughly 1/3 to 1/4 size, compact card)
        const width = 250;
        const height = 300;
        
        await chrome.windows.create({
            url: `index.html?type=reminder&id=${reminder.id}&title=${encodeURIComponent(reminder.title)}&note=${encodeURIComponent(reminder.note || '')}`,
            type: 'popup',
            width: width,
            height: height,
            focused: true
        });
    } catch (e) {
        console.error("Window creation failed:", e);
    }

    // Handle repeat or disable logic
    if (reminder.repeat !== 'none') {
      const newTargetTime = getNextOccurrence(reminder.targetTime, reminder.repeat);
      const updatedReminder = { ...reminder, targetTime: newTargetTime };
      await updateReminder(updatedReminder);
      
      // Schedule next alarm
      chrome.alarms.create(reminder.id, { when: newTargetTime });
    } else {
      // Disable reminder if no repeat
      const updatedReminder = { ...reminder, enabled: false };
      await updateReminder(updatedReminder);
    }
  }
});
