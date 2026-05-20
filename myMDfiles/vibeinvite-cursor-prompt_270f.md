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
export type UserRole = 'user' | 'admin';
export type PurchaseType = 'one_time' | 'subscription';
export type RsvpResponse = 'yes' | 'no' | 'maybe';
export type TemplateCategory = 'birthday' | 'wedding' | 'party' | 'corporate' | 'holiday' | 'other';
export type TemplateType = 'card' | 'microsite';
export type TemplatePreviewMode = 'inline' | 'iframe';
export type ConfigFieldType = 'text' | 'textarea' | 'date' | 'time' | 'url' | 'select' | 'toggle' | 'range' | 'color';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface ConfigOption {
  label: string;
  value: string;
  isPro?: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: Plan;
  role: UserRole;          // authorization role; admin is separate from billing plan
  createdAt: Date;
}

export interface TemplateConfigSchema {
  fields: FieldSchema[];
  colors: ColorSchema[];
  fonts: FontSchema[];
  animations: AnimationSchema[];
  assets?: AssetControlSchema[];      // stamps, stickers, uploads, gallery images
  sections?: SectionSchema[];         // used by future microsite templates
}

export interface FieldSchema {
  key: string;         // e.g. "recipientName"
  label: string;       // e.g. "Recipient Name"
  type: ConfigFieldType;
  placeholder?: string;
  maxLength?: number;
  options?: ConfigOption[];
  min?: number;
  max?: number;
  step?: number;
  isPro?: boolean;
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
  options: ConfigOption[];
  default: string;
  isPro?: boolean;
}

export interface AnimationSchema {
  key: string;
  label: string;
  type: 'range' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: ConfigOption[];
  default: string | number;
  isPro?: boolean;
}

export interface AssetControlSchema {
  key: string;
  label: string;
  type: 'stamp' | 'sticker' | 'image_upload' | 'gallery_upload';
  collection?: 'stampPacks' | 'stickerPacks';
  maxItems?: number;
  isPro?: boolean;
}

export interface SectionSchema {
  sectionKey: string;
  label: string;
  defaultEnabled: boolean;
  defaultOrder: number;
  fields: FieldSchema[];
}

export interface InvitationConfig {
  [key: string]: JsonValue | undefined;
  // Dynamic — populated from TemplateConfigSchema
  // Common fields:
  // recipientName, message, date, time, venue, hostName
  // primaryColor, accentColor, paperColor, backgroundColor
  // bodyFont, displayFont
  // animationSpeed
  rsvpEnabled: boolean;
}

export interface MicrositeSectionConfig {
  [key: string]: JsonValue;
  sectionKey: string;
  enabled: boolean;
  order: number;
  fields: Record<string, JsonValue>;
}

export interface MicrositeConfig extends InvitationConfig {
  sections: MicrositeSectionConfig[];
  globalFont: string;
  globalPrimaryColor: string;
  globalAccentColor: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  templateType: TemplateType;
  price: number;            // in cents, 0 = free
  monthlyPrice: number;     // in cents
  componentKey: string;     // maps to React component in packages/templates
  previewMode: TemplatePreviewMode;
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
  componentKey: string;     // registry key used to render the template component
  templateType: TemplateType;
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
  fields?: Record<string, JsonValue>; // future full RSVP fields: meal, +1, song request, etc.
  respondedAt: Date;
}

export interface Stamp {
  key: string;
  label: string;
  svgKey: string;
  packId: string;
}

export interface StampPack {
  id: string;
  name: string;
  category: 'seasonal' | 'occasions' | 'greetings' | 'cultural' | 'fun';
  thumbnailUrl: string;
  isPro: boolean;
  stamps: Stamp[];
  createdAt: Date;
}

