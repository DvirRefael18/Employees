import { Request, Response } from 'express';
import { TimeRecord } from '../models/TimeRecord';
import { User } from '../models/User';

// In-memory time records storage
let timeRecords: TimeRecord[] = [];

// Helper to get current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper to get current time in HH:MM format
const getCurrentTime = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Clock in
export const clockIn = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - Auth middleware adds user to request
    const userId = req.user.id;
    const { notes } = req.body;
    
    // Get user and their manager
    // @ts-ignore - Access the users array from the imported auth controller
    const users: User[] = req.app.locals.users || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.managerId) {
      return res.status(400).json({ message: 'User does not have a manager assigned' });
    }
    
    // Check if user is already clocked in
    const activeRecord = timeRecords.find(
      record => record.userId === userId && !record.endTime
    );
    
    if (activeRecord) {
      return res.status(400).json({ message: 'User is already clocked in' });
    }
    
    // Create new time record
    const newRecord: TimeRecord = {
      id: timeRecords.length > 0 ? Math.max(...timeRecords.map(r => r.id)) + 1 : 1,
      userId,
      date: getCurrentDate(),
      startTime: getCurrentTime(),
      status: 'pending',
      managerId: user.managerId,
      notes: notes || 'Clock in',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    timeRecords.push(newRecord);
    
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clock out
export const clockOut = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - Auth middleware adds user to request
    const userId = req.user.id;
    const { notes } = req.body;
    
    // Find active time record
    const activeRecordIndex = timeRecords.findIndex(
      record => record.userId === userId && !record.endTime
    );
    
    if (activeRecordIndex === -1) {
      return res.status(400).json({ message: 'User is not clocked in' });
    }
    
    // Update record with end time
    const updatedRecord = {
      ...timeRecords[activeRecordIndex],
      endTime: getCurrentTime(),
      notes: notes || timeRecords[activeRecordIndex].notes || 'Clock out',
      updatedAt: new Date()
    };
    
    timeRecords[activeRecordIndex] = updatedRecord;
    
    res.json(updatedRecord);
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get time records for a user
export const getUserTimeRecords = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - Auth middleware adds user to request
    const userId = req.user.id;
    
    const userRecords = timeRecords.filter(record => record.userId === userId);
    
    res.json(userRecords);
  } catch (error) {
    console.error('Get user time records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get time records for employees under a manager
export const getEmployeeTimeRecords = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - Auth middleware adds user to request
    const managerId = req.user.id;
    
    // Get all records where the manager is the current user
    const managerRecords = timeRecords.filter(record => record.managerId === managerId);
    
    // @ts-ignore - Access the users array from the imported auth controller
    const users: User[] = req.app.locals.users || [];
    
    // Enrich records with employee information
    const enrichedRecords = managerRecords.map(record => {
      const employee = users.find(u => u.id === record.userId);
      return {
        ...record,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
        employeeEmail: employee ? employee.email : 'Unknown'
      };
    });
    
    res.json(enrichedRecords);
  } catch (error) {
    console.error('Get employee time records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve time record
export const approveTimeRecord = async (req: Request, res: Response) => {
  try {
    const recordId = parseInt(req.params.id);
    // @ts-ignore - Auth middleware adds user to request
    const managerId = req.user.id;
    
    const recordIndex = timeRecords.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      return res.status(404).json({ message: 'Time record not found' });
    }
    
    const record = timeRecords[recordIndex];
    
    if (record.managerId !== managerId) {
      return res.status(403).json({ message: 'Not authorized to approve this record' });
    }
    
    if (!record.endTime) {
      return res.status(400).json({ message: 'Cannot approve an active time record' });
    }
    
    // Update record status
    const updatedRecord = {
      ...record,
      status: 'approved' as const,
      updatedAt: new Date()
    };
    
    timeRecords[recordIndex] = updatedRecord;
    
    res.json(updatedRecord);
  } catch (error) {
    console.error('Approve time record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject time record
export const rejectTimeRecord = async (req: Request, res: Response) => {
  try {
    const recordId = parseInt(req.params.id);
    const { notes } = req.body;
    // @ts-ignore - Auth middleware adds user to request
    const managerId = req.user.id;
    
    const recordIndex = timeRecords.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      return res.status(404).json({ message: 'Time record not found' });
    }
    
    const record = timeRecords[recordIndex];
    
    if (record.managerId !== managerId) {
      return res.status(403).json({ message: 'Not authorized to reject this record' });
    }
    
    if (!record.endTime) {
      return res.status(400).json({ message: 'Cannot reject an active time record' });
    }
    
    // Update record status
    const updatedRecord = {
      ...record,
      status: 'rejected' as const,
      notes: notes || 'Rejected by manager',
      updatedAt: new Date()
    };
    
    timeRecords[recordIndex] = updatedRecord;
    
    res.json(updatedRecord);
  } catch (error) {
    console.error('Reject time record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is currently clocked in
export const checkClockStatus = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - Auth middleware adds user to request
    const userId = req.user.id;
    
    const activeRecord = timeRecords.find(
      record => record.userId === userId && !record.endTime
    );
    
    res.json({
      clockedIn: !!activeRecord,
      activeRecord: activeRecord || null
    });
  } catch (error) {
    console.error('Check clock status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 