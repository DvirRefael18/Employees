import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

interface LoaderProps {
  message?: string;
  success?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', success = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          minWidth: 300,
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4} 
          color={success ? "success" : "primary"} 
          sx={{ mb: 2 }} 
        />
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Loader; 