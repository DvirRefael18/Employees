import React, { useState, useEffect } from 'react';
import { register } from '../services/authService';
import { getManagers } from '../services/managerService';
import { RegisterFormData, Manager } from '../types/Auth';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Container,
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
  SelectChangeEvent
} from '@mui/material';

interface RegisterProps {
  onRegisterSuccess: (token: string) => void;
  onRegisterComplete: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onRegisterComplete }) => {
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
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState<boolean>(true);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await getManagers();
        console.log('Managers data:', data);
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
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.managerId) {
        throw new Error('Please select a manager');
      }

      // Register user but don't log them in
      await register(formData);
      
      // Show success message and redirect to login
      setError(null);
      onRegisterComplete(); // Call this to redirect to login page
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="div" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 2
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            autoFocus
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
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
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="role"
            label="Role"
            autoComplete="role"
            value={formData.role}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="manager-select-label">Manager</InputLabel>
            {loadingManagers ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2">Loading managers...</Typography>
              </Box>
            ) : (
              <>
                <Select
                  labelId="manager-select-label"
                  id="managerId"
                  name="managerId"
                  value={formData.managerId ? formData.managerId.toString() : ''}
                  label="Manager"
                  onChange={handleSelectChange}
                >
                  {managers.map(manager => (
                    <MenuItem key={manager.id} value={manager.id.toString()}>
                      {manager.name} ({manager.email})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select your manager</FormHelperText>
              </>
            )}
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
            label="Is Manager"
            sx={{ mt: 1 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || loadingManagers}
          >
            {isLoading ? 'Loading...' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 