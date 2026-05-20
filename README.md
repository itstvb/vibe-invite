# VibeInvite

SaaS-ready monorepo for animated digital invitations.

## Workspace

```txt
apps/
  web/          Auth, dashboard, marketplace, editor, admin, API routes
  invitation/   Public /i/[slug] renderer only
packages/
  types/        Shared domain and schema types
  config/       Firebase, Stripe, Resend, slug, entitlement, validation helpers
  templates/    Card/microsite template registry and renderers
  ui/           Shared UI primitives
```

## Boundary rules

- Browser code uses `@vibeinvite/config/firebase-client`.
- Server routes/actions use `@vibeinvite/config/firebase-admin`.
- Stripe webhook events are the source of truth for purchases and plan changes.
- RSVP submissions go through `/api/rsvp/[invitationId]`; public clients do not write RSVPs directly.
- Templates render by `componentKey`, not Firestore template id.
- Templates and invitations carry `templateType` so cards and microsites can share routing while rendering differently.
- Microsite previews should use iframe routes so GSAP/ScrollTrigger stays out of the main editor bundle.
- Server-side config validation is required before publishing invitations.

## Commands

```bash
pnpm install
pnpm typecheck
pnpm build
```
