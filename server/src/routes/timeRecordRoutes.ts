import express from 'express';
import { 
  clockIn, 
  clockOut, 
  getUserTimeRecords, 
  getEmployeeTimeRecords,
  approveTimeRecord,
  rejectTimeRecord,
  checkClockStatus
} from '../controllers/timeRecordController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All time record routes require authentication
router.use(authMiddleware);

// Clock in/out routes
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', checkClockStatus);

// Get time records
router.get('/user', getUserTimeRecords);
router.get('/employees', getEmployeeTimeRecords);

// Approve/reject time records
router.put('/:id/approve', approveTimeRecord);
router.put('/:id/reject', rejectTimeRecord);

export default router; 