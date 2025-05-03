import axios from 'axios';
import { Manager } from '../types/Auth';

const API_URL = 'http://localhost:5100/api/auth';

export const getManagers = async (): Promise<Manager[]> => {
  const response = await axios.get(`${API_URL}/managers`);
  return response.data;
}; 