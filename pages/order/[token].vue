<script setup lang="ts">
import { CheckCircle2, Clock, MessageCircle, Truck, XCircle } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';
import { whatsappLink } from '~/utils/phone';
definePageMeta({ layout: false });
const route = useRoute();
const token = computed(() => String(route.params.token));
const { data, error } = await usePublicOrder(token);
const payment = usePayOrder(token);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Order not found', fatal: true });
const order = computed(() => data.value!.order);
const business = computed(() => data.value!.business as { name: string; slug?: string; logoUrl?: string; brandColor?: string; whatsappNumber?: string; publicPhone?: string });
useSeoMeta({ title: computed(() => `Order ${order.value.orderNumber} — ${business.value.name}`), robots: 'noindex' });
useHead({ titleTemplate: '%s' });
const steps = ['pending', 'confirmed', 'paid', 'delivered'];
const cancelled = computed(() => order.value.status === 'cancelled');
function stepDone(step: string) { if (cancelled.value) return false; return steps.indexOf(order.value.status) >= steps.indexOf(step); }
const outstanding = computed(() => Math.max(0, order.value.totalKobo - order.value.amountPaidKobo));
const wa = computed(() => whatsappLink(business.value.whatsappNumber || business.value.publicPhone, `Hi ${business.value.name}, I'm checking on my order ${order.value.orderNumber}.`));
const paying = ref(false);
const email = ref('');
const payError = ref('');
async function payBalance() {
  paying.value = true; payError.value = '';
  try { const result = await payment.pay(email.value || undefined); window.location.href = result.authorizationUrl; }
  catch (err) { payError.value = (err as Error).message; }
  finally { paying.value = false; }
}
</script>

<template>
  <div class="min-h-dvh bg-canvas py-8">
    <div class="mx-auto max-w-2xl px-4">
      <div class="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
        <div class="bg-forest-900 p-6 text-white sm:p-8">
          <div class="flex items-center justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8C0B4]">Order status</p><p class="mt-1 font-display text-2xl font-bold">{{ business.name }}</p></div><BaseBadge :variant="cancelled ? 'neutral' : order.status === 'delivered' ? 'success' : 'warning'" dot>{{ order.status }}</BaseBadge></div>
          <p class="mt-4 text-xs text-[#A8C0B4]">Order {{ order.orderNumber }} · {{ formatDate(order.createdAt) }}</p>
        </div>
        <div class="p-6 sm:p-8">
          <div v-if="cancelled" class="flex items-center gap-3 rounded-2xl bg-raised p-4 text-muted"><XCircle class="h-5 w-5" /><p class="text-sm">This order was cancelled. Contact the business if you need help.</p></div>
          <div v-else class="grid grid-cols-4 gap-1">
            <div v-for="(step, index) in steps" :key="step" class="flex flex-col items-center gap-1.5"><div class="flex w-full items-center"><div class="h-0.5 flex-1" :class="index === 0 ? 'bg-transparent' : stepDone(step) ? 'bg-success' : 'bg-line'" /><div class="flex h-8 w-8 items-center justify-center rounded-full border-2" :class="stepDone(step) ? 'border-success bg-success text-white' : 'border-line bg-surface text-muted'"><CheckCircle2 class="h-4 w-4" /></div><div class="h-0.5 flex-1" :class="index === steps.length - 1 ? 'bg-transparent' : stepDone(steps[index + 1]) ? 'bg-success' : 'bg-line'" /></div><span class="text-[9px] font-bold capitalize" :class="stepDone(step) ? 'text-success' : 'text-muted'">{{ step }}</span></div>
          </div>
          <div class="mt-6 divide-y divide-line">
            <div v-for="item in order.items" :key="item.name + item.variantName" class="flex items-center justify-between gap-3 py-3 text-sm"><div><p class="font-semibold">{{ item.quantity }} × {{ item.name }}</p><p class="text-[10px] text-muted">{{ item.variantName }}</p></div><p class="font-bold">{{ formatNaira(item.lineTotalKobo) }}</p></div>
          </div>
          <dl class="mt-3 space-y-1.5 border-t border-line pt-3 text-xs"><div class="flex justify-between"><dt class="text-muted">Total</dt><dd class="font-bold">{{ formatNaira(order.totalKobo) }}</dd></div><div class="flex justify-between"><dt class="text-muted">Paid</dt><dd class="text-success">{{ formatNaira(order.amountPaidKobo) }}</dd></div><div v-if="outstanding" class="flex justify-between"><dt class="text-muted">Outstanding</dt><dd class="font-bold text-warning">{{ formatNaira(outstanding) }}</dd></div></dl>
          <div v-if="outstanding > 0 && !cancelled" class="mt-5 rounded-2xl border border-line p-4">
            <p class="text-sm font-bold">Pay the balance</p>
            <p class="mt-0.5 text-[11px] text-muted">Secure payment via Paystack.</p>
            <div class="mt-2 flex flex-col gap-2 sm:flex-row"><input v-model="email" type="email" placeholder="Email for receipt" class="input-base text-xs sm:flex-1"><button class="rounded-xl bg-brand-500 px-4 py-3 text-xs font-bold text-white disabled:opacity-50" :disabled="paying" @click="payBalance">{{ paying ? 'Opening…' : `Pay ${formatNaira(outstanding)}` }}</button></div>
            <p v-if="payError" class="mt-2 text-[11px] text-danger">{{ payError }}</p>
          </div>
          <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="mt-5 flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold text-forest-900"><MessageCircle class="h-4 w-4" /> Message {{ business.name }}</a>
          <p class="mt-4 text-center text-[10px] text-muted">Tracking link provided by {{ business.name }}. Powered by Bossly.</p>
        </div>
      </div>
    </div>
  </div>
</template>
