import { Express, Request, Response } from 'express';
import authRoutes from './routes/auth.js';
import driverRoutes from './routes/drivers.js';
import rideRoutes from './routes/rides.js';
import userRoutes from './routes/users.js';
import tripRoutes from './routes/trips.js';
import vehicleRoutes from './routes/vehicles.js';
import paymentRoutes from './routes/payments.js';
import statsRoutes from './routes/stats.js';
import promotionRoutes from './routes/promotions.js';

export function registerRoutes(app: Express) {
  // Healthcheck
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'anta-server', time: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/drivers', driverRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/rides', rideRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/promotions', promotionRoutes);
}
