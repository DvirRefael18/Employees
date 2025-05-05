export interface Notes {
  startTimeNote: string;
  endTimeNote: string;
}

export interface TimeRecord {
  id: number;
  userId: number;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'approved' | 'rejected';
  managerId: number;
  notes?: Notes;
  createdAt: Date;
  updatedAt: Date;
  employeeName?: string;
  employeeEmail?: string;
}

export interface ClockStatus {
  clockedIn: boolean;
  activeRecord: TimeRecord | null;
} 