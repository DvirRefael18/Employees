import { TimeRecord, ClockStatus } from '../types';
import axiosInstance from './index';

export const clockIn = async (reportText?: string): Promise<TimeRecord> => {
  try {
    const response = await axiosInstance.post('/employees/clock-in', { notes: reportText });
    return response.data;
  } catch (error) {
    console.error('Clock in error:', error);
    throw error;
  }
};

export const clockOut = async (reportText?: string): Promise<TimeRecord> => {
  try {
    const response = await axiosInstance.post('/employees/clock-out', { notes: reportText });
    return response.data;
  } catch (error) {
    console.error('Clock out error:', error);
    throw error;
  }
};

export const getClockStatus = async (): Promise<ClockStatus> => {
  try {
    const response = await axiosInstance.get('/employees/status');
    return response.data;
  } catch (error) {
    console.error('Get clock status error:', error);
    throw error;
  }
};

export const getEmployeeTimeRecords = async (): Promise<TimeRecord[]> => {
  try {
    const response = await axiosInstance.get('/employees/team-records');
    return response.data;
  } catch (error) {
    console.error('Get employee time records error:', error);
    throw error;
  }
};

export const approveTimeRecord = async (id: number): Promise<TimeRecord> => {
  try {
    const response = await axiosInstance.put(`/employees/records/${id}/approve`);
    return response.data;
  } catch (error) {
    console.error('Approve time record error:', error);
    throw error;
  }
};

export const rejectTimeRecord = async (id: number, notes?: string): Promise<TimeRecord> => {
  try {
    const response = await axiosInstance.put(`/employees/records/${id}/reject`, { notes });
    return response.data;
  } catch (error) {
    console.error('Reject time record error:', error);
    throw error;
  }
}; 