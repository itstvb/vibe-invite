import type {
  InvitationConfig,
  TemplateConfigSchema,
  TemplatePreviewMode,
  TemplateType
} from '@vibeinvite/types';
import type React from 'react';

export interface RsvpFormData {
  name: string;
  email: string;
  response: 'yes' | 'no' | 'maybe';
  message?: string;
  fields?: Record<string, unknown>;
}

export interface TemplateProps {
  config: InvitationConfig;
  isPreview?: boolean;
  renderMode?: 'editor' | 'public';
  onRsvp?: (data: RsvpFormData) => Promise<void>;
}

export interface TemplateRegistration {
  componentKey: string;
  templateType: TemplateType;
  previewMode: TemplatePreviewMode;
  component: React.ComponentType<TemplateProps>;
  configSchema: TemplateConfigSchema;
  defaultConfig: InvitationConfig;
}
