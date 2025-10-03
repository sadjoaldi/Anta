import { Router } from 'express';
import usersRouter from './users.js';
import driversRouter from './drivers.js';
import tripsRouter from './trips.js';
import authRouter from './auth.js';
import ridesRouter from './rides.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'ANTA API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/drivers', driversRouter);
router.use('/trips', tripsRouter);
router.use('/rides', ridesRouter);  // Keep existing rides if needed

export default router;
