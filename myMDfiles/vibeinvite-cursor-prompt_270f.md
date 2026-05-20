# VibeInvite — Cursor Boilerplate Prompt

Paste this entire prompt into Cursor's AI panel (or use it as your `.cursorrules` starting point) to scaffold the VibeInvite project.

---

## Project Brief

You are building **VibeInvite** — a SaaS platform for animated digital invitation cards.

- Template creators (admin) build animated card templates
- Users browse a marketplace, purchase templates (one-time or subscription)
- Users customize templates (fields, colors, fonts, animation speed) in a live editor
- Users generate a unique shareable URL (e.g. `vibeinvite.com/i/abc123`)
- Recipients open the URL and experience a full animated invitation
- Recipients can RSVP directly on the invitation page
- Creators see RSVPs in real-time on their dashboard

---

## Monorepo Structure

Scaffold a **pnpm monorepo** using **Turborepo** with this exact structure:

```
vibeinvite/
├── apps/
│   ├── web/                      # Next.js 14 App Router — main app
│   └── invitation/               # Next.js 14 — public invitation renderer only
├── packages/
│   ├── templates/                # All invitation template components (shared)
│   ├── ui/                       # Shared UI components (buttons, modals, inputs)
│   ├── config/                   # Shared Firebase, Stripe, Resend config
│   └── types/                    # Shared TypeScript interfaces
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Root package.json
```json
{
  "name": "vibeinvite",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5",
    "@types/node": "^20"
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {}
  }
}
```

---

## Tech Stack

| Layer         | Choice                                      |
|---------------|---------------------------------------------|
| Framework     | Next.js 14 (App Router, TypeScript)         |
| Styling       | Tailwind CSS + CSS variables for templates  |
| Auth          | Firebase Auth (Google + Email/Password)     |
| Database      | Firestore                                   |
| Storage       | Firebase Storage                            |
| Payments      | Stripe (one-time + subscriptions)           |
| Email         | Resend                                      |
| Hosting       | Vercel (both apps)                          |
| Package mgr   | pnpm                                        |
| Monorepo      | Turborepo                                   |
| Mobile (P2)   | Expo (React Native) — stub only for now     |

---

## packages/types — Shared TypeScript Interfaces

Create `packages/types/src/index.ts`:

```typescript
export type Plan = 'free' | 'pro';
export type PurchaseType = 'one_time' | 'subscription';
export type RsvpResponse = 'yes' | 'no' | 'maybe';
export type TemplateCategory = 'birthday' | 'wedding' | 'party' | 'corporate' | 'holiday' | 'other';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  stripeCustomerId?: string;
  plan: Plan;
  createdAt: Date;
}

export interface TemplateConfigSchema {
  fields: FieldSchema[];
  colors: ColorSchema[];
  fonts: FontSchema[];
  animations: AnimationSchema[];
}

export interface FieldSchema {
  key: string;         // e.g. "recipientName"
  label: string;       // e.g. "Recipient Name"
  type: 'text' | 'textarea' | 'date' | 'time' | 'url';
  placeholder?: string;
  maxLength?: number;
  required: boolean;
}

export interface ColorSchema {
  key: string;         // e.g. "primaryColor"
  label: string;
  default: string;     // hex value
}

export interface FontSchema {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  default: string;
}

