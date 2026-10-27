<script setup lang="ts">
import { Download, ExternalLink } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';
definePageMeta({ layout: false });
const route = useRoute();
const token = computed(() => String(route.params.token));
const { data, error } = await usePublicInvoice(token);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Invoice not found', fatal: true });
const invoice = computed(() => data.value!.invoice);
const business = computed(() => data.value!.business as { name: string; logoUrl?: string; brandColor?: string; email?: string; publicPhone?: string; address?: string });
const config = useRuntimeConfig();
const paid = computed(() => invoice.value.status === 'paid' || route.query.paid === '1');
useSeoMeta({ title: computed(() => `Invoice ${invoice.value.invoiceNumber} — ${business.value.name}`), robots: 'noindex' });
useHead({ titleTemplate: '%s' });
</script>

<template>
  <div class="min-h-dvh bg-[#F1EDE3] py-6">
    <div class="mx-auto max-w-2xl px-4">
      <div class="mb-4 flex justify-end gap-2"><a :href="`${config.public.apiBase}/public/invoices/${token}/pdf`" target="_blank" class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-bold text-forest-900"><Download class="h-4 w-4" /> Download PDF</a></div>
      <div class="overflow-hidden rounded-3xl bg-white shadow-lift">
        <div class="bg-forest-900 p-6 text-white sm:p-8"><div class="flex items-start justify-between"><div><p class="font-display text-2xl font-bold">{{ business.name }}</p><p class="mt-1 text-[10px] text-[#A8C0B4]">{{ business.address }} {{ business.email }}</p></div><div class="text-right"><p class="text-[10px] font-bold uppercase tracking-widest text-[#A8C0B4]">Invoice</p><p class="text-sm font-bold">{{ invoice.invoiceNumber }}</p><p class="text-[10px] text-[#A8C0B4]">Due {{ formatDate(invoice.dueDate) }}</p></div></div></div>
        <div class="p-6 sm:p-8">
          <div class="flex flex-wrap items-center justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Billed to</p><p class="mt-1 font-bold">{{ invoice.customerName }}</p><p class="text-xs text-muted">{{ invoice.customerEmail || invoice.customerPhone }}</p></div><BaseBadge :variant="paid ? 'success' : 'warning'" dot>{{ paid ? 'PAID' : invoice.status.toUpperCase() }}</BaseBadge></div>
          <div class="mt-6 overflow-hidden rounded-xl border border-line"><table class="w-full text-left text-xs"><thead class="bg-[#F7F2E8]"><tr><th class="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Description</th><th class="px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted">Qty</th><th class="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted">Price</th><th class="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted">Total</th></tr></thead><tbody><tr v-for="item in invoice.items" :key="item.name" class="border-t border-line"><td class="px-3 py-3 font-semibold">{{ item.name }}</td><td class="px-3 py-3 text-center">{{ item.quantity }}</td><td class="px-3 py-3 text-right">{{ formatNaira(item.unitPriceKobo) }}</td><td class="px-3 py-3 text-right font-semibold">{{ formatNaira(item.lineTotalKobo) }}</td></tr></tbody></table></div>
          <dl class="ml-auto mt-4 max-w-xs space-y-1.5 text-xs"><div class="flex justify-between"><dt class="text-muted">Subtotal</dt><dd>{{ formatNaira(invoice.subtotalKobo) }}</dd></div><div v-if="invoice.discountKobo" class="flex justify-between"><dt class="text-muted">Discount</dt><dd>-{{ formatNaira(invoice.discountKobo) }}</dd></div><div v-if="invoice.deliveryFeeKobo" class="flex justify-between"><dt class="text-muted">Delivery</dt><dd>{{ formatNaira(invoice.deliveryFeeKobo) }}</dd></div><div class="flex justify-between border-t border-line pt-2 font-display text-lg font-bold"><dt>Total</dt><dd>{{ formatNaira(invoice.totalKobo) }}</dd></div></dl>
          <div v-if="!paid" class="mt-6 flex flex-wrap gap-2"><NuxtLink :to="`/pay/invoice/${token}`" class="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-3 text-xs font-bold text-white">Pay invoice <ExternalLink class="h-3.5 w-3.5" /></NuxtLink></div>
          <p v-if="invoice.notes" class="mt-5 rounded-xl bg-[#F7F2E8] p-3 text-xs text-muted">{{ invoice.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
