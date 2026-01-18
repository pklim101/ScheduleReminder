export interface Reminder {
  id: string;
  title: string;
  targetTime: number; // Timestamp
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  note: string;
  enabled: boolean;
  createdAt: number;
}
