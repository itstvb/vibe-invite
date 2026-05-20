# VibeInvite — v1.1 Feature Request

> Built on top of the v1.0 boilerplate. These features extend the core invitation experience with deeper customisation, a monetisation layer, and premium microsite templates for grand occasions.

---

## 1. Envelope Customisation

### 1.1 Incoming Animation Options
Each envelope template exposes an `entranceAnimation` config field.

**Available options:**
| Key | Description |
|-----|-------------|
| `float` | Default — gentle float in from center (current behaviour) |
| `drop` | Falls from top of viewport with a soft bounce landing |
| `slide_left` | Slides in from the left edge |
| `slide_right` | Slides in from the right edge |
| `spin_drop` | Rotates 360° while dropping in, settles flat |
| `typewriter` | Envelope fades in while a "writing" sound/animation plays |

**Implementation note:** Each animation is a named CSS `@keyframes` block. The `entranceAnimation` value maps to a CSS class applied on mount. No JS animation library needed for card templates.

**Schema addition:**
```typescript
// Add to envelopeSchema animations array
{
  key: 'entranceAnimation',
  label: 'Entrance Animation',
  type: 'select',
  options: ['float','drop','slide_left','slide_right','spin_drop','typewriter'],
  default: 'float',
}
```

---

### 1.2 Envelope Color + Shape Variants

**Color:**
- Free tier: 6 preset pastel swatches
- Pro tier: full color picker + custom hex input

**Shape variants** (each is a distinct CSS/SVG geometry):

| Key | Description |
|-----|-------------|
| `classic` | Standard rectangular with V-flap (current) |
| `square` | Square format, diagonal flap |
| `vintage` | Wide format, deep pointed flap |
| `modern` | Slim landscape, straight horizontal flap |

**Implementation note:** Each shape variant is a separate React sub-component (`ClassicEnvelope`, `SquareEnvelope`, etc.) rendered conditionally based on `envelopeShape` config value. All shapes share the same open/close animation logic via a shared hook `useEnvelopeAnimation`.

**Schema addition:**
```typescript
{
  key: 'envelopeShape',
  label: 'Envelope Shape',
  type: 'select',
  options: ['classic', 'square', 'vintage', 'modern'],
  default: 'classic',
}
```

---

### 1.3 Stamp Packs

Stamps are SVG components organised into themed packs. Stored in Firestore as a `stampPacks` collection.

**Firestore structure:**
```
stampPacks/{packId}
  ├── name             e.g. "Holiday Magic"
  ├── category         e.g. "seasonal"
  ├── thumbnailUrl
  ├── isPro            boolean
  ├── stamps[]
  │     ├── key        e.g. "christmas_tree"
  │     ├── label      e.g. "Christmas Tree"
  │     └── svgKey     maps to SVG in packages/templates/src/stamps/
  └── createdAt
```

**Stamp pack categories:**

| Category | Example Packs |
|----------|---------------|
| Seasonal | Christmas, Halloween, Easter, New Year |
| Occasions | Birthday, Wedding, Baby Shower, Graduation |
| Greetings | Thank You, Miss You, Just Because |
| Cultural | Eid, Diwali, Hanukkah, Lunar New Year |
| Fun | Retro, Space, Animals, Food |

**Free tier:** 1 default pack (5 stamps)
**Pro tier:** All packs unlocked

**Implementation note:** Stamps are inline SVG React components in `packages/templates/src/stamps/`. The `stampKey` config value maps to the correct component. Each stamp replaces the wax seal position on the envelope.

---

### 1.4 Paper Color + Texture

**Color:** Free picker with curated swatches (cream, white, blush, mint, lavender, kraft).

**Textures** (CSS `background-image` patterns or SVG overlays):

| Key | Description |
|-----|-------------|
| `plain` | Solid color, no texture (default) |
| `lined` | Horizontal ruled lines |
| `grid` | Light grid pattern |
| `dotted` | Dot grid |
| `linen` | Linen weave texture |
| `kraft` | Kraft paper grain |
| `aged` | Slightly yellowed with subtle noise |

**Implementation note:** Textures are CSS classes applied to the paper element. Each class uses `background-image` with either a repeating SVG pattern or a CSS gradient trick. No image assets required.

