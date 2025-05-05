import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import { Employee, UserAuth, TimeRecord, Manager } from '../types';
import NoteIcon from '@mui/icons-material/Note';
import { 
  clockIn, 
  clockOut, 
  getClockStatus, 
  getEmployeeTimeRecords,
  approveTimeRecord,
  rejectTimeRecord
} from '../api/time';
import { getManagers } from '../api/auth';

interface EmployeeDashboardProps {
  user: UserAuth | null;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockStatusLoading, setClockStatusLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'clockIn' | 'clockOut'>('clockIn');
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        let managerName = user.managerName;
        
        if (user.managerId && !managerName) {
          try {
            const managers = await getManagers();
            const userManager = managers.find((m: Manager) => m.id === user.managerId);
            managerName = userManager ? userManager.name : '';
          } catch (err) {
            console.error('Error fetching manager info:', err);
          }
        }
        
        setEmployee({
          id: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          role: user.role || '',
          manager: managerName || '',
          isPrototype: user.isPrototype || false
        });

        try {
          await checkClockStatus();
        } catch (clockErr) {
          console.error('Error checking clock status:', clockErr);
        }

        if (user.isManager) {
          try {
            const records = await getEmployeeTimeRecords();
            setTimeRecords(records);
          } catch (recordsErr) {
            console.error('Error fetching time records:', recordsErr);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const checkClockStatus = async () => {
    try {
      setClockStatusLoading(true);
      const status = await getClockStatus();
      setClockedIn(status.clockedIn);
      setClockStatusLoading(false);
    } catch (err) {
      console.error('Error checking clock status:', err);
      setClockStatusLoading(false);
      throw err;
    }
  };

  const openClockInDialog = () => {
    setDialogAction('clockIn');
    setReportText('');
    setDialogOpen(true);
  };

  const openClockOutDialog = () => {
    setDialogAction('clockOut');
    setReportText('');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogSave = async () => {
    setClockStatusLoading(true);
    try {
      if (dialogAction === 'clockIn') {
        await clockIn(reportText);
        setClockedIn(true);
      } else {
        await clockOut(reportText);
        setClockedIn(false);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(`Error ${dialogAction === 'clockIn' ? 'clocking in' : 'clocking out'}:`, err);
      setError(`Failed to ${dialogAction === 'clockIn' ? 'clock in' : 'clock out'}. Please try again.`);
    } finally {
      setClockStatusLoading(false);
    }
  };

  const handleApprove = async (recordId: number) => {
    try {
      setActionLoading(recordId);
      await approveTimeRecord(recordId);
      
      setTimeRecords(prevRecords =>
        prevRecords.map(record =>
          record.id === recordId ? { ...record, status: 'approved' } : record
        )
      );
      
      setActionLoading(null);
    } catch (err) {
      console.error('Error approving record:', err);
      setError('Failed to approve record. Please try again.');
      setActionLoading(null);
    }
  };

  const handleReject = async (recordId: number) => {
    try {
      setActionLoading(recordId);
      await rejectTimeRecord(recordId);
      
      setTimeRecords(prevRecords =>
        prevRecords.map(record =>
          record.id === recordId ? { ...record, status: 'rejected' } : record
        )
      );
      
      setActionLoading(null);
    } catch (err) {
      console.error('Error rejecting record:', err);
      setError('Failed to reject record. Please try again.');
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Please login to view your dashboard
      </Alert>
    );
  }

  return (
    <Box sx={{ minHeight: '80vh' }}>
      <Paper 
        elevation={4}
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #f5f7fa, #e8eef4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            opacity: 0.06,
            backgroundImage: 'url(https://img.icons8.com/ios/250/000000/clock--v1.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            backgroundSize: 'contain',
            zIndex: 0
          }}
        />
      
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="500" color="primary.dark">
            Welcome, {employee?.firstName} {employee?.lastName}
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            {employee?.email} • {employee?.role || 'Employee'}
            {employee?.manager && (
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                Manager: {employee.manager}
              </Box>
            )}
          </Typography>
          
          {!employee?.isPrototype && (
            <Box 
              sx={{ 
                mt: 4, 
                display: 'flex', 
                gap: 3,
                alignItems: 'center' 
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={openClockInDialog}
                disabled={clockedIn || clockStatusLoading}
                sx={{ 
                  minWidth: 140,
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: 2
                }}
              >
                {clockStatusLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Clock In'
                )}
              </Button>
              
              <Button
                variant={clockedIn ? "contained" : "outlined"}
                color={clockedIn ? "secondary" : "primary"}
                onClick={openClockOutDialog}
                disabled={!clockedIn || clockStatusLoading}
                sx={{ 
                  minWidth: 140,
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: clockedIn ? 2 : 0
                }}
              >
                {clockStatusLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Clock Out'
                )}
              </Button>
              
              <Box 
                sx={{ 
                  ml: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  py: 1,
                  px: 3,
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  Status: 
                </Typography>
                <Typography 
                  variant="body1" 
                  color={clockedIn ? "secondary.main" : "text.secondary"} 
                  fontWeight="bold"
                  sx={{ ml: 1 }}
                >
                  {clockedIn ? 'ACTIVE' : 'INACTIVE'}
                </Typography>
              </Box>
            </Box>
          )}
          
          {employee?.isPrototype && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This is a prototype account. Clock In/Out functionality is disabled.
            </Alert>
          )}
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleDialogClose} PaperProps={{
        sx: {
          width: '600px',
          maxWidth: '90vw',
          borderRadius: '10px'
        }
      }} >
        <DialogTitle sx={{ borderBottom: '1px solid #eee', py: 2 }}>
          {dialogAction === 'clockIn' ? 'Clock In Report' : 'Clock Out Report'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            id="report"
            label="Report Text (not required)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDialogClose} color="inherit" variant="outlined">Cancel</Button>
          <Button onClick={handleDialogSave} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {user.isManager && timeRecords.length > 0 && (
        <>
          <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 4 }}>
            Submitted Reports (For manager view only):
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeName || 'Unknown'}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {record.startTime}
                        {record?.notes?.startTimeNote && (
                          <Tooltip title={record.notes.startTimeNote} sx={{ ml: 1 }}>
                            <NoteIcon fontSize="small" color="action" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {record.endTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {record.endTime}
                          {record?.notes?.endTimeNote && (
                            <Tooltip title={record.notes.endTimeNote} sx={{ ml: 1 }}>
                              <NoteIcon fontSize="small" color="action" />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                      {!record.endTime && 'Active'}
                    </TableCell>
                    <TableCell align="center">
                      {record.status === 'pending' && record.endTime && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleApprove(record.id)}
                            disabled={actionLoading === record.id}
                            startIcon={actionLoading === record.id ? <CircularProgress size={20} /> : null}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleReject(record.id)}
                            disabled={actionLoading === record.id}
                            startIcon={actionLoading === record.id ? <CircularProgress size={20} /> : null}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                      {record.status === 'approved' && (
                        <Typography color="primary">Approved</Typography>
                      )}
                      {record.status === 'rejected' && (
                        <Typography color="error">Rejected</Typography>
                      )}
                      {record.status === 'pending' && !record.endTime && (
                        <Typography color="text.secondary">Active Session</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {!employee?.isPrototype && user.isManager && timeRecords.length === 0 && (
        <Alert severity="info" sx={{ mt: 4 }}>
          No time records found for your employees.
        </Alert>
      )}

      {employee?.isPrototype && (
        <Alert severity="info" sx={{ mt: 4 }}>
          This is a prototype and does not have any time records.
        </Alert>
      )}
    </Box>
  );
};

export default EmployeeDashboard; 