export interface AnimationSchema {
  key: string;
  label: string;
  type: 'range';
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface InvitationConfig {
  [key: string]: string | number | boolean;
  // Dynamic — populated from TemplateConfigSchema
  // Common fields:
  // recipientName, message, date, time, venue, hostName
  // primaryColor, accentColor, paperColor, backgroundColor
  // bodyFont, displayFont
  // animationSpeed
  rsvpEnabled: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  price: number;            // in cents, 0 = free
  monthlyPrice: number;     // in cents
  componentKey: string;     // maps to React component in packages/templates
  thumbnailUrl: string;
  previewUrl?: string;      // optional video preview
  configSchema: TemplateConfigSchema;
  defaultConfig: InvitationConfig;
  isPublished: boolean;
  isPro: boolean;           // true = subscription only
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  templateId: string;
  type: PurchaseType;
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  userId: string;
  templateId: string;
  slug: string;             // unique — used in /i/[slug]
  config: InvitationConfig;
  rsvpDeadline?: Date;
  expiresAt?: Date;
  viewCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rsvp {
  id: string;
  invitationId: string;
  name: string;
  email: string;
  response: RsvpResponse;
  message?: string;
  respondedAt: Date;
}
```

---

## packages/config — Firebase, Stripe, Resend

Create `packages/config/src/firebase.ts`:

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

Create `packages/config/src/stripe.ts`:

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
```

Create `packages/config/src/resend.ts`:

```typescript
import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY!);
```

---

## packages/templates — Invitation Template Components

Each template is a self-contained React component accepting a `config` prop.

Create `packages/templates/src/types.ts`:

```typescript
import type { InvitationConfig, TemplateConfigSchema } from '@vibeinvite/types';

export interface TemplateProps {
  config: InvitationConfig;
  isPreview?: boolean;    // true = editor preview mode (no real RSVP)
  onRsvp?: (data: RsvpFormData) => Promise<void>;
}

export interface RsvpFormData {
  name: string;
  email: string;
  response: 'yes' | 'no' | 'maybe';
  message?: string;
}

export interface TemplateRegistration {
  componentKey: string;
  component: React.ComponentType<TemplateProps>;
  configSchema: TemplateConfigSchema;
  defaultConfig: InvitationConfig;
}
```

Create `packages/templates/src/registry.ts`:

```typescript
import type { TemplateRegistration } from './types';
import { EnvelopeTemplate, envelopeSchema, envelopeDefaults } from './envelope/EnvelopeTemplate';
// Import future templates here

export const templateRegistry: Record<string, TemplateRegistration> = {
  envelope: {
    componentKey: 'envelope',
    component: EnvelopeTemplate,
    configSchema: envelopeSchema,
    defaultConfig: envelopeDefaults,
  },
  // Add more templates here as you build them
};

export function getTemplate(componentKey: string): TemplateRegistration | null {
  return templateRegistry[componentKey] ?? null;
}
```

Create `packages/templates/src/envelope/EnvelopeTemplate.tsx`:

```typescript
'use client';
import React, { useState } from 'react';
import type { TemplateProps } from '../types';
import type { TemplateConfigSchema, InvitationConfig } from '@vibeinvite/types';
import './envelope.css';

export const envelopeSchema: TemplateConfigSchema = {
  fields: [
    { key: 'recipientName', label: 'Recipient Name',  type: 'text',     required: true,  placeholder: 'e.g. Sarah' },
    { key: 'hostName',      label: 'From',            type: 'text',     required: true,  placeholder: 'e.g. The Johnson Family' },
    { key: 'message',       label: 'Message',         type: 'textarea', required: true,  maxLength: 400, placeholder: 'Your heartfelt message...' },
    { key: 'date',          label: 'Event Date',      type: 'date',     required: false },
    { key: 'time',          label: 'Event Time',      type: 'time',     required: false },
    { key: 'venue',         label: 'Venue / Location',type: 'text',     required: false, placeholder: 'e.g. The Grand Hall, NYC' },
  ],
  colors: [
    { key: 'primaryColor',    label: 'Envelope Color',  default: '#FFD6C0' },
    { key: 'accentColor',     label: 'Seal Color',      default: '#B5456A' },
    { key: 'paperColor',      label: 'Paper Color',     default: '#FFFBF0' },
    { key: 'backgroundColor', label: 'Background',      default: '#fce4ec' },
  ],
  fonts: [
    {
      key: 'displayFont',
      label: 'Heading Font',
      default: 'Playfair Display',
      options: [
        { label: 'Playfair Display', value: 'Playfair Display' },
        { label: 'Dancing Script',   value: 'Dancing Script' },
        { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
      ],
    },
  ],
  animations: [
    { key: 'floatSpeed', label: 'Float Speed', type: 'range', min: 1, max: 5, step: 0.5, default: 3 },
  ],
};

export const envelopeDefaults: InvitationConfig = {
  recipientName:   'The MVP',
  hostName:        'The Whole Squad',
  message:         "Today the world is a little brighter because you are in it. You show up every day with heart, hustle, and a smile that makes everything better. May this year bring you every joy you deserve, and then some. 🎈",
  date:            '',
  time:            '',
  venue:           '',
  primaryColor:    '#FFD6C0',
  accentColor:     '#B5456A',
  paperColor:      '#FFFBF0',
  backgroundColor: '#fce4ec',
  displayFont:     'Playfair Display',
  floatSpeed:      3,
  rsvpEnabled:     true,
};

export function EnvelopeTemplate({ config, isPreview = false, onRsvp }: TemplateProps) {
  const [opened, setOpened]         = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [showRsvp, setShowRsvp]     = useState(false);

  const handleEnvelopeClick = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => setShowModal(true), 1200);
  };

  return (
    <div
      className="envelope-scene"
      style={{ '--primary': config.primaryColor, '--accent': config.accentColor,
               '--paper': config.paperColor, '--bg': config.backgroundColor } as React.CSSProperties}
    >
      {/* Envelope, animations, modal, RSVP form */}
      {/* Port the full HTML/CSS/JS from the original envelope implementation here */}
      {/* Replace hardcoded strings with config.recipientName, config.message etc. */}

      {/* RSVP Form — shown inside modal when rsvpEnabled */}
      {config.rsvpEnabled && showRsvp && !isPreview && (
        <RsvpForm onSubmit={onRsvp!} onClose={() => setShowRsvp(false)} />
      )}
    </div>
  );
}

function RsvpForm({ onSubmit, onClose }: { onSubmit: (data: any) => Promise<void>; onClose: () => void }) {
  // Implement RSVP form UI here
  return <div className="rsvp-form">{/* form fields */}</div>;
}
```

---

## apps/web — Main Next.js Application

### Environment Variables (.env.local)

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@vibeinvite.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### App Router Structure

```
apps/web/app/
├── (marketing)/
│   └── page.tsx                      # Landing page
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (app)/
│   ├── layout.tsx                    # Auth-protected layout
│   ├── dashboard/
│   │   └── page.tsx                  # User's invitations + RSVPs
│   ├── templates/
│   │   └── page.tsx                  # Marketplace
│   ├── editor/
│   │   └── [templateId]/
│   │       └── page.tsx              # Customization studio
│   └── invitations/
│       └── [invitationId]/
│           └── rsvps/page.tsx        # RSVP management
├── (admin)/
│   ├── layout.tsx                    # Admin-only guard
│   └── admin/
│       └── templates/
│           ├── page.tsx              # List templates
│           └── new/page.tsx          # Create template
├── api/
│   ├── stripe/
│   │   ├── checkout/route.ts         # Create checkout session
│   │   └── webhook/route.ts          # Handle Stripe events
│   └── rsvp/
│       └── [invitationId]/route.ts   # POST rsvp + send email
└── i/
    └── [slug]/
        └── page.tsx                  # Public invitation page (SSR)
```

---

## Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users — only the user can read/write their own doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Templates — anyone can read published ones, only admin can write
    match /templates/{templateId} {
      allow read: if resource.data.isPublished == true;
      allow write: if request.auth != null
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.plan == 'admin';
    }

    // Purchases — user can read their own
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only server-side via Admin SDK (Stripe webhook)
    }