export interface StickerPack {
  id: string;
  name: string;
  category: StampPack['category'];
  thumbnailUrl: string;
  isPro: boolean;
  stickers: Stamp[];
  createdAt: Date;
}
```

---

## packages/config — Firebase, Stripe, Resend

Create `packages/config/src/firebase-client.ts` for browser/client usage:

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

Create `packages/config/src/firebase-admin.ts` for server-only privileged usage:

```typescript
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export default adminApp;
```

Only import `firebase-admin.ts` from server components, route handlers, server actions, or scripts. Do not import it into client components.

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
import type { InvitationConfig, TemplateConfigSchema, TemplatePreviewMode, TemplateType } from '@vibeinvite/types';

export interface TemplateProps {
  config: InvitationConfig;
  isPreview?: boolean;    // true = editor preview mode (no real RSVP)
  renderMode?: 'editor' | 'public';
  onRsvp?: (data: RsvpFormData) => Promise<void>;
}

export interface RsvpFormData {
  name: string;
  email: string;
  response: 'yes' | 'no' | 'maybe';
  message?: string;
  fields?: Record<string, unknown>;
}

export interface TemplateRegistration {
  componentKey: string;
  templateType: TemplateType;
  previewMode: TemplatePreviewMode; // card templates render inline; GSAP microsites use iframe preview in editor
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
    templateType: 'card',
    previewMode: 'inline',
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
import type { RsvpFormData, TemplateProps } from '../types';
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
    {
      key: 'entranceAnimation',
      label: 'Entrance Animation',
      type: 'select',
      default: 'float',
      options: [
        { label: 'Float', value: 'float' },
        { label: 'Drop', value: 'drop' },
        { label: 'Slide Left', value: 'slide_left', isPro: true },
        { label: 'Slide Right', value: 'slide_right', isPro: true },
        { label: 'Spin Drop', value: 'spin_drop', isPro: true },
        { label: 'Typewriter', value: 'typewriter', isPro: true },
      ],
    },
    { key: 'floatSpeed', label: 'Float Speed', type: 'range', min: 1, max: 5, step: 0.5, default: 3 },
  ],
  assets: [
    { key: 'stampKey', label: 'Stamp', type: 'stamp', collection: 'stampPacks' },
    { key: 'stickerSlots', label: 'Stickers', type: 'sticker', collection: 'stickerPacks', isPro: true },
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
  entranceAnimation: 'float',
  floatSpeed:      3,
  envelopeShape:   'classic',
  paperTexture:    'plain',
  stampKey:        'default_heart',
  stickerSlots: {
    envelopeTopLeft: null,
    envelopeBottomRight: null,
    letterTopRight: null,
    letterBottomLeft: null,
  },
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

  const entranceAnimation = typeof config.entranceAnimation === 'string' ? config.entranceAnimation : 'float';
  const primaryColor = typeof config.primaryColor === 'string' ? config.primaryColor : '#FFD6C0';
  const accentColor = typeof config.accentColor === 'string' ? config.accentColor : '#B5456A';
  const paperColor = typeof config.paperColor === 'string' ? config.paperColor : '#FFFBF0';
  const backgroundColor = typeof config.backgroundColor === 'string' ? config.backgroundColor : '#fce4ec';

  return (
    <div
      className={`envelope-scene envelope-${entranceAnimation}`}
      style={{ '--primary': primaryColor, '--accent': accentColor,
               '--paper': paperColor, '--bg': backgroundColor } as React.CSSProperties}
    >
      {/* Envelope, animations, modal, RSVP form */}
      {/* Port the full HTML/CSS/JS from the original envelope implementation here */}
      {/* Replace hardcoded strings with config.recipientName, config.message etc. */}
      {/* Keep envelope shape and stamp rendering behind small sub-components:
          ClassicEnvelope, SquareEnvelope, VintageEnvelope, ModernEnvelope, StampRenderer. */}

      {/* RSVP Form — shown inside modal when rsvpEnabled */}
      {config.rsvpEnabled && showRsvp && !isPreview && (
        <RsvpForm onSubmit={onRsvp!} onClose={() => setShowRsvp(false)} />
      )}
    </div>
  );
}

function RsvpForm({ onSubmit, onClose }: { onSubmit: (data: RsvpFormData) => Promise<void>; onClose: () => void }) {
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
NEXT_PUBLIC_WEB_APP_URL=http://localhost:3000
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
```

Keep public invitation rendering in the dedicated `apps/invitation` app only:

