<script setup lang="ts">
import { Check, Sparkles } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import type { Plan } from '~/types';
const props = defineProps<{ plans: Plan[] }>();
const auth = useAuthStore();
const yearly = ref(false);
const ordered = computed(() => [...props.plans].sort((a, b) => a.priceMonthlyKobo - b.priceMonthlyKobo));
function price(plan: Plan) { return yearly.value ? plan.priceYearlyKobo : plan.priceMonthlyKobo; }
function features(plan: Plan): string[] {
  if (plan.marketingFeatures?.length) return plan.marketingFeatures;
  return [
    plan.entitlements.productLimit === null ? 'Unlimited products' : `${plan.entitlements.productLimit} products`,
    `${plan.entitlements.staffSeats} staff seat${plan.entitlements.staffSeats === 1 ? '' : 's'}`,
    'Profit dashboard',
  ];
}
</script>

<template>
  <section id="pricing" class="border-b border-line py-16 sm:py-24">
    <div class="shell">
      <div class="mx-auto max-w-2xl text-center">
        <p class="eyebrow">Pricing</p>
        <h2 class="mt-3 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Start free. Grow when it makes sense.</h2>
        <p class="mt-3 text-sm leading-relaxed text-muted">No card to start. Your data never gets locked when a trial ends — you simply drop to the free tier.</p>
        <div class="mt-6 inline-flex items-center rounded-full border border-line bg-surface p-1">
          <button type="button" class="rounded-full px-4 py-2 text-xs font-bold" :class="!yearly ? 'bg-ink text-canvas' : 'text-muted'" @click="yearly = false">Monthly</button>
          <button type="button" class="rounded-full px-4 py-2 text-xs font-bold" :class="yearly ? 'bg-ink text-canvas' : 'text-muted'" @click="yearly = true">Yearly <span class="text-success">save 20%</span></button>
        </div>
      </div>
      <div class="mt-10 grid gap-4 lg:grid-cols-3">
        <div v-for="plan in ordered" :key="plan.key" class="relative flex flex-col rounded-3xl border p-6 sm:p-7" :class="plan.isTrialPlan || plan.key === 'hustle' ? 'border-2 border-ink bg-forest-900 text-white shadow-[8px_8px_0_0_#FF5A1F]' : 'border-line bg-surface'">
          <div v-if="plan.key === 'hustle'" class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-forest-900">Most popular</div>
          <div class="flex items-center justify-between">
            <h3 class="font-display text-2xl font-bold">{{ plan.name }}</h3>
            <Sparkles v-if="plan.key === 'boss'" class="h-5 w-5 text-accent" />
          </div>
          <p class="mt-1.5 min-h-[40px] text-xs leading-relaxed" :class="plan.isTrialPlan || plan.key === 'hustle' ? 'text-[#A8C0B4]' : 'text-muted'">{{ plan.description }}</p>
          <div class="mt-5 flex items-baseline gap-1.5">
            <span class="font-display text-4xl font-bold tracking-tight">{{ price(plan) === 0 ? 'Free' : formatNaira(price(plan)) }}</span>
            <span v-if="price(plan) > 0" class="text-xs" :class="plan.isTrialPlan ? 'text-[#A8C0B4]' : 'text-muted'">/{{ yearly ? 'year' : 'month' }}</span>
          </div>
          <p class="mt-1 text-[11px]" :class="plan.isTrialPlan ? 'text-[#A8C0B4]' : 'text-muted'">{{ plan.trialDays > 0 ? `${plan.trialDays}-day free trial` : 'Free forever' }}</p>
          <ul class="mt-6 flex-1 space-y-2.5">
            <li v-for="feature in features(plan)" :key="feature" class="flex items-start gap-2 text-[13px]">
              <Check class="mt-0.5 h-4 w-4 shrink-0" :class="plan.isTrialPlan || plan.key === 'hustle' ? 'text-accent' : 'text-success'" />
              <span>{{ feature }}</span>
            </li>
          </ul>
          <BaseButton :to="auth.isAuthenticated ? '/app/settings?tab=billing' : `/register?plan=${plan.key}`" :variant="plan.isTrialPlan || plan.key === 'hustle' ? 'secondary' : 'primary'" block class="mt-7">{{ price(plan) === 0 ? 'Start free' : 'Choose ' + plan.name }}</BaseButton>
        </div>
      </div>
      <p class="mt-6 text-center text-[11px] text-muted">Prices in Naira. Yearly plans are billed once. Payment links secured by Paystack.</p>
    </div>
  </section>
</template>