**Free tier:** `plain`, `lined`
**Pro tier:** All textures

---

### 1.5 Font + Color Options

**Font pairings** (curated, not free-for-all):

| Key | Display Font | Body Font | Vibe |
|-----|-------------|-----------|------|
| `classic_serif` | Playfair Display | Quicksand | Elegant |
| `handwritten` | Dancing Script | Lato | Personal |
| `modern_editorial` | Cormorant Garamond | DM Sans | Refined |
| `playful` | Fredoka One | Nunito | Fun |
| `bold_statement` | Bebas Neue | Source Sans Pro | Dramatic |
| `vintage_press` | Libre Baskerville | Crimson Text | Nostalgic |

**Color options:**
- Message text color
- Heading/name color
- Accent / highlight color
- Background color

**Free tier:** 3 font pairings, preset color swatches
**Pro tier:** All pairings, full color picker

---

### 1.6 Stickers

Decorative stickers placeable on the envelope exterior and the letter interior.

**Phase 1 (v1.1) — Fixed positions:**
```
Envelope positions: top-left corner, bottom-right corner, back-flap center
Letter positions:   top-right corner, bottom-left corner, beside signature
```

**Phase 2 (v1.2) — Free drag-and-drop:**
- Canvas-style editor
- Sticker `x, y, rotation, scale` stored in config as an array
- Requires a lightweight drag library (e.g. `@use-gesture/react`)

**Sticker packs** mirror stamp pack structure — same categories, same free/pro split.

**Config structure (Phase 1):**
```typescript
stickerSlots: {
  envelopeTopLeft:     string | null,  // sticker key or null
  envelopeBottomRight: string | null,
  letterTopRight:      string | null,
  letterBottomLeft:    string | null,
}
```

---

## 2. Premium Microsite Templates

Full one-page immersive websites rendered at `/i/[slug]`. Targets grand occasions — weddings, milestone birthdays, anniversaries, galas.

### 3.1 Template Type Distinction

```typescript
export type TemplateType = 'card' | 'microsite';
```

| | Card Template | Microsite Template |
|---|---|---|
| Renders in | Modal popup | Full viewport |
| Scroll | None | GSAP ScrollTrigger |
| Sections | Single | Multiple (user configurable) |
| Animation lib | CSS only | GSAP + ScrollTrigger |
| Price | Free / Pro | One-time $19–$49 |
| Photo uploads | No | Yes (Firebase Storage) |

**Routing logic in `/i/[slug]`:**
```typescript
if (template.type === 'microsite') {
  // render full page, no envelope wrapper
} else {
  // render card with envelope + modal
}
```

---

### 3.2 Available Sections (Microsite)

Each section is a toggleable, reorderable React component. User configures which sections appear via the editor.

| Section Key | Description | Fields |
|-------------|-------------|--------|
| `hero` | Full-bleed opener, names + date, animated entrance | names, date, tagline, background image/video |
| `countdown` | Live timer to event day | event datetime |
| `our_story` | Scrollable timeline | timeline items (date, title, body, photo) |
| `event_details` | Ceremony + reception info cards | venue name, address, time, map embed |
| `gallery` | Photo grid with lightbox | uploaded photos (Firebase Storage) |
| `rsvp` | Full RSVP form | meal preference, +1, song request, dietary notes |
| `registry` | Registry links | link label + URL pairs |
| `travel` | Hotel blocks + travel tips | hotel name, link, promo code, notes |
| `footer` | Closing message + social links | message, optional social handles |

**Config structure:**
```typescript
interface MicrositeSectionConfig {
  sectionKey: string;
  enabled: boolean;
  order: number;
  fields: Record<string, any>;  // section-specific field values
}

// Microsite InvitationConfig extends base:
interface MicrositeConfig extends InvitationConfig {
  sections: MicrositeSectionConfig[];
  globalFont: string;
  globalPrimaryColor: string;
  globalAccentColor: string;
}
```

---

### 3.3 GSAP Implementation Notes

- GSAP + ScrollTrigger lives in `packages/templates` only
- Never import GSAP into `apps/web` (editor shows static preview)
- In the editor, microsite preview uses a scaled iframe pointing to the live `/i/preview/[templateId]` route — this avoids loading GSAP in the editor bundle
- ScrollTrigger must call `ScrollTrigger.refresh()` after fonts + images load
- Use `gsap.context()` for cleanup in `useEffect` return

