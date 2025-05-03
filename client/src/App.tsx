import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Link as RouterLink } from 'react-router-dom';
import './App.css';
import EmployeeDashboard from './components/EmployeeDashboard';
import Login from './components/Login';
import Register from './components/Register';
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

  if (logoutRedirect) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Navigate to="/login" replace />
        </BrowserRouter>
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
              {!isAuthenticated && (
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/login"
                    sx={{ mr: 2 }}
                  >
                    Login
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/register"
                  >
                    Register
                  </Button>
                </>
              )}
            </Toolbar>
          </AppBar>
          
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Login onLoginSuccess={handleAuthSuccess} />
                  )
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Register onRegisterSuccess={handleAuthSuccess} />
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
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
