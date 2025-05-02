import axios from 'axios';

// Update API URL to exactly match what the server expects
const API_URL = 'http://localhost:5100/api/time-records';

// Debug log for API URLs
console.log('Time Record API URL:', API_URL);

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

// Interface for time record
export interface TimeRecord {
  id: number;
  userId: number;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'approved' | 'rejected';
  managerId: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  employeeName?: string;
  employeeEmail?: string;
}

// Interface for clock status response
export interface ClockStatus {
  clockedIn: boolean;
  activeRecord: TimeRecord | null;
}

// Clock in
export const clockIn = async (reportText?: string): Promise<TimeRecord> => {
  try {
    const response = await axios.post(`${API_URL}/clock-in`, { notes: reportText });
    return response.data;
  } catch (error) {
    console.error('Clock in error:', error);
    throw error;
  }
};

// Clock out
export const clockOut = async (reportText?: string): Promise<TimeRecord> => {
  try {
    const response = await axios.post(`${API_URL}/clock-out`, { notes: reportText });
    return response.data;
  } catch (error) {
    console.error('Clock out error:', error);
    throw error;
  }
};

// Get current clock status
export const getClockStatus = async (): Promise<ClockStatus> => {
  try {
    const response = await axios.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    console.error('Get clock status error:', error);
    throw error;
  }
};

// Get user's time records
export const getUserTimeRecords = async (): Promise<TimeRecord[]> => {
  try {
    const response = await axios.get(`${API_URL}/user`);
    return response.data;
  } catch (error) {
    console.error('Get user time records error:', error);
    throw error;
  }
};

// Get time records for employees (manager only)
export const getEmployeeTimeRecords = async (): Promise<TimeRecord[]> => {
  try {
    const response = await axios.get(`${API_URL}/employees`);
    return response.data;
  } catch (error) {
    console.error('Get employee time records error:', error);
    throw error;
  }
};

// Approve a time record
export const approveTimeRecord = async (id: number): Promise<TimeRecord> => {
  try {
    const response = await axios.put(`${API_URL}/${id}/approve`);
    return response.data;
  } catch (error) {
    console.error('Approve time record error:', error);
    throw error;
  }
};

// Reject a time record
export const rejectTimeRecord = async (id: number, notes?: string): Promise<TimeRecord> => {
  try {
    const response = await axios.put(`${API_URL}/${id}/reject`, { notes });
    return response.data;
  } catch (error) {
    console.error('Reject time record error:', error);
    throw error;
  }
}; 