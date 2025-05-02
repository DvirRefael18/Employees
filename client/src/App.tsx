import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Link as RouterLink } from 'react-router-dom';
import './App.css';
import EmployeeDashboard from './components/EmployeeDashboard';
import Auth from './components/Auth';
import PrivateRoute from './components/PrivateRoute';
import { loadUserFromToken, setAuthToken, getCurrentUser, logout } from './services/authService';
import { UserAuth } from './types/Auth';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Box,
  CircularProgress
} from '@mui/material';

// Create a theme
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

  useEffect(() => {
    const initAuth = async () => {
      const tokenInfo = loadUserFromToken();
      if (tokenInfo && tokenInfo.isValid) {
        try {
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
  }, []);

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
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh'
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Employee Management System
              </Typography>
              {isAuthenticated && (
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/dashboard"
                    sx={{ mr: 2 }}
                  >
                    Dashboard
                  </Button>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </Toolbar>
          </AppBar>
          
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route 
                path="/auth" 
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Auth onAuthSuccess={handleAuthSuccess} />
                  )
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated}>
                    <EmployeeDashboard user={user} />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
