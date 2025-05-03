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
  TextField
} from '@mui/material';
import { Employee } from '../types/Employee';
import { 
  clockIn, 
  clockOut, 
  getClockStatus, 
  getEmployeeTimeRecords,
  approveTimeRecord,
  rejectTimeRecord,
  TimeRecord
} from '../services/timeRecordService';

interface EmployeeDashboardProps {
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    isManager?: boolean;
    managerId?: number;
    managerName?: string;
    role?: string;
    isPrototype?: boolean;
  } | null;
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
        setEmployee({
          id: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          role: user.role || '',
          manager: user.managerName || '',
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
      throw err; // Re-throw to let caller handle if needed
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
      
      // Update the status in the local state
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
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        EMPLOYEE DETAILS
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <Box sx={{ width: '50%', mb: 2 }}>
            <Typography variant="subtitle1">First Name:</Typography>
            <Typography variant="body1">{employee?.firstName}</Typography>
          </Box>
          <Box sx={{ width: '50%', mb: 2 }}>
            <Typography variant="subtitle1">Last Name:</Typography>
            <Typography variant="body1">{employee?.lastName}</Typography>
          </Box>
          <Box sx={{ width: '50%', mb: 2 }}>
            <Typography variant="subtitle1">Role:</Typography>
            <Typography variant="body1">{employee?.role}</Typography>
          </Box>
          {!employee?.isPrototype && (<Box sx={{ width: '50%', mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">Manager:</Typography>
            <Typography variant="body1">{employee?.manager}</Typography>
          </Box>)}
        </Box>
      </Paper>

      {!(employee?.isPrototype) && (<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={openClockInDialog}
          disabled={clockedIn || clockStatusLoading}
          startIcon={clockStatusLoading ? <CircularProgress size={20} /> : null}
        >
          {clockStatusLoading ? 'Processing...' : 'Clock In'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={openClockOutDialog}
          disabled={!clockedIn || clockStatusLoading}
          startIcon={clockStatusLoading ? <CircularProgress size={20} /> : null}
        >
          {clockStatusLoading ? 'Processing...' : 'Clock Out'}
        </Button>
      </Box>)}

      <Dialog open={dialogOpen} onClose={handleDialogClose} PaperProps={{
        sx: {
          width: '600px',
          maxWidth: '90vw',
          borderRadius: '10px'
        }
      }} >
        <DialogTitle>
          {dialogAction === 'clockIn' ? 'Clock In Report' : 'Clock Out Report'}
        </DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit" variant={'outlined'}>Cancel</Button>
          <Button onClick={handleDialogSave} color="primary" variant={'contained'}>Save</Button>
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
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeName || 'Unknown'}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.startTime}</TableCell>
                    <TableCell>{record.endTime || 'Active'}</TableCell>
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