    // Invitations — user can CRUD their own, anyone can read published ones
    match /invitations/{invitationId} {
      allow read: if resource.data.isPublished == true
                  || (request.auth != null && resource.data.userId == request.auth.uid);
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null
                             && resource.data.userId == request.auth.uid;
    }

    // RSVPs — anyone can create, only invitation owner can read
    match /rsvps/{rsvpId} {
      allow create: if true; // public can RSVP
      allow read: if request.auth != null
                  && get(/databases/$(database)/documents/invitations/$(resource.data.invitationId)).data.userId
                     == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

---

## Key API Routes

### POST /api/stripe/checkout
```typescript
// apps/web/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@vibeinvite/config/stripe';
import { auth } from '@vibeinvite/config/firebase';

export async function POST(req: NextRequest) {
  const { templateId, type, priceId, userId, userEmail } = await req.json();

  if (type === 'one_time') {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/templates`,
      metadata: { userId, templateId, type: 'one_time' },
    });
    return NextResponse.json({ url: session.url });
  }

  if (type === 'subscription') {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/templates`,
      metadata: { userId, type: 'subscription' },
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
```

### POST /api/stripe/webhook
```typescript
// apps/web/app/api/stripe/webhook/route.ts
// Handle: checkout.session.completed → write purchase to Firestore
// Handle: customer.subscription.deleted → downgrade user plan
// Always verify stripe signature before processing
```

### POST /api/rsvp/[invitationId]
```typescript
// apps/web/app/api/rsvp/[invitationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@vibeinvite/config/firebase';
import { resend } from '@vibeinvite/config/resend';
import { addDoc, collection, getDoc, doc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest, { params }: { params: { invitationId: string } }) {
  const { name, email, response, message } = await req.json();
  const { invitationId } = params;

  // 1. Write RSVP to Firestore
  await addDoc(collection(db, 'rsvps'), {
    invitationId, name, email, response,
    message: message ?? '',
    respondedAt: serverTimestamp(),
  });

  // 2. Get invitation to find creator's email
  const invitationSnap = await getDoc(doc(db, 'invitations', invitationId));
  const invitation = invitationSnap.data();
  if (!invitation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const userSnap = await getDoc(doc(db, 'users', invitation.userId));
  const creator  = userSnap.data();

  // 3. Send email to creator via Resend
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to:   creator?.email,
    subject: `${name} just RSVP'd ${response.toUpperCase()} to your invitation 🎉`,
    html: `
      <h2>${name} responded: ${response}</h2>
      <p><strong>Email:</strong> ${email}</p>
      ${message ? `<p><strong>Note:</strong> ${message}</p>` : ''}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationId}/rsvps">
        View all RSVPs
      </a>
    `,
  });

  return NextResponse.json({ success: true });
}
```

---

## Public Invitation Page (SSR)

```typescript
// apps/invitation/app/i/[slug]/page.tsx
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@vibeinvite/config/firebase';
import { getTemplate } from '@vibeinvite/templates/registry';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: { slug: string } }

