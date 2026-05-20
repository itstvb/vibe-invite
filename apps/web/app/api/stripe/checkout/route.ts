import { adminDb } from '@vibeinvite/config/firebase-admin';
import { canUseTemplate } from '@vibeinvite/config/entitlements';
import { stripe } from '@vibeinvite/config/stripe';
import type { Purchase, Template, User } from '@vibeinvite/types';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireUser } from '../../../../lib/server/auth';

export async function POST(req: NextRequest) {
  const decodedToken = await requireUser(req);
  if (!decodedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { templateId, priceId, type } = (await req.json()) as {
    templateId?: string;
    priceId?: string;
    type?: 'one_time' | 'subscription';
  };

  if (!templateId || !priceId || !type) {
    return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 });
  }

  const [userSnap, templateSnap, purchasesSnap] = await Promise.all([
    adminDb.collection('users').doc(decodedToken.uid).get(),
    adminDb.collection('templates').doc(templateId).get(),
    adminDb.collection('purchases').where('userId', '==', decodedToken.uid).get()
  ]);

  const user = userSnap.data() as User | undefined;
  const template = templateSnap.data() as Template | undefined;

  if (!user || !template) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const purchases = purchasesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Purchase);
  const entitlement = canUseTemplate({ user, purchases }, { ...template, id: templateId });

  if (entitlement.allowed) {
    return NextResponse.json({ error: 'Template is already available' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: type === 'subscription' ? 'subscription' : 'payment',
    customer_email: decodedToken.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/templates`,
    metadata: {
      userId: decodedToken.uid,
      templateId,
      type
    }
  });

  return NextResponse.json({ url: session.url });
}
