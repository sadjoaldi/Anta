import { Request, Response } from 'express';

export async function loginMock(req: Request, res: Response) {
  const { phone } = (req.body || {}) as { phone?: string };
  if (!phone) return res.status(400).json({ ok: false, error: 'phone required' });
  // Mock token
  return res.json({ ok: true, token: 'mock-token', user: { phone } });
}

export default { loginMock };