async function getInvitation(slug: string) {
  const q = query(collection(db, 'invitations'), where('slug', '==', slug), where('isPublished', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
}

// Dynamic OG metadata for rich link previews
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const invitation = await getInvitation(params.slug);
  if (!invitation) return { title: 'Invitation not found' };
  return {
    title: `You're invited, ${invitation.config.recipientName}! ✨`,
    description: invitation.config.message?.slice(0, 120),
    openGraph: {
      title: `You're invited! ✨`,
      description: invitation.config.message?.slice(0, 120),
      images: [invitation.thumbnailUrl ?? '/og-default.png'],
    },
  };
}

export default async function InvitationPage({ params }: Props) {
  const invitation = await getInvitation(params.slug);
  if (!invitation) notFound();

  // Increment view count (fire-and-forget)
  // updateDoc(doc(db, 'invitations', invitation.id), { viewCount: increment(1) });

  const template = getTemplate(invitation.templateId);
  if (!template) notFound();

  const TemplateComponent = template.component;

  return (
    <TemplateComponent
      config={invitation.config}
      isPreview={false}
      onRsvp={async (data) => {
        'use server';
        // Call /api/rsvp/[invitationId] or server action here
      }}
    />
  );
}
```

---

## Slug Generator Utility

```typescript
// packages/config/src/slug.ts
import { customAlphabet } from 'nanoid';

// URL-safe, unambiguous characters
const nanoid = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 10);

export function generateSlug(): string {
  return nanoid(); // e.g. "a7k2m9p4wx"
}

// Usage: vibeinvite.com/i/a7k2m9p4wx
```

---

## Editor Page — Live Preview Architecture

The editor uses a split-pane layout:
- **Left**: config form (fields, color pickers, font selectors, animation sliders)
- **Right**: live `<TemplateComponent config={liveConfig} isPreview={true} />`

Config changes update React state → immediately re-render the preview.

```typescript
// apps/web/app/(app)/editor/[templateId]/page.tsx
'use client';
import { useState } from 'react';
import { getTemplate } from '@vibeinvite/templates/registry';
import { ConfigPanel } from '@/components/editor/ConfigPanel';
import { generateSlug } from '@vibeinvite/config/slug';

