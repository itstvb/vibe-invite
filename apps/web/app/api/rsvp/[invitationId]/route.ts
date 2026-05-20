import { adminDb } from '@vibeinvite/config/firebase-admin';
import { resend } from '@vibeinvite/config/resend';
import type { Invitation, RsvpResponse, User } from '@vibeinvite/types';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_RESPONSES = new Set<RsvpResponse>(['yes', 'no', 'maybe']);

export async function POST(req: NextRequest, { params }: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await params;
  const payload = (await req.json()) as {
    name?: string;
    email?: string;
    response?: RsvpResponse;
    message?: string;
    fields?: Record<string, unknown>;
  };

  if (!payload.name || !payload.email || !payload.response || !VALID_RESPONSES.has(payload.response)) {
    return NextResponse.json({ error: 'Invalid RSVP' }, { status: 400 });
  }

  if (!(await rateLimit(req, invitationId, payload.email))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const invitationSnap = await adminDb.collection('invitations').doc(invitationId).get();
  const invitation = invitationSnap.data() as Invitation | undefined;

  if (!invitation || invitation.isPublished !== true) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  if (invitation.rsvpDeadline && invitation.rsvpDeadline < new Date()) {
    return NextResponse.json({ error: 'RSVP deadline has passed' }, { status: 400 });
  }

  await adminDb.collection('rsvps').add({
    invitationId,
    name: payload.name,
    email: payload.email,
    response: payload.response,
    message: payload.message ?? '',
    fields: payload.fields ?? {},
    respondedAt: new Date()
  });

  const creatorSnap = await adminDb.collection('users').doc(invitation.userId).get();
  const creator = creatorSnap.data() as User | undefined;

  if (creator?.email) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'hello@vibeinvite.com',
      to: creator.email,
      subject: `${payload.name} RSVP'd ${payload.response.toUpperCase()} to your invitation`,
      html: `<p>${payload.name} (${payload.email}) responded <strong>${payload.response}</strong>.</p>`
    });
  }

  return NextResponse.json({ success: true });
}

async function rateLimit(_req: NextRequest, _invitationId: string, _email: string) {
  // Replace with a durable limiter such as Vercel KV or Upstash before production.
  return true;
}
