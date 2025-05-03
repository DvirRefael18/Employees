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

router.use(authMiddleware);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', checkClockStatus);

router.get('/user', getUserTimeRecords);
router.get('/employees', getEmployeeTimeRecords);

router.put('/:id/approve', approveTimeRecord);
router.put('/:id/reject', rejectTimeRecord);

export default router; 