```typescript
// packages/templates/src/wedding/WeddingMicrosite.tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.hero-title', { opacity: 0, y: 60, duration: 1.2, ease: 'power3.out' });
    ScrollTrigger.create({ ... });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

---

### 3.4 First Premium Microsite — "Eternal" (Wedding)

The first microsite template to build. Aesthetic: luxury, soft, timeless.

**Sections included by default:** Hero → Countdown → Our Story → Event Details → Gallery → RSVP → Registry → Travel → Footer

**Design direction:**
- Palette: ivory, champagne, dusty rose, deep sage
- Fonts: Cormorant Garamond (display) + DM Sans (body)
- Animations: slow cinematic fades, parallax hero, staggered section reveals on scroll
- Full-bleed hero with couple photo or video loop background
- Floating botanical SVG elements between sections

**Pricing:** $39 one-time

---

## 3. Updated Tier Structure

```
┌─────────────────────────────────────────────────────────┐
│  FREE                                                   │
│  • 3 invitations / month                                │
│  • 1 card template (envelope classic)                   │
│  • 2 entrance animations (float, drop)                  │
│  • 1 envelope shape (classic)                           │
│  • 1 stamp pack (5 stamps)                              │
│  • Plain + lined paper textures                         │
│  • 3 font pairings                                      │
│  • Preset color swatches only                           │
│  • Fixed sticker positions (Phase 1)                    │
│  • Basic RSVP (name + yes/no)                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PRO  — $9 / month                                      │
│  • Unlimited invitations                                │
│  • All card templates                                   │
│  • All entrance animations                              │
│  • All envelope shapes + full color picker              │
│  • All stamp packs                                      │
│  • All paper textures                                   │
│  • All font pairings + full color picker                │
│  • All sticker packs                                    │
│  • Full RSVP (meal pref, +1, song request)              │
│  • RSVP management dashboard                            │
│  • Invitation analytics (views, RSVP rate)              │
│  • Custom expiry dates                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PREMIUM TEMPLATES  — one-time purchase                 │
│  • Full microsite (wedding, milestone birthday etc.)    │
│  • GSAP + ScrollTrigger animations                      │
│  • Multi-section: story, gallery, RSVP, travel etc.     │
│  • Photo uploads via Firebase Storage                   │
│  • Buy once, reuse forever                              │
│  • Pricing: $19 – $49 per template                      │
└─────────────────────────────────────────────────────────┘

```

---

## 4. Schema Changes Required in Boilerplate

The following additions are needed in `packages/types/src/index.ts`:

```typescript
// Add to Template interface
type TemplateType = 'card' | 'microsite';
templateType: TemplateType;

// New collections
StampPack { id, name, category, isPro, stamps[], createdAt }
Stamp     { key, label, svgKey, packId }

// Add to FieldSchema type options
type: 'text' | 'textarea' | 'date' | 'time' | 'url' | 'select' | 'toggle' | 'range'

// Microsite-specific
MicrositeSectionConfig { sectionKey, enabled, order, fields }
MicrositeConfig extends InvitationConfig { sections, globalFont, globalPrimaryColor, globalAccentColor }
```

---

## 5. Build Order (v1.1 Sessions)

Continue from Session 12 of the v1.0 boilerplate:

| Session | Feature |
|---------|---------|
| 13 | Stamp pack Firestore collection + SVG stamp components |
| 14 | Envelope shape variants (classic, square, vintage, modern) |
| 15 | Entrance animation system (6 animations as CSS keyframes) |
| 16 | Paper textures + font pairings system |
| 17 | Sticker system — Phase 1 fixed positions |
| 18 | Microsite renderer — `/i/[slug]` full-page mode for type: microsite |
| 19 | "Eternal" wedding microsite — Hero + Countdown + Event Details sections |
| 20 | "Eternal" — Our Story + Gallery sections (Firebase Storage upload) |
| 21 | "Eternal" — full RSVP + Registry + Travel + Footer sections |
| 22 | GSAP ScrollTrigger integration + animation polish |
| 23 | Editor support for microsite — section toggle, reorder, iframe preview |
