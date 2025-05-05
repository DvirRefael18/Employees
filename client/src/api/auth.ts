import { LoginFormData, RegisterFormData, UserAuth, Manager } from '../types';
import axiosInstance from './index';

export const setAuthToken = (token: string | null): void => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set in headers');
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    console.log('Auth token removed from headers');
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
    const refreshTokenStr = localStorage.getItem('refreshToken');
    if (refreshTokenStr) {
      return { token, isValid: true };
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

export const register = async (formData: RegisterFormData): Promise<{ token: string; refreshToken: string; user: UserAuth }> => {
  try {
    const response = await axiosInstance.post('/auth/register', formData);
    
    const token = response.data.token || response.data.accessToken;
    const refreshToken = response.data.refreshToken || '';
    const user = response.data.user || response.data;
    
    if (!token) {
      throw new Error('No token received from server');
    }
    
    return { token, refreshToken, user };
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const login = async (formData: LoginFormData): Promise<{ token: string; refreshToken: string; user: UserAuth }> => {
  try {
    const response = await axiosInstance.post('/auth/login', formData);
    
    const token = response.data.token || response.data.accessToken;
    const refreshToken = response.data.refreshToken || '';
    const user = response.data.user || response.data;
    
    if (!token) {
      throw new Error('No token received from server');
    }
    
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    setAuthToken(token);
    
    console.log('Login successful, token set:', token);
    
    return { token, refreshToken, user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<string> => {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  
  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await axiosInstance.post('/auth/refreshToken', { 
    refreshToken: currentRefreshToken 
  });
  
  const newToken = response.data.accessToken || response.data.token;
  const newRefreshToken = response.data.refreshToken;
  
  if (!newToken) {
    throw new Error('No token received from server');
  }
  
  localStorage.setItem('token', newToken);
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }
  
  setAuthToken(newToken);
  
  return newToken;
};

export const logout = (): void => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (refreshToken) {
    axiosInstance.post('/auth/logout', { refreshToken }).catch(error => {
      console.error('Error during logout:', error);
    });
  }
  
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  setAuthToken(null);
};

export const getCurrentUser = async (): Promise<UserAuth> => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
  
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

export const getManagers = async (): Promise<Manager[]> => {
  const response = await axiosInstance.get('/employees/managers');
  return response.data;
};