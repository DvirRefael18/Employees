import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { login } from '../api/auth';
import { LoginFormData } from '../types';
import { Loader } from '../components';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper,
  Alert,
  Divider,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      const { token } = await login(formData);
      
      setShowLoadingScreen(true);
      setTimeout(() => {
        onLoginSuccess(token);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (showLoadingScreen) {
    return <Loader message="Preparing your dashboard..." />;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'row',
      height: '80vh',
      maxWidth: '1200px',
      mx: 'auto'
    }}>
      <Box 
        sx={{
          flex: '0 0 60%',
          backgroundImage: 'url(https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          boxShadow: 3,
          position: 'relative',
          height: '100%',
          mr: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 2,
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: 4,
            zIndex: 1
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            EMS
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: '80%', textAlign: 'center' }}>
            Streamline your workforce management with our comprehensive platform
          </Typography>
          <Box
            sx={{
              mt: 3,
              p: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              maxWidth: '80%',
            }}
          >
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              "This platform has transformed how we manage our team's time and productivity."
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'right' }}>
              — Oren Dvash, R&D Lead
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: '0 0 40%' }}>
        <Paper 
          elevation={6} 
          square 
          sx={{ 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            height: '100%'
          }}
        >
          <Box
            sx={{
              my: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: 400
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            
            <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
              Welcome Back
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sign in to access your employee dashboard
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.2,
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <Box mt={3} mb={2}>
                <Divider>
                  <Typography variant="body2" color="text.secondary">
                    New User?
                  </Typography>
                </Divider>
              </Box>
              
              <Box display="flex" justifyContent="center">
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1 }}
                >
                  Create an Account
                </Button>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              © {new Date().getFullYear()} Employee Management System
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login; 