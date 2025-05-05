import express from 'express';
import { 
  clockIn, 
  clockOut, 
  getUserTimeRecords, 
  getEmployeeTimeRecords,
  approveTimeRecord,
  rejectTimeRecord,
  checkClockStatus,
  getManagers
} from '../controllers/employeeController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/managers', getManagers);

router.use(authMiddleware);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', checkClockStatus);

router.get('/records', getUserTimeRecords);
router.get('/team-records', getEmployeeTimeRecords);

router.put('/records/:id/approve', approveTimeRecord);
router.put('/records/:id/reject', rejectTimeRecord);

export default router; 