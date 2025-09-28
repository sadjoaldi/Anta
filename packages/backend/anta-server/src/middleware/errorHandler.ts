import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('API Error:', err?.message || err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
}