```
apps/invitation/app/
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
    function signedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return signedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users — users can manage profile fields only; role/plan/billing fields are server-owned
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId)
                    && request.resource.data.keys().hasOnly([
                      'uid', 'email', 'displayName', 'photoURL', 'plan', 'role', 'createdAt'
                    ])
                    && request.resource.data.uid == userId
                    && request.resource.data.role == 'user'
                    && request.resource.data.plan == 'free';
      allow update: if isOwner(userId)
                    && request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['displayName', 'photoURL']);
      allow delete: if false;
    }

    // Templates — anyone can read published ones, only admin can write
    match /templates/{templateId} {
      allow read: if resource.data.isPublished == true;
      allow write: if isAdmin();
    }

    // Decorative asset packs — public can read published/free metadata, admin manages packs
    match /stampPacks/{packId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /stickerPacks/{packId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Purchases — user can read their own
    match /purchases/{purchaseId} {
      allow read: if signedIn() && resource.data.userId == request.auth.uid;
      allow write: if false; // Only server-side via Admin SDK (Stripe webhook)
    }

    // Invitations — user can CRUD their own, anyone can read published ones
    match /invitations/{invitationId} {
      allow read: if resource.data.isPublished == true
                  || (signedIn() && resource.data.userId == request.auth.uid);
      allow create: if signedIn()
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if signedIn()
                             && resource.data.userId == request.auth.uid;
    }

    // RSVPs — public submissions go through /api/rsvp/[invitationId].
    // The route validates, rate-limits, writes with Admin SDK, and sends email.
    match /rsvps/{rsvpId} {
      allow create: if false;
      allow read: if signedIn()
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
import { adminAuth } from '@vibeinvite/config/firebase-admin';
import { stripe } from '@vibeinvite/config/stripe';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { uid, email } = await adminAuth.verifyIdToken(token);
  const { templateId, type, priceId } = await req.json();

  // Validate type, priceId, templateId, and user entitlement server-side before checkout.
  if (!['one_time', 'subscription'].includes(type) || !priceId) {
    return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 });
  }

  if (type === 'one_time') {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/templates`,
      metadata: { userId: uid, templateId, type: 'one_time' },
    });
    return NextResponse.json({ url: session.url });
  }

  if (type === 'subscription') {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/templates`,
      metadata: { userId: uid, type: 'subscription' },
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
```

### POST /api/stripe/webhook
```typescript
// apps/web/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@vibeinvite/config/firebase-admin';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@vibeinvite/config/stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency: Stripe may retry events, so record processed event ids.
  const eventRef = adminDb.collection('processedStripeEvents').doc(event.id);
  const eventSnap = await eventRef.get();
  if (eventSnap.exists) return NextResponse.json({ received: true });

  await adminDb.runTransaction(async (tx) => {
    const existing = await tx.get(eventRef);
    if (existing.exists) return;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, templateId, type } = session.metadata ?? {};

      if (type === 'one_time' && userId && templateId) {
        const purchaseRef = adminDb.collection('purchases').doc(session.id);
        tx.set(purchaseRef, {
          userId,
          templateId,
          type: 'one_time',
          stripePaymentIntentId: session.payment_intent,
          createdAt: new Date(),
        });
      }

      if (type === 'subscription' && userId) {
        tx.update(adminDb.collection('users').doc(userId), {
          plan: 'pro',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const usersSnap = await tx.get(
        adminDb
          .collection('users')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
      );

      if (!usersSnap.empty) {
        tx.update(usersSnap.docs[0].ref, {
          plan: 'free',
          stripeSubscriptionId: null,
        });
      }
    }

    tx.set(eventRef, { processedAt: new Date(), type: event.type });
  });

  return NextResponse.json({ received: true });
}
```

### POST /api/rsvp/[invitationId]
```typescript
// apps/web/app/api/rsvp/[invitationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@vibeinvite/config/firebase-admin';
import { resend } from '@vibeinvite/config/resend';

const VALID_RESPONSES = new Set(['yes', 'no', 'maybe']);

async function rateLimit(req: NextRequest, invitationId: string) {
  // Implement with a durable store such as Upstash Redis, Vercel KV, or Firestore counters.
  // Key by invitationId + IP hash + email hash; return false when the limit is exceeded.
  return true;
}

export async function POST(req: NextRequest, { params }: { params: { invitationId: string } }) {
  const { name, email, response, message } = await req.json();
  const { invitationId } = params;

  if (!name || !email || !VALID_RESPONSES.has(response)) {
    return NextResponse.json({ error: 'Invalid RSVP' }, { status: 400 });
  }

  if (!(await rateLimit(req, invitationId))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 1. Get invitation first; only published invitations can receive RSVPs.
  const invitationSnap = await adminDb.collection('invitations').doc(invitationId).get();
  const invitation = invitationSnap.data();
  if (!invitation || invitation.isPublished !== true) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (invitation.rsvpDeadline?.toDate?.() && invitation.rsvpDeadline.toDate() < new Date()) {
    return NextResponse.json({ error: 'RSVP deadline has passed' }, { status: 400 });
  }

  // 2. Write RSVP using Admin SDK; public clients cannot write directly to Firestore.
  await adminDb.collection('rsvps').add({
    invitationId, name, email, response,
    message: message ?? '',
    respondedAt: new Date(),
  });

  const userSnap = await adminDb.collection('users').doc(invitation.userId).get();
  const creator  = userSnap.data();
  if (!creator?.email) return NextResponse.json({ success: true });

  // 3. Send email to creator via Resend
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to:   creator?.email,
    subject: `${name} just RSVP'd ${response.toUpperCase()} to your invitation`,
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
import { adminDb } from '@vibeinvite/config/firebase-admin';
import { getTemplate } from '@vibeinvite/templates/registry';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: { slug: string } }

