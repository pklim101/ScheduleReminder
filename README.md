# Schedule Reminder Extension

A feature-rich Chrome Extension for managing personal reminders with precision and ease. Built with React, TypeScript, and Vite.


<img width="400" height="600" alt="mainpage" src="https://github.com/user-attachments/assets/9bfc8099-bc3b-4124-98c7-57b9bc4cf4a5" />
<img width="300" height="402" alt="alert" src="https://github.com/user-attachments/assets/dac33574-94a5-4541-98c8-545627b6abf1" />


## ✨ Features

- **Multi-Reminder Management**: Create, edit, delete, and view multiple reminders.
- **Precision Countdown**: Real-time countdown display for every active reminder (Days/Hours/Minutes/Seconds).
- **Recurring Alerts**: Support for Daily, Weekly, and Monthly repeating reminders.
- **Smart Notifications**:
  - **System Notifications**: Native Chrome notifications when a timer expires.
  - **Popup Alert**: A dedicated, persistent popup window ensures you never miss a reminder.
- **Persistent Storage**: Data is saved locally using Chrome Storage API, ensuring your reminders survive browser restarts.
- **Offline Support**: Works perfectly without an internet connection.

## 🚀 Installation

### For Users (Load Unpacked)
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the `dist` folder from the project directory (Note: You need to build the project first, see below).

*Alternatively, if a `.crx` or `.zip` release is provided, drag and drop it here.*

### For Developers

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chrome-reminder-ext.git
   cd chrome-reminder-ext
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```
   *This will watch for changes and rebuild automatically.*

4. **Build for Production**
   ```bash
   npm run build
   ```
   *The output will be in the `dist` directory.*

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Chrome APIs**: Alarms, Storage, Notifications, Windows, Tabs

## 📂 Project Structure

```
chrome_reminder_ext/
├── dist/               # Production build output (Load this in Chrome)
├── public/             # Static assets (icons, manifest)
├── src/
│   ├── components/     # React components (ReminderItem, Popup, Forms)
│   ├── utils/          # Helpers for storage, date, and alarms
│   ├── background.ts   # Background service worker logic
│   ├── App.tsx         # Main popup application
│   └── main.tsx        # Entry point
├── manifest.json       # Chrome Extension Manifest V3
└── vite.config.ts      # Vite configuration
```

## 📝 Usage Guide

1. **Add Reminder**: Click the "Add Reminder" button, enter a title, select a time, and optionally set a repeat interval or note.
2. **Edit**: Click the pencil icon on any reminder to reschedule or modify details.
3. **Toggle**: Use the bell icon to quickly enable/disable a reminder without deleting it.
4. **Delete**: Click the trash icon to remove a reminder permanently.
5. **Alerts**: When time is up, you will see a system notification and a centered popup window. Click "Dismiss" to close it.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT
