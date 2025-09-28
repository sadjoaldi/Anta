import { Router, Request, Response } from 'express';
import drivers from '../repositories/driverRepo';

const router = Router();

// GET /api/drivers - liste des chauffeurs disponibles (simplifié)
router.get('/', async (_req: Request, res: Response) => {
  const data = await drivers.listAvailable();
  res.json({ ok: true, data });
});

// POST /api/drivers/upsert - créer/mettre à jour un enregistrement chauffeur pour un utilisateur
router.post('/upsert', async (req: Request, res: Response) => {
  const { userId, vehiclePlate } = (req.body || {}) as { userId?: number; vehiclePlate?: string };
  if (!userId) return res.status(400).json({ ok: false, error: 'userId required' });
  const d = await drivers.upsertForUser(userId, vehiclePlate);
  res.json({ ok: true, data: d });
});

// POST /api/drivers/location - mise à jour de la position
router.post('/location', async (req: Request, res: Response) => {
  const { userId, lat, lng } = (req.body || {}) as { userId?: number; lat?: number; lng?: number };
  if (!userId || typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ ok: false, error: 'userId, lat, lng required' });
  }
  await drivers.updateLocation(userId, lat, lng);
  res.json({ ok: true });
});

// POST /api/drivers/availability - disponibilité du chauffeur
router.post('/availability', async (req: Request, res: Response) => {
  const { userId, available } = (req.body || {}) as { userId?: number; available?: boolean };
  if (!userId || typeof available !== 'boolean') {
    return res.status(400).json({ ok: false, error: 'userId, available required' });
  }
  await drivers.setAvailability(userId, available);
  res.json({ ok: true });
});

// GET /api/drivers/nearby?lat=..&lng=..&radiusKm=..
router.get('/nearby', async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 5;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ ok: false, error: 'lat, lng required' });
  }
  const data = await drivers.findNearby(lat, lng, Number.isFinite(radiusKm) ? radiusKm : 5);
  res.json({ ok: true, data });
});

export default router;