async function getInvitation(slug: string) {
  const snap = await adminDb
    .collection('invitations')
    .where('slug', '==', slug)
    .where('isPublished', '==', true)
    .limit(1)
    .get();

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
  // adminDb.collection('invitations').doc(invitation.id).update({ viewCount: FieldValue.increment(1) });

  const template = getTemplate(invitation.componentKey);
  if (!template) notFound();

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
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error('Unable to submit RSVP');
        }}
      />
    </main>
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
- **Right**: inline preview for card templates, iframe preview for microsite templates

Config changes update React state → immediately re-render the card preview. Microsite templates should use a scaled iframe preview route so GSAP/ScrollTrigger never enter the main editor bundle.

```typescript
// apps/web/app/(app)/editor/[templateId]/page.tsx
'use client';
import { useState } from 'react';
import { getTemplate } from '@vibeinvite/templates/registry';
import { ConfigPanel } from '@/components/editor/ConfigPanel';
import { generateSlug } from '@vibeinvite/config/slug';

export default function EditorPage({ params }: { params: { templateId: string } }) {
  // Fetch the Firestore template record by params.templateId, then use its componentKey.
  // Do not assume the Firestore template id is the same as the registry componentKey.
  const templateRecord = { id: params.templateId, componentKey: 'envelope' };
  const template = getTemplate(templateRecord.componentKey);
  const [config, setConfig] = useState(template!.defaultConfig);

  const handlePublish = async () => {
    const slug = generateSlug();
    // Validate config against template.configSchema before writing.
    // Write invitation to Firestore with slug, templateId, componentKey, and config.
    // Redirect to /dashboard with success toast
  };

  const TemplateComponent = template!.component;
  const useIframePreview = template!.previewMode === 'iframe';

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
        {useIframePreview ? (
          <iframe
            title="Invitation preview"
            src={`/i/preview/${templateRecord.id}`}
            className="editor-preview-frame"
          />
        ) : (
          <TemplateComponent config={config} isPreview={true} renderMode="editor" />
        )}
      </main>
    </div>
  );
}
```

Before publishing or saving template metadata, validate `config` against the template's `TemplateConfigSchema`:

- Required fields must be present and non-empty.
- Field values must match the declared type.
- Colors must be valid hex values.
- Font values must be one of the schema options.
- Animation values must stay within min/max/step.
- Unknown config keys should be rejected unless explicitly allowed.

Run this validation server-side in the publish API/server action even if the editor already validates on the client.

---

## Future-Ready Architecture for v1.1 Features

The v1.1 feature request in `myMDfiles/vibeinvite-v1.1-feature-request_d9bf.md` adds advanced card customisation, decorative asset packs, and premium microsite templates. Build v1.0 with these seams now so v1.1 is additive instead of a rewrite:

### Template model
- Store `templateType: 'card' | 'microsite'` on every template and invitation.
- Store `componentKey` separately from Firestore template id.
- Store `previewMode: 'inline' | 'iframe'` in the template registry.
- Use `TemplateConfigSchema` as the single source for editor controls, entitlement gates, validation, and defaults.

### Config schema
- Support `select`, `toggle`, `range`, `color`, asset controls, and section schemas from the start.
- Allow object/array config values through `JsonValue` so stickers, galleries, and microsite sections fit the same `InvitationConfig`.
- Add `isPro` flags to schema controls/options instead of hardcoding tier logic into UI components.
- Validate config on the server against schema before publish and before paid template saves.

### Card customization
- Keep envelope geometry behind sub-components such as `ClassicEnvelope`, `SquareEnvelope`, `VintageEnvelope`, and `ModernEnvelope`.
- Keep envelope open/close behavior in a shared `useEnvelopeAnimation` hook so shape variants can reuse it.
- Treat stamps and stickers as renderer registries keyed by `svgKey`; Firestore stores pack metadata and unlock state, not raw SVG code.
- Implement paper textures and entrance animations as CSS classes/keyframes inside `packages/templates`; avoid JS animation libraries for card templates.

