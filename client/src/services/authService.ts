import axios from 'axios';
import { LoginFormData, RegisterFormData, UserAuth } from '../types/Auth';

const API_URL = 'http://localhost:5100/api/auth';

let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/refreshToken`, { refreshToken });
        
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
        processQueue(null, newToken);
        
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const register = async (formData: RegisterFormData): Promise<{ token: string; refreshToken: string; user: UserAuth }> => {
  try {
    const response = await axios.post(`${API_URL}/register`, formData);
    
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
    
    return { token, refreshToken, user };
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const login = async (formData: LoginFormData): Promise<{ token: string; refreshToken: string; user: UserAuth }> => {
  try {
    const response = await axios.post(`${API_URL}/login`, formData);
    
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
  
  const response = await axios.post(`${API_URL}/refreshToken`, { 
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
    axios.post(`${API_URL}/logout`, { refreshToken }).catch(error => {
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
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set in headers');
  } else {
    delete axios.defaults.headers.common['Authorization'];
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