import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import { ProtectedRoute } from '../components';
import { UserAuth } from '../types';

interface AppRoutesProps {
  isAuthenticated: boolean;
  user: UserAuth | null;
  onLoginSuccess: (token: string) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ 
  isAuthenticated, 
  user, 
  onLoginSuccess 
}) => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLoginSuccess={onLoginSuccess} />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register />
          )
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <EmployeeDashboard user={user} />
          </ProtectedRoute>
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
  );
};

export default AppRoutes; 