### Microsites
- Premium microsites render through the same `/i/[slug]` public route but branch by `templateType`.
- GSAP and ScrollTrigger belong only inside microsite components in `packages/templates`.
- The editor should preview microsites through an iframe/preview route, not by importing GSAP into `apps/web`.
- Model microsite sections as reorderable `MicrositeSectionConfig[]` records so hero/countdown/story/gallery/RSVP/travel sections can be toggled and reordered later.

### Entitlements and pricing
- Keep monthly plan access (`plan: 'free' | 'pro'`) separate from one-time purchases.
- Use purchases to unlock premium microsite templates permanently.
- Evaluate feature access through a central entitlement helper that accepts user, template, purchases, and schema option metadata.
- Stripe webhooks remain the source of truth for both subscription plan changes and premium template purchases.

### Storage
- Add Firebase Storage rules when photo uploads are introduced.
- Store uploaded microsite/gallery assets under owner-scoped paths such as `users/{userId}/invitations/{invitationId}/...`.
- Persist only metadata and storage paths in Firestore; never store large image payloads in invitation config.

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
4. **Session 4** — Firestore service layer, Admin SDK helpers, and security rules
5. **Session 5** — Template marketplace page + purchase flow (Stripe checkout)
6. **Session 6** — Stripe webhook handler (signature verification, idempotency, purchases)
7. **Session 7** — Editor page (ConfigPanel + live preview + config validation)
8. **Session 8** — Publish flow (slug generation, validated Firestore write, copy link UI)
9. **Session 9** — apps/invitation — public /i/[slug] SSR page
10. **Session 10** — RSVP form on invitation + rate-limited POST /api/rsvp + Resend email
11. **Session 11** — Dashboard (invitation list, RSVP counts, view counts)
12. **Session 12** — Admin template manager (upload, publish, configure schema)

After v1.0 ships, continue with the v1.1 feature request:

13. **Session 13** — Stamp pack Firestore collection + SVG stamp registry
14. **Session 14** — Envelope shape variants using shared envelope animation hook
15. **Session 15** — Entrance animation system using CSS keyframes
16. **Session 16** — Paper textures + curated font pairing system
17. **Session 17** — Sticker system phase 1 with fixed positions
18. **Session 18** — Microsite renderer branch for `templateType: 'microsite'`
19. **Session 19** — "Eternal" wedding microsite hero/countdown/event details
20. **Session 20** — "Eternal" story/gallery with Firebase Storage upload flow
21. **Session 21** — "Eternal" full RSVP, registry, travel, and footer sections
22. **Session 22** — GSAP ScrollTrigger integration isolated to templates package
23. **Session 23** — Microsite editor support: section toggle, reorder, iframe preview

---

## Cursor-Specific Instructions

Add these to your `.cursorrules` file at the repo root:

```
You are building VibeInvite, a digital invitation SaaS.

Rules:
- This is a pnpm Turborepo monorepo. Always use pnpm, never npm or yarn.
- Shared types live in packages/types. Never duplicate types between apps.
- Shared Firebase config lives in packages/config. Use firebase-client.ts for browser code and firebase-admin.ts for server-only privileged code.
- All invitation templates live in packages/templates. Each is a React component accepting a `config: InvitationConfig` prop.
- Invitations store both `templateId` and `componentKey`; render templates with `componentKey`, never by assuming template id equals registry key.
- Templates and invitations include `templateType`; card and microsite templates share routing but can render differently.
- Config schemas must support future select/toggle/range/color/asset/section controls and object/array config values.
- apps/web is the main app (auth, dashboard, editor, marketplace, admin).
- apps/invitation is for public /i/[slug] routes only — keep it lean, no auth.
- Always use TypeScript strict mode. No `any` unless absolutely necessary.
- Use Tailwind for all UI in apps/. Template animations use raw CSS/CSS variables only — no Tailwind inside template components.
- GSAP/ScrollTrigger is allowed only in microsite templates inside packages/templates; editor previews microsites through iframe routes.
- All Firestore writes that involve money or permissions happen server-side via Admin SDK only (API routes). Never trust client-side writes for purchases.
- Stripe webhooks are the source of truth for purchases. Verify signatures, process events idempotently, and never grant access based on a successful client redirect alone.
- Keep subscription plan entitlements separate from one-time premium template purchases.
- RSVPs are not publicly writable in Firestore. Public submissions must go through the validated and rate-limited /api/rsvp route.
- Validate invitation config against the template schema server-side before publishing.
- Store uploaded image/video files in Firebase Storage under owner-scoped paths and keep only metadata/storage paths in Firestore.
- Use `nanoid` for slug generation. Slugs are 10 chars, lowercase alphanumeric.
- OG metadata is generated server-side on /i/[slug] from the invitation config.
```
