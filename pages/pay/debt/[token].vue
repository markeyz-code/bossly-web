<script setup lang="ts">
import { ArrowRight, CheckCircle2, LockKeyhole, MessageCircle } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';
import { whatsappLink } from '~/utils/phone';
definePageMeta({ layout: false });
const route = useRoute();
const token = computed(() => String(route.params.token));
const { data, error } = await usePublicDebt(token);
const payment = usePayDebt(token);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Payment link not found', fatal: true });
const debt = computed(() => data.value!.debt as { customerName: string; balanceKobo: number; principalKobo: number; paidKobo: number; dueDate: string; status: string });
const business = computed(() => data.value!.business as { name: string; logoUrl?: string; brandColor?: string; whatsappNumber?: string });
const paid = computed(() => route.query.paid === '1' || debt.value.balanceKobo <= 0);
const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
useSeoMeta({ title: computed(() => `Pay ${formatNaira(debt.value.balanceKobo)} — ${business.value.name}`), robots: 'noindex' });
useHead({ titleTemplate: '%s' });
const wa = computed(() => whatsappLink(business.value.whatsappNumber, `Hi ${business.value.name}, I have a question about my payment.`));
async function pay() {
  if (!email.value) { errorMessage.value = 'Enter your email to pay.'; return; }
  loading.value = true; errorMessage.value = '';
  try { const result = await payment.pay(email.value); window.location.href = result.authorizationUrl; }
  catch (err) { errorMessage.value = (err as Error).message; }
  finally { loading.value = false; }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-[#F1EDE3] p-4">
    <div class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lift">
      <div class="p-6 text-white" :style="{ background: '#06231A' }">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8C0B4]">Payment request from</p>
        <div class="mt-2 flex items-center gap-2.5"><span v-if="business.logoUrl" class="h-10 w-10 overflow-hidden rounded-xl bg-white"><img :src="business.logoUrl" class="h-full w-full object-cover"></span><span v-else class="flex h-10 w-10 items-center justify-center rounded-xl font-display font-bold" :style="{ background: business.brandColor || '#FF5A1F' }">{{ business.name[0] }}</span><p class="font-display text-xl font-bold">{{ business.name }}</p></div>
      </div>
      <div class="p-6">
        <div v-if="paid" class="text-center">
          <CheckCircle2 class="mx-auto h-12 w-12 text-success" />
          <h1 class="mt-3 font-display text-2xl font-bold">Payment received</h1>
          <p class="mt-1 text-sm text-muted">Thank you, {{ debt.customerName.split(' ')[0] }}. {{ business.name }} has been notified.</p>
          <a v-if="wa" :href="wa" target="_blank" class="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-forest-900"><MessageCircle class="h-4 w-4" /> Message the business</a>
        </div>
        <template v-else>
          <p class="text-xs text-muted">Hello {{ debt.customerName.split(' ')[0] }}, you have an outstanding balance.</p>
          <p class="mt-3 font-display text-4xl font-bold tracking-tight">{{ formatNaira(debt.balanceKobo) }}</p>
          <p class="mt-1 text-xs text-muted">Due {{ formatDate(debt.dueDate) }} · {{ formatNaira(debt.paidKobo) }} of {{ formatNaira(debt.principalKobo) }} already paid</p>
          <div class="mt-4 h-2 overflow-hidden rounded-full bg-raised"><div class="h-full rounded-full bg-success" :style="{ width: `${Math.min(100, (debt.paidKobo / debt.principalKobo) * 100)}%` }" /></div>
          <div class="mt-6"><label class="label-base">Your email</label><input v-model="email" type="email" class="input-base" placeholder="you@example.com" autocomplete="email"></div>
          <p v-if="errorMessage" class="mt-2 rounded-xl bg-danger/5 p-2.5 text-xs text-danger">{{ errorMessage }}</p>
          <button class="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-bold text-white disabled:opacity-50" :disabled="loading" @click="pay"><LockKeyhole class="h-4 w-4" /> {{ loading ? 'Opening Paystack…' : 'Pay securely with Paystack' }} <ArrowRight v-if="!loading" class="h-4 w-4" /></button>
          <p class="mt-3 text-center text-[10px] text-muted">Secured by Paystack. Your card details never touch Bossly.</p>
          <a v-if="wa" :href="wa" target="_blank" class="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted"><MessageCircle class="h-3.5 w-3.5" /> Questions? Chat with the business</a>
        </template>
      </div>
    </div>
  </div>
</template>
