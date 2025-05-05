import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button
} from '@mui/material';

interface NavBarProps {
  isAuthenticated: boolean;
  handleLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ isAuthenticated, handleLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isLoginPage = currentPath === '/login';
  const isRegisterPage = currentPath === '/register';
  const isDashboardPage = currentPath === '/dashboard';
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Employee Management System
        </Typography>
        {isAuthenticated && (
          <>
            {!isDashboardPage && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/dashboard"
                sx={{ mr: 2 }}
              >
                Dashboard
              </Button>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
        {!isAuthenticated && (
          <>
            {!isLoginPage && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ mr: 2 }}
              >
                Login
              </Button>
            )}
            {!isRegisterPage && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
              >
                Register
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 