export default function EditorPage({ params }: { params: { templateId: string } }) {
  const template = getTemplate(params.templateId);
  const [config, setConfig] = useState(template!.defaultConfig);

  const handlePublish = async () => {
    const slug = generateSlug();
    // Write invitation to Firestore with slug + config
    // Redirect to /dashboard with success toast
  };

  const TemplateComponent = template!.component;

  return (
    <div className="editor-layout">
      <aside className="editor-panel">
        <ConfigPanel
          schema={template!.configSchema}
          config={config}
          onChange={(key, value) => setConfig(prev => ({ ...prev, [key]: value }))}
        />
        <button onClick={handlePublish}>Generate Link & Publish</button>
      </aside>
      <main className="editor-preview">
        <TemplateComponent config={config} isPreview={true} />
      </main>
    </div>
  );
}
```

---

## Setup Instructions for Cursor

After scaffolding, run these in order:

```bash
# 1. Install dependencies
pnpm install

# 2. Set up Firebase project
#    → Go to console.firebase.google.com
#    → Create project "vibeinvite"
#    → Enable Auth (Google + Email/Password)
#    → Create Firestore database (production mode)
#    → Enable Storage
#    → Copy config to .env.local

# 3. Deploy Firestore security rules
firebase deploy --only firestore:rules

# 4. Set up Stripe
#    → Create products in Stripe dashboard
#    → Copy secret key + webhook secret to .env.local
#    → Set up webhook endpoint: POST /api/stripe/webhook
#    → Events to listen: checkout.session.completed, customer.subscription.deleted

# 5. Set up Resend
#    → Create account at resend.com
#    → Add + verify your domain
#    → Copy API key to .env.local

# 6. Run dev
pnpm dev
```

---

## What to Build in Order (Cursor Sessions)

Work through these one session at a time:

1. **Session 1** — Monorepo scaffold, packages/types, packages/config
2. **Session 2** — Firebase Auth (login/signup pages + auth context)
3. **Session 3** — Port envelope template to EnvelopeTemplate.tsx with config prop
4. **Session 4** — Firestore service layer (CRUD for invitations, templates)
5. **Session 5** — Template marketplace page + purchase flow (Stripe checkout)
6. **Session 6** — Stripe webhook handler (write purchases to Firestore)
7. **Session 7** — Editor page (ConfigPanel + live preview)
8. **Session 8** — Publish flow (slug generation, Firestore write, copy link UI)
9. **Session 9** — apps/invitation — public /i/[slug] SSR page
10. **Session 10** — RSVP form on invitation + POST /api/rsvp + Resend email
11. **Session 11** — Dashboard (invitation list, RSVP counts, view counts)
12. **Session 12** — Admin template manager (upload, publish, configure schema)

---

## Cursor-Specific Instructions

Add these to your `.cursorrules` file at the repo root:

```
You are building VibeInvite, a digital invitation SaaS.

Rules:
- This is a pnpm Turborepo monorepo. Always use pnpm, never npm or yarn.
- Shared types live in packages/types. Never duplicate types between apps.
- Shared Firebase config lives in packages/config. Import from there, never re-initialize.
- All invitation templates live in packages/templates. Each is a React component accepting a `config: InvitationConfig` prop.
- apps/web is the main app (auth, dashboard, editor, marketplace, admin).
- apps/invitation is for public /i/[slug] routes only — keep it lean, no auth.
- Always use TypeScript strict mode. No `any` unless absolutely necessary.
- Use Tailwind for all UI in apps/. Template animations use raw CSS/CSS variables only — no Tailwind inside template components.
- All Firestore writes that involve money or permissions happen server-side via Admin SDK only (API routes). Never trust client-side writes for purchases.
- Stripe webhooks are the source of truth for purchases. Never grant access based on a successful client redirect alone.
- RSVPs are publicly writable in Firestore but rate-limit the /api/rsvp route.
- Use `nanoid` for slug generation. Slugs are 10 chars, lowercase alphanumeric.
- OG metadata is generated server-side on /i/[slug] from the invitation config.
```
