import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import LoadingScreen from './LoadingScreen';
import { Box, Tabs, Tab, Paper, Alert } from '@mui/material';

interface AuthProps {
  onAuthSuccess: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Clear registration success when changing tabs
    if (newValue === 0) {
      setRegistrationSuccess(false);
    }
  };
  
  const handleLoginSuccess = (token: string) => {
    setIsLoading(true);
    
    // Show loading screen for at least 3 seconds
    setTimeout(() => {
      onAuthSuccess(token);
    }, 3000);
  };

  const handleRegisterSuccess = (token: string) => {
    setIsLoading(true);
    
    // Show loading screen for at least 3 seconds
    setTimeout(() => {
      onAuthSuccess(token);
    }, 3000);
  };

  const handleRegisterComplete = () => {
    setRegistrationSuccess(true);
    setActiveTab(0); // Switch back to login tab
  };

  if (isLoading) {
    return <LoadingScreen message="Preparing your dashboard..." />;
  }

  return (
    <Box sx={{ width: '100%', mt: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ width: '100%', maxWidth: 600 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="authentication tabs"
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          {registrationSuccess && activeTab === 0 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Please login with your credentials.
            </Alert>
          )}
          
          {activeTab === 0 ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Register 
              onRegisterSuccess={handleRegisterSuccess} 
              onRegisterComplete={handleRegisterComplete}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Auth; 