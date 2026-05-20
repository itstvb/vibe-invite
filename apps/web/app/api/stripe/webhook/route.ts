import { adminDb } from '@vibeinvite/config/firebase-admin';
import { STRIPE_WEBHOOK_SECRET, stripe } from '@vibeinvite/config/stripe';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const body = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
  }

  const eventRef = adminDb.collection('processedStripeEvents').doc(event.id);
  const eventSnap = await eventRef.get();

  if (eventSnap.exists) {
    return NextResponse.json({ received: true });
  }

  await adminDb.runTransaction(async (tx) => {
    const existing = await tx.get(eventRef);
    if (existing.exists) return;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, templateId, type } = session.metadata ?? {};

      if (type === 'one_time' && userId && templateId) {
        tx.set(adminDb.collection('purchases').doc(session.id), {
          userId,
          templateId,
          type: 'one_time',
          stripePaymentIntentId: session.payment_intent,
          createdAt: new Date()
        });
      }

      if (type === 'subscription' && userId) {
        tx.update(adminDb.collection('users').doc(userId), {
          plan: 'pro',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const usersSnap = await tx.get(
        adminDb.collection('users').where('stripeSubscriptionId', '==', subscription.id).limit(1)
      );

      if (!usersSnap.empty) {
        tx.update(usersSnap.docs[0].ref, {
          plan: 'free',
          stripeSubscriptionId: null
        });
      }
    }

    tx.set(eventRef, { processedAt: new Date(), type: event.type });
  });

  return NextResponse.json({ received: true });
}
