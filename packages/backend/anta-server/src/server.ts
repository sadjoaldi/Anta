import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import knex from './utils/knex';
import errorHandler from './middleware/errorHandler';

import authRoutes from './routes/auth';
import driverRoutes from './routes/drivers';
import rideRoutes from './routes/rides';
import initSockets from './sockets';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Test DB connection on startup (non-blocking)
(async () => {
  try {
    await knex.raw('select 1 as ok');
    console.log('DB connected (Knex)');
  } catch (err: any) {
    console.error('DB connection error:', err?.message);
  }
})();

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'anta-server', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/rides', rideRoutes);

// WebSocket
initSockets(wss);

// Error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
  console.log(`ANTA server listening on port ${PORT}`);
});
