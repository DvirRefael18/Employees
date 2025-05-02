export interface TimeRecord {
  id: number;
  userId: number;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime?: string; // HH:MM format (undefined when currently clocked in)
  status: 'pending' | 'approved' | 'rejected';
  managerId: number; // ID of the manager who needs to approve this
  notes?: string; // Optional notes from employee or manager
  createdAt: Date;
  updatedAt: Date;
} 