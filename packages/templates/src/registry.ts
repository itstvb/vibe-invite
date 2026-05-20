import { EnvelopeTemplate, envelopeDefaults, envelopeSchema } from './envelope/EnvelopeTemplate';
import type { TemplateRegistration } from './types';

export const templateRegistry = {
  envelope: {
    componentKey: 'envelope',
    templateType: 'card',
    previewMode: 'inline',
    component: EnvelopeTemplate,
    configSchema: envelopeSchema,
    defaultConfig: envelopeDefaults
  }
} satisfies Record<string, TemplateRegistration>;

export function getTemplate(componentKey: string): TemplateRegistration | null {
  return templateRegistry[componentKey as keyof typeof templateRegistry] ?? null;
}

export function listTemplates(): TemplateRegistration[] {
  return Object.values(templateRegistry);
}
