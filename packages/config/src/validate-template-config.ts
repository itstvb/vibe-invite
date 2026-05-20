import type {
  AnimationSchema,
  AssetControlSchema,
  ColorSchema,
  ConfigOption,
  FieldSchema,
  FontSchema,
  InvitationConfig,
  JsonValue,
  TemplateConfigSchema
} from '@vibeinvite/types';

export interface ConfigValidationIssue {
  path: string;
  message: string;
}

export interface ConfigValidationResult {
  valid: boolean;
  issues: ConfigValidationIssue[];
}

export function validateTemplateConfig(
  schema: TemplateConfigSchema,
  config: InvitationConfig
): ConfigValidationResult {
  const issues: ConfigValidationIssue[] = [];
  const knownKeys = new Set<string>(['rsvpEnabled']);

  for (const field of schema.fields) {
    knownKeys.add(field.key);
    validateField(field, config[field.key], issues);
  }

  for (const color of schema.colors) {
    knownKeys.add(color.key);
    validateColor(color, config[color.key], issues);
  }

  for (const font of schema.fonts) {
    knownKeys.add(font.key);
    validateOption(font.key, font.options, config[font.key], issues);
  }

  for (const animation of schema.animations) {
    knownKeys.add(animation.key);
    validateAnimation(animation, config[animation.key], issues);
  }

  for (const asset of schema.assets ?? []) {
    knownKeys.add(asset.key);
    validateAsset(asset, config[asset.key], issues);
  }

  if (schema.sections) {
    knownKeys.add('sections');
  }

  for (const key of Object.keys(config)) {
    if (!knownKeys.has(key)) {
      issues.push({ path: key, message: 'Unknown config key' });
    }
  }

  return { valid: issues.length === 0, issues };
}

function validateField(field: FieldSchema, value: JsonValue | undefined, issues: ConfigValidationIssue[]) {
  if (field.required && isEmpty(value)) {
    issues.push({ path: field.key, message: 'Required field is missing' });
    return;
  }

  if (isEmpty(value)) return;

  if (field.type === 'toggle' && typeof value !== 'boolean') {
    issues.push({ path: field.key, message: 'Expected a boolean value' });
  }

  if (field.type === 'range') {
    validateRange(field.key, value, field.min, field.max, field.step, issues);
  }

  if (field.type === 'select') {
    validateOption(field.key, field.options ?? [], value, issues);
  }

  if (field.type === 'color') {
    validateHex(field.key, value, issues);
  }

  if (['text', 'textarea', 'date', 'time', 'url'].includes(field.type) && typeof value !== 'string') {
    issues.push({ path: field.key, message: 'Expected a string value' });
  }

  if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
    issues.push({ path: field.key, message: `Must be ${field.maxLength} characters or fewer` });
  }
}

function validateColor(color: ColorSchema, value: JsonValue | undefined, issues: ConfigValidationIssue[]) {
  if (isEmpty(value)) return;
  validateHex(color.key, value, issues);
}

function validateAnimation(
  animation: AnimationSchema,
  value: JsonValue | undefined,
  issues: ConfigValidationIssue[]
) {
  if (isEmpty(value)) return;

  if (animation.type === 'range') {
    validateRange(animation.key, value, animation.min, animation.max, animation.step, issues);
    return;
  }

  validateOption(animation.key, animation.options ?? [], value, issues);
}

function validateAsset(asset: AssetControlSchema, value: JsonValue | undefined, issues: ConfigValidationIssue[]) {
  if (isEmpty(value)) return;

  if (asset.type === 'stamp' && typeof value !== 'string') {
    issues.push({ path: asset.key, message: 'Expected a stamp key' });
  }

  if (asset.type === 'sticker' && typeof value !== 'object') {
    issues.push({ path: asset.key, message: 'Expected sticker slot configuration' });
  }
}

function validateRange(
  path: string,
  value: JsonValue | undefined,
  min: number | undefined,
  max: number | undefined,
  step: number | undefined,
  issues: ConfigValidationIssue[]
) {
  if (typeof value !== 'number') {
    issues.push({ path, message: 'Expected a number value' });
    return;
  }

  if (typeof min === 'number' && value < min) {
    issues.push({ path, message: `Must be at least ${min}` });
  }

  if (typeof max === 'number' && value > max) {
    issues.push({ path, message: `Must be no more than ${max}` });
  }

  if (typeof step === 'number' && typeof min === 'number') {
    const steps = (value - min) / step;
    if (!Number.isInteger(Number(steps.toFixed(8)))) {
      issues.push({ path, message: `Must align to step ${step}` });
    }
  }
}

function validateOption(
  path: string,
  options: ConfigOption[],
  value: JsonValue | undefined,
  issues: ConfigValidationIssue[]
) {
  if (typeof value !== 'string') {
    issues.push({ path, message: 'Expected a string option value' });
    return;
  }

  if (!options.some((option) => option.value === value)) {
    issues.push({ path, message: 'Invalid option value' });
  }
}

function validateHex(path: string, value: JsonValue | undefined, issues: ConfigValidationIssue[]) {
  if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
    issues.push({ path, message: 'Expected a hex color like #ffffff' });
  }
}

function isEmpty(value: JsonValue | undefined) {
  return value === undefined || value === null || value === '';
}
