import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { getManagers } from '../services/managerService';
import { RegisterFormData, Manager } from '../types/Auth';
import LoadingScreen from './LoadingScreen';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper,
  Alert,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
  SelectChangeEvent,
  Divider,
  Avatar,
  Snackbar
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isManager: false,
    managerId: undefined,
    role: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState<boolean>(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState<boolean>(false);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await getManagers();
        setManagers(data);
        setLoadingManagers(false);
      } catch (err) {
        console.log('Managers error:', err);
        console.error('Failed to fetch managers:', err);
        setError('Failed to load managers. Please try again later.');
        setLoadingManagers(false);
      }
    };

    fetchManagers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.managerId) {
        throw new Error('Please select a manager');
      }

      await register(formData);
      
      setSuccess(true);
      setIsLoading(false);
      setShowSuccessSnackbar(true);

      setTimeout(() => {
        setShowLoadingScreen(true);
      }, 1000);

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (showLoadingScreen) {
    return <LoadingScreen message="Preparing your account..." />;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'row',
      height: '80vh',
      maxWidth: '1200px',
      mx: 'auto'
    }}>
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: 16 }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          sx={{ 
            width: '100%', 
            boxShadow: 3,
            fontSize: '1rem',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          Sign-up successfully completed!
        </Alert>
      </Snackbar>

      <Box 
        sx={{
          flex: '0 0 60%',
          backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260)',
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
            Join Our Team
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: '80%', textAlign: 'center' }}>
            Create your account to access employee management features
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
              "Our employee management system helps teams stay organized and productive."
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'right' }}>
              — Team Lead
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right side - Register form */}
      <Box sx={{ flex: '0 0 40%', overflowY: 'auto' }}>
        <Paper 
          elevation={6} 
          square 
          sx={{ 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            minHeight: '100%'
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
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <PersonAddIcon />
            </Avatar>
            
            <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
              Create an Account
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Fill in your details to register
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                Registration successful! Redirecting to login page...
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                margin="normal"
                fullWidth
                id="role"
                label="Job Title"
                name="role"
                value={formData.role}
                onChange={handleChange}
                variant="outlined"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="manager-select-label">Manager</InputLabel>
                <Select
                  labelId="manager-select-label"
                  id="manager-select"
                  name="managerId"
                  value={formData.managerId ? formData.managerId.toString() : ''}
                  label="Manager"
                  onChange={handleSelectChange}
                  disabled={loadingManagers}
                  required
                >
                  {loadingManagers ? (
                    <MenuItem value="">
                      <CircularProgress size={24} />
                    </MenuItem>
                  ) : (
                    managers.map(manager => (
                      <MenuItem key={manager.id} value={manager.id.toString()}>
                        {manager.name} ({manager.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>Select your manager</FormHelperText>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Checkbox
                    name="isManager"
                    checked={formData.isManager}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="I am a manager"
                sx={{ mt: 1 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.2,
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
                disabled={isLoading || loadingManagers}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
              
              <Box mt={3} mb={2}>
                <Divider>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?
                  </Typography>
                </Divider>
              </Box>
              
              <Box display="flex" justifyContent="center">
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1 }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Register; 