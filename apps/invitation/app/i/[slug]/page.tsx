import { adminDb } from '@vibeinvite/config/firebase-admin';
import { getTemplate } from '@vibeinvite/templates';
import type { Invitation } from '@vibeinvite/types';
import { FieldValue } from 'firebase-admin/firestore';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) {
    return { title: 'Invitation not found' };
  }

  const recipientName = getString(invitation.config.recipientName, 'you');
  const message = getString(invitation.config.message, '');

  return {
    title: `You're invited, ${recipientName}`,
    description: message.slice(0, 140),
    openGraph: {
      title: "You're invited",
      description: message.slice(0, 140)
    }
  };
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) notFound();

  const template = getTemplate(invitation.componentKey);
  if (!template) notFound();

  await adminDb.collection('invitations').doc(invitation.id).update({
    viewCount: FieldValue.increment(1)
  });

  const TemplateComponent = template.component;
  const isMicrosite = template.templateType === 'microsite';

  return (
    <main className={isMicrosite ? 'microsite-page' : 'card-page'}>
      <TemplateComponent
        config={invitation.config}
        isPreview={false}
        renderMode="public"
        onRsvp={async (data) => {
          'use server';

          const res = await fetch(`${process.env.NEXT_PUBLIC_WEB_APP_URL}/api/rsvp/${invitation.id}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data)
          });

          if (!res.ok) {
            throw new Error('Unable to submit RSVP');
          }
        }}
      />
    </main>
  );
}

async function getInvitation(slug: string): Promise<Invitation | null> {
  const snap = await adminDb
    .collection('invitations')
    .where('slug', '==', slug)
    .where('isPublished', '==', true)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Invitation;
}

function getString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}
