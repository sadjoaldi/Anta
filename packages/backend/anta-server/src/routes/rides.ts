import { Router } from 'express';
import { createRide, getRide } from '../controllers/rideController';

const router = Router();

router.post('/', createRide);
router.get('/:id', getRide);

export default router;
