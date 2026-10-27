<script setup lang="ts">
import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';
definePageMeta({ layout: false });
const route = useRoute();
const token = computed(() => String(route.params.token));
const { data, error } = await usePublicInvoice(token);
const payment = usePayInvoice(token);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Invoice not found', fatal: true });
const invoice = computed(() => data.value!.invoice);
const business = computed(() => data.value!.business as { name: string; logoUrl?: string; brandColor?: string });
const paid = computed(() => invoice.value.status === 'paid' || route.query.paid === '1');
const email = ref(invoice.value.customerEmail || '');
const loading = ref(false);
const errorMessage = ref('');
useSeoMeta({ title: computed(() => `Pay invoice ${invoice.value.invoiceNumber}`), robots: 'noindex' });
useHead({ titleTemplate: '%s' });
async function pay() {
  loading.value = true; errorMessage.value = '';
  try { const result = await payment.pay(email.value || undefined); window.location.href = result.authorizationUrl; }
  catch (err) { errorMessage.value = (err as Error).message; }
  finally { loading.value = false; }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-[#F1EDE3] p-4">
    <div class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lift">
      <div class="bg-forest-900 p-6 text-white"><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8C0B4]">Invoice {{ invoice.invoiceNumber }}</p><p class="mt-1 font-display text-2xl font-bold">{{ business.name }}</p><p class="text-[10px] text-[#A8C0B4]">Due {{ formatDate(invoice.dueDate) }}</p></div>
      <div class="p-6">
        <div v-if="paid" class="text-center"><CheckCircle2 class="mx-auto h-12 w-12 text-success" /><h1 class="mt-3 font-display text-2xl font-bold">Invoice paid</h1><p class="mt-1 text-sm text-muted">Thank you. {{ business.name }} has been notified.</p><NuxtLink :to="`/invoice/${token}?paid=1`" class="mt-5 inline-flex rounded-full bg-forest-900 px-5 py-3 text-xs font-bold text-white">View invoice</NuxtLink></div>
        <template v-else>
          <p class="text-xs text-muted">Billed to {{ invoice.customerName }}</p>
          <p class="mt-2 font-display text-4xl font-bold">{{ formatNaira(invoice.totalKobo) }}</p>
          <div class="mt-3 space-y-1.5 text-xs"><div v-for="item in invoice.items" :key="item.name" class="flex justify-between"><span class="text-muted">{{ item.quantity }} × {{ item.name }}</span><span class="font-semibold">{{ formatNaira(item.lineTotalKobo) }}</span></div></div>
          <div class="mt-4"><label class="label-base">Email for receipt</label><input v-model="email" type="email" class="input-base" placeholder="you@example.com"></div>
          <p v-if="errorMessage" class="mt-2 rounded-xl bg-danger/5 p-2.5 text-xs text-danger">{{ errorMessage }}</p>
          <button class="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-bold text-white disabled:opacity-50" :disabled="loading" @click="pay"><LockKeyhole class="h-4 w-4" /> {{ loading ? 'Opening Paystack…' : 'Pay invoice' }} <ArrowRight v-if="!loading" class="h-4 w-4" /></button>
        </template>
      </div>
    </div>
  </div>
</template>
