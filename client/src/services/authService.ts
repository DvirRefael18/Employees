import axios from 'axios';
import { LoginFormData, RegisterFormData, UserAuth } from '../types/Auth';

const API_URL = 'http://localhost:5100/api/auth';

export const register = async (formData: RegisterFormData): Promise<{ token: string; user: UserAuth }> => {
  const response = await axios.post(`${API_URL}/register`, formData);
  const { token, user } = response.data;
  
  localStorage.setItem('token', token);
  
  setAuthToken(token);
  
  return { token, user };
};

export const login = async (formData: LoginFormData): Promise<{ token: string; user: UserAuth }> => {
  const response = await axios.post(`${API_URL}/login`, formData);
  const { token, user } = response.data;
  
  localStorage.setItem('token', token);
  
  setAuthToken(token);
  
  return { token, user };
};

export const logout = (): void => {
  localStorage.removeItem('token');
  setAuthToken(null);
};

export const getCurrentUser = async (): Promise<UserAuth> => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const loadUserFromToken = (): { token: string; isValid: boolean } | null => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  
  setAuthToken(token);
  
  try {
    return { token, isValid: true };
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
}; 