import { PRICE_IDS } from './paddle';
import type en from '../i18n/locales/en';

/* ============================================================
   The plan catalogue — the non-translatable half.

   Three surfaces sell these plans: the marketing Pricing section, /plans, and
   the in-app /app-checkout. Each used to carry its own copy of the whole
   catalogue, and the copies had already drifted. Now the ids and amounts live
   here, the words live in the dictionary under `plans.<key>`, and each surface
   only decides ORDER and which CTA phrasing it wants.

   Amounts stay hard-coded USD strings rather than being localised: Paddle
   charges in USD and shows the authoritative amount in its own overlay, so a
   converted price rendered here would be a number we cannot honour.
   ============================================================ */

export type PlanKey = keyof typeof en.plans;

export interface Plan {
    key: PlanKey;
    price: string;
    period: string;
    popular: boolean;
    priceId: string;
}

export const PLANS: Record<PlanKey, Plan> = {
    monthly: { key: 'monthly', price: '$6.99', period: '/mo', popular: false, priceId: PRICE_IDS.monthly },
    yearly: { key: 'yearly', price: '$39.99', period: '/yr', popular: true, priceId: PRICE_IDS.yearly },
    lifetime: { key: 'lifetime', price: '$59.99', period: '', popular: false, priceId: PRICE_IDS.lifetime },
};

/** Marketing and /plans order: cheapest first, with the popular card centred. */
export const PLAN_ORDER: PlanKey[] = ['monthly', 'yearly', 'lifetime'];

/** The in-app sheet leads with the plan we want taken, not the cheapest. */
export const APP_PLAN_ORDER: PlanKey[] = ['yearly', 'monthly', 'lifetime'];
