import axios from 'axios';
import { Manager } from '../types/Auth';

const API_URL = 'http://localhost:5100/api/auth';

// Get all managers for dropdown selection
export const getManagers = async (): Promise<Manager[]> => {
  const response = await axios.get(`${API_URL}/managers`);
  console.log('Managers response:', response.data);
  return response.data;
}; 