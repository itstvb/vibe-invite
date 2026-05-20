# VibeInvite Execution Plan

This plan combines the v1.0 boilerplate prompt with the v1.1 future feature request. The goal is to ship the first useful product while designing the core data model, template registry, editor, entitlement checks, and public renderer so v1.1 features can be added without rewrites.

---

## Guiding Architecture Decisions

1. **Template identity is explicit**
   - Firestore template id is data identity.
   - `componentKey` is React renderer identity.
   - `templateType` determines card vs microsite behavior.
   - `previewMode` determines inline vs iframe editor preview.

2. **Config is schema-driven**
   - Editor controls, default config, server validation, free/pro gating, and future microsite sections all come from `TemplateConfigSchema`.
   - Support primitive, object, and array config values from v1.0 so sticker slots, gallery uploads, and microsite sections fit later.

3. **Entitlements are centralized**
   - `plan` controls subscription features.
   - `purchases` controls one-time premium templates.
   - UI and API routes call a shared entitlement helper instead of scattering tier checks.

4. **Public rendering stays isolated**
   - `apps/invitation` owns `/i/[slug]`.
   - `apps/web` owns auth, editor, dashboard, marketplace, admin, and APIs.
   - GSAP/ScrollTrigger is only allowed in microsite template components and iframe previews.

5. **Server owns sensitive writes**
   - Stripe, purchases, subscription changes, RSVP writes, uploads metadata, and admin template changes go through server/Admin SDK paths.

---

## V1.0 Build Plan

### Phase 1: Monorepo Foundation

- Create pnpm + Turborepo workspace.
- Add `apps/web`, `apps/invitation`, `packages/types`, `packages/config`, `packages/templates`, `packages/ui`.
- Configure strict TypeScript, linting, Tailwind, and package exports.

**Future-ready checkpoint:** shared packages must be importable from both apps without creating circular dependencies.

### Phase 2: Shared Types and Config

- Implement expanded shared types:
  - `TemplateType`
  - `TemplatePreviewMode`
  - `JsonValue`
  - schema controls for select/toggle/range/color/assets/sections
  - `MicrositeSectionConfig`
  - `StampPack` / `StickerPack`
- Split Firebase client and Firebase Admin config.
- Add Stripe, Resend, and slug helpers.

**Future-ready checkpoint:** `InvitationConfig` must support nested objects/arrays so stickers and microsite sections can be added without a migration.

### Phase 3: Auth and User Model

- Build login/signup with Firebase Auth.
- Create user docs with:
  - `plan: 'free'`
  - `role: 'user'`
  - billing fields controlled only by server.
- Protect dashboard/app routes.

**Future-ready checkpoint:** role and billing fields must not be user-editable from Firestore client rules.

### Phase 4: Template Registry and Envelope Card

- Build `TemplateRegistration` with:
  - `componentKey`
  - `templateType`
  - `previewMode`
  - `configSchema`
  - `defaultConfig`
- Implement the envelope template with config-driven text, colors, font, animation, and RSVP behavior.
- Keep envelope shape, stamp, and animation logic behind small subcomponents/hooks.

**Future-ready checkpoint:** do not hardcode the classic envelope geometry directly into business/editor logic.

### Phase 5: Firestore Services, Rules, and Entitlements

- Add service layer for users, templates, invitations, purchases, RSVPs, stamp packs, and sticker packs.
- Add Firestore rules for owner/admin/public boundaries.
- Add central entitlement helper.

**Future-ready checkpoint:** feature gates should support both schema option `isPro` and one-time purchased premium templates.

### Phase 6: Marketplace and Stripe

- Build marketplace listing published templates.
- Implement server-verified checkout session creation.
- Implement Stripe webhook with signature verification and idempotent event processing.
- Persist purchases and subscription changes via Admin SDK.

**Future-ready checkpoint:** premium microsites should fit existing purchase records; avoid separate purchase systems.

### Phase 7: Editor and Publish Flow

- Build dynamic `ConfigPanel` from schema.
- Inline preview card templates.
- Iframe preview templates with `previewMode: 'iframe'`.
- Validate config server-side before publish.
- Store invitation with `templateId`, `componentKey`, `templateType`, `slug`, and `config`.

**Future-ready checkpoint:** editor layout should already support section controls and asset controls even if v1.0 only uses basic fields.

### Phase 8: Public Invitation Renderer

- Render `/i/[slug]` in `apps/invitation`.
- Fetch published invitation by slug.
- Resolve renderer by `componentKey`.
- Branch layout by `templateType`.
- Generate OG metadata.

**Future-ready checkpoint:** card and microsite templates should share the route but not share layout assumptions.

### Phase 9: RSVP and Dashboard

- Route RSVP submissions through `/api/rsvp/[invitationId]`.
- Validate and rate-limit submissions.
- Send creator email via Resend.
- Build dashboard invitation list, view counts, RSVP counts, and RSVP details.

**Future-ready checkpoint:** RSVP payload should support extra fields for future meal preference, +1, song request, and dietary notes.

### Phase 10: Admin Template Management

- Admin-only template list/create/edit pages.
- Upload/manage template thumbnails.
- Publish/unpublish templates.
- Manage component keys and schema metadata.

**Future-ready checkpoint:** admin schema tooling should not assume all templates are single-card templates.

---

## V1.1 Readiness Work to Include During V1.0

- Add `stampPacks` and `stickerPacks` collections early, even if seeded with one free pack.
- Use CSS class names for card entrance animations from the beginning.
- Keep envelope open/close state in a reusable hook.
- Store paper texture and envelope shape in config defaults, even if only `plain` and `classic` render first.
- Build the editor control renderer with extensible control types.
- Keep upload metadata separate from uploaded files; store files under owner-scoped Firebase Storage paths.
- Keep GSAP out of `apps/web` by using iframe preview for future microsites.

---

## V1.1 Follow-up Build Order

1. Stamp pack Firestore collection and SVG stamp registry.
2. Envelope shape variants.
3. Entrance animation system.
4. Paper textures and font pairings.
5. Sticker system with fixed positions.
6. Microsite public renderer mode.
7. "Eternal" wedding microsite hero/countdown/event details.
8. "Eternal" story/gallery with Storage uploads.
9. Full microsite RSVP, registry, travel, and footer sections.
10. GSAP ScrollTrigger polish in `packages/templates`.
11. Microsite editor section toggle, reorder, and iframe preview.

