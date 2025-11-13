import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import knex from './utils/knex.js';
import errorHandler from './middleware/errorHandler.js';
import { securityHeaders, configureCors, sanitizeRequest, requestLogger } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import initSockets from './sockets/index.js';
import { registerRoutes } from './route.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Test DB connection on startup (non-blocking)
(async () => {
  try {
    await knex.raw('select 1 as ok');
    console.log('✅ DB connected (Knex)');
  } catch (err: any) {
    console.error('❌ DB connection error:', err?.message);
  }
})();

// Security middlewares (must be first)
app.use(securityHeaders);
app.use(sanitizeRequest);

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : '*';
app.use(cors(configureCors(corsOrigins)));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded documents)
app.use('/uploads', express.static('uploads'));

// Rate limiting (apply to all API routes)
app.use('/api', apiLimiter);

// Routes
registerRoutes(app);

// WebSocket
initSockets(wss);

// Error handler (must be last)
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
  console.log(`🚀 ANTA server listening on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security headers enabled`);
  console.log(`⏱️  Rate limiting enabled`);
});
