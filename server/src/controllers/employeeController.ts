import { Request, Response } from 'express';
import { TimeRecord } from '../models/TimeRecord';
import { User } from '../models/User';

let timeRecords: TimeRecord[] = [];

const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getCurrentTime = (): string => {
  return `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
};

export const clockIn = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { notes } = req.body;
    
    // @ts-ignore
    const users: User[] = req.app.locals.users || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.managerId) {
      return res.status(400).json({ message: 'User does not have a manager assigned' });
    }
    
    const activeRecord = timeRecords.find(
      record => record.userId === userId && !record.endTime
    );
    
    if (activeRecord) {
      return res.status(400).json({ message: 'User is already clocked in' });
    }
    
    const newRecord: TimeRecord = {
      id: timeRecords.length > 0 ? Math.max(...timeRecords.map(r => r.id)) + 1 : 1,
      userId,
      date: getCurrentDate(),
      startTime: getCurrentTime(),
      status: 'pending',
      managerId: user.managerId,
      notes: {
        startTimeNote: notes,
        endTimeNote: ''
      },
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

export const clockOut = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { notes } = req.body;
    
    const activeRecordIndex = timeRecords.findIndex(
      record => record.userId === userId && !record.endTime
    );
    
    if (activeRecordIndex === -1) {
      return res.status(400).json({ message: 'User is not clocked in' });
    }
    const prevStartTimeNote = timeRecords[activeRecordIndex]?.notes?.startTimeNote;
    const updatedRecord = {
      ...timeRecords[activeRecordIndex],
      endTime: getCurrentTime(),
      notes: {
        startTimeNote: prevStartTimeNote ? prevStartTimeNote : '',
        endTimeNote: notes || ''
      },
      updatedAt: new Date()
    };
    
    timeRecords[activeRecordIndex] = updatedRecord;
    
    res.json(updatedRecord);
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserTimeRecords = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    
    const userRecords = timeRecords.filter(record => record.userId === userId);
    
    res.json(userRecords);
  } catch (error) {
    console.error('Get user time records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEmployeeTimeRecords = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const managerId = req.user.id;
    
    const managerRecords = timeRecords.filter(record => record.managerId === managerId);
    
    // @ts-ignore
    const users: User[] = req.app.locals.users || [];
    
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

export const approveTimeRecord = async (req: Request, res: Response) => {
  try {
    const recordId = parseInt(req.params.id);
    // @ts-ignore
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

export const rejectTimeRecord = async (req: Request, res: Response) => {
  try {
    const recordId = parseInt(req.params.id);
    // @ts-ignore
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

    const startTimeNote = record.notes?.startTimeNote
    const endTimeNote = record.notes?.endTimeNote
    const updatedRecord = {
      ...record,
      status: 'rejected' as const,
      notes: {
        startTimeNote: startTimeNote || '',
        endTimeNote: endTimeNote || '',
      },
      updatedAt: new Date()
    };
    
    timeRecords[recordIndex] = updatedRecord;
    
    res.json(updatedRecord);
  } catch (error) {
    console.error('Reject time record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkClockStatus = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
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

export const getManagers = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const users: User[] = req.app.locals.users || [];
    
    const managers = users.filter(user => user.isManager);
    
    const managersList = managers.map(manager => ({
      id: manager.id,
      name: `${manager.firstName} ${manager.lastName}`,
      email: manager.email
    }));
    
    res.json(managersList);
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 