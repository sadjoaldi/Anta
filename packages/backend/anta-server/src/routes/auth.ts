import { Router } from 'express';
import { loginMock } from '../controllers/authController';

const router = Router();

router.post('/login', loginMock);

export default router;
