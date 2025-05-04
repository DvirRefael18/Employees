import axios from 'axios';
import config from '../config/config';

const API_URL = config.api.timeRecords;

// Add request interceptor to ensure token is included in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

export const clockIn = async (reportText?: string): Promise<TimeRecord> => {
  try {
    const response = await axios.post(`${API_URL}/clock-in`, { notes: reportText });
    return response.data;
  } catch (error) {
    console.error('Clock in error:', error);
    throw error;
  }
};

export const clockOut = async (reportText?: string): Promise<TimeRecord> => {
  try {
    const response = await axios.post(`${API_URL}/clock-out`, { notes: reportText });
    return response.data;
  } catch (error) {
    console.error('Clock out error:', error);
    throw error;
  }
};

export const getClockStatus = async (): Promise<ClockStatus> => {
  try {
    const response = await axios.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    console.error('Get clock status error:', error);
    throw error;
  }
};

export const getEmployeeTimeRecords = async (): Promise<TimeRecord[]> => {
  try {
    const response = await axios.get(`${API_URL}/employees`);
    return response.data;
  } catch (error) {
    console.error('Get employee time records error:', error);
    throw error;
  }
};

export const approveTimeRecord = async (id: number): Promise<TimeRecord> => {
  try {
    const response = await axios.put(`${API_URL}/${id}/approve`);
    return response.data;
  } catch (error) {
    console.error('Approve time record error:', error);
    throw error;
  }
};

export const rejectTimeRecord = async (id: number, notes?: string): Promise<TimeRecord> => {
  try {
    const response = await axios.put(`${API_URL}/${id}/reject`, { notes });
    return response.data;
  } catch (error) {
    console.error('Reject time record error:', error);
    throw error;
  }
}; 