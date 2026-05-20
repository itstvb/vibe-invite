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

export interface Timestamped {
  createdAt: Date;
  updatedAt?: Date;
}

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
  role: UserRole;
  createdAt: Date;
}

export interface TemplateConfigSchema {
  fields: FieldSchema[];
  colors: ColorSchema[];
  fonts: FontSchema[];
  animations: AnimationSchema[];
  assets?: AssetControlSchema[];
  sections?: SectionSchema[];
}

export interface FieldSchema {
  key: string;
  label: string;
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
  key: string;
  label: string;
  default: string;
  isPro?: boolean;
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
  price: number;
  monthlyPrice: number;
  componentKey: string;
  previewMode: TemplatePreviewMode;
  thumbnailUrl: string;
  previewUrl?: string;
  configSchema: TemplateConfigSchema;
  defaultConfig: InvitationConfig;
  isPublished: boolean;
  isPro: boolean;
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
  componentKey: string;
  templateType: TemplateType;
  slug: string;
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
  fields?: Record<string, JsonValue>;
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
