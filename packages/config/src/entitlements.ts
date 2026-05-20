import type { ConfigOption, Purchase, Template, User } from '@vibeinvite/types';

export type EntitlementReason =
  | 'not_authenticated'
  | 'free_template'
  | 'pro_plan'
  | 'one_time_purchase'
  | 'requires_pro'
  | 'requires_purchase'
  | 'free_limit_reached';

export interface EntitlementContext {
  user: Pick<User, 'uid' | 'plan' | 'role'> | null;
  purchases?: Pick<Purchase, 'templateId' | 'userId' | 'type'>[];
  monthlyInvitationCount?: number;
  freeMonthlyInvitationLimit?: number;
}

export interface EntitlementResult {
  allowed: boolean;
  reason: EntitlementReason;
}

export function hasPurchasedTemplate(ctx: EntitlementContext, templateId: string): boolean {
  if (!ctx.user) return false;

  return Boolean(
    ctx.purchases?.some(
      (purchase) =>
        purchase.userId === ctx.user?.uid &&
        purchase.templateId === templateId &&
        purchase.type === 'one_time'
    )
  );
}

export function canUseTemplate(ctx: EntitlementContext, template: Template): EntitlementResult {
  if (!ctx.user) {
    return { allowed: false, reason: 'not_authenticated' };
  }

  if (template.price > 0 && hasPurchasedTemplate(ctx, template.id)) {
    return { allowed: true, reason: 'one_time_purchase' };
  }

  if (template.isPro && ctx.user.plan === 'pro') {
    return { allowed: true, reason: 'pro_plan' };
  }

  if (template.price === 0 && !template.isPro) {
    return { allowed: true, reason: 'free_template' };
  }

  if (template.isPro) {
    return { allowed: false, reason: 'requires_pro' };
  }

  return { allowed: false, reason: 'requires_purchase' };
}

export function canCreateInvitation(ctx: EntitlementContext): EntitlementResult {
  if (!ctx.user) {
    return { allowed: false, reason: 'not_authenticated' };
  }

  if (ctx.user.plan === 'pro') {
    return { allowed: true, reason: 'pro_plan' };
  }

  const limit = ctx.freeMonthlyInvitationLimit ?? 3;
  const count = ctx.monthlyInvitationCount ?? 0;

  if (count >= limit) {
    return { allowed: false, reason: 'free_limit_reached' };
  }

  return { allowed: true, reason: 'free_template' };
}

export function canUseConfigOption(ctx: EntitlementContext, option: ConfigOption): EntitlementResult {
  if (!option.isPro) {
    return { allowed: true, reason: 'free_template' };
  }

  if (ctx.user?.plan === 'pro') {
    return { allowed: true, reason: 'pro_plan' };
  }

  return { allowed: false, reason: ctx.user ? 'requires_pro' : 'not_authenticated' };
}
