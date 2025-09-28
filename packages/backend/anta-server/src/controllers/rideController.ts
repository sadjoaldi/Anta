import { Request, Response } from 'express';
import rides from '../repositories/rideRepo';

export async function createRide(req: Request, res: Response) {
  try {
    const { riderId, pickup, dropoff } = (req.body || {}) as {
      riderId?: number;
      pickup?: { lat: number; lng: number };
      dropoff?: { lat: number; lng: number };
    };
    if (!riderId || !pickup || !dropoff) {
      return res.status(400).json({ ok: false, error: 'riderId, pickup, dropoff required' });
    }

    const ride = await rides.create({
      rider_id: riderId,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      dropoff_lat: dropoff.lat,
      dropoff_lng: dropoff.lng,
      status: 'requested'
    });

    return res.status(201).json({ ok: true, data: ride });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
}

export async function getRide(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ride = await rides.findById(id);
    if (!ride) return res.status(404).json({ ok: false, error: 'Ride not found' });
    return res.json({ ok: true, data: ride });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
}

export default { createRide, getRide };
