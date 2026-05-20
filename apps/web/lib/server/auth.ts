import 'server-only';

import { adminAuth } from '@vibeinvite/config/firebase-admin';
import type { NextRequest } from 'next/server';

export async function requireUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  return adminAuth.verifyIdToken(token);
}
