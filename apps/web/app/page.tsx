import { Button } from '@vibeinvite/ui';

export default function MarketingPage() {
  return (
    <main style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', padding: '2rem' }}>
      <section style={{ maxWidth: 720, textAlign: 'center' }}>
        <p style={{ color: '#b5456a', fontWeight: 700 }}>VibeInvite</p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1 }}>
          Animated invitations with SaaS-ready boundaries.
        </h1>
        <p>
          The public renderer, dashboard, payments, RSVPs, template registry, and entitlement checks are
          separated so the app can grow into premium cards and microsites.
        </p>
        <Button>Start building</Button>
      </section>
    </main>
  );
}
