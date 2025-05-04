import axios from 'axios';
import { Manager } from '../types/Auth';
import config from '../config/config';

const API_URL = config.api.auth;

export const getManagers = async (): Promise<Manager[]> => {
  const response = await axios.get(`${API_URL}/managers`);
  return response.data;
}; 