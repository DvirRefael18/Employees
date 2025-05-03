import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { users } from './controllers/authController';
import authRoutes from './routes/authRoutes';
import timeRecordRoutes from './routes/timeRecordRoutes';

const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

const corsOptions = {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.locals.users = users;
app.use('/api/auth', authRoutes);
app.use('/api/time-records', timeRecordRoutes);

app.get('/', (req, res) => {
  res.send('Employee Management API, Welcome!');
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

app.use((req, res) => {
  console.log('404 Route Not Found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

export default app; 