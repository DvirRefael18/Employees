import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  loadUserFromToken,
  setAuthToken,
  getCurrentUser,
  logout,
  refreshToken
} from './api/auth';
import { UserAuth } from './types';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Container,
  Box,
} from '@mui/material';
import AppRoutes from './routes/AppRoutes';
import { Loader, NavBar } from './components';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [logoutRedirect, setLogoutRedirect] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const tokenInfo = loadUserFromToken();
      if (tokenInfo && tokenInfo.isValid) {
        try {
          try {
            await refreshToken();
          } catch (refreshError) {
            console.log('Token refresh failed, continuing with existing token');
          }
          
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to get user data:', error);
          setAuthToken(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
    
    const refreshInterval = setInterval(async () => {
      if (isAuthenticated) {
        try {
          await refreshToken();
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    }, 15 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated]);

  const handleAuthSuccess = async (token: string) => {
    setIsAuthenticated(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to get user data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    setLogoutRedirect(true);
  };

  useEffect(() => {
    if (logoutRedirect) {
      setLogoutRedirect(false);
    }
  }, [logoutRedirect]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Loader message="Loading application..." />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="*" element={
              <NavBar 
                isAuthenticated={isAuthenticated} 
                handleLogout={handleLogout} 
              />
            } />
          </Routes>
          
          <Container sx={{ mt: 4 }}>
            <AppRoutes 
              isAuthenticated={isAuthenticated} 
              user={user} 
              onLoginSuccess={handleAuthSuccess}
            />
          </Container>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
