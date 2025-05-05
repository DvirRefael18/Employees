import axios from "axios";

const axiosInstance = axios.create({baseURL: "http://localhost:5100/api"});

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post("http://localhost:5100/api/auth/refreshToken", { 
          refreshToken 
        });
        
        const newToken = response.data.accessToken || response.data.token;
        
        if (newToken) {
          localStorage.setItem('token', newToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        console.error('Token refresh failed', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
