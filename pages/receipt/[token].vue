<script setup lang="ts">
import { CheckCircle2, Download, Printer } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { formatDate } from '~/utils/date';
definePageMeta({ layout: false });
const route = useRoute();
const token = computed(() => String(route.params.token));
const { data, error } = await usePublicReceipt(token);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Receipt not found', fatal: true });
const receipt = computed(() => data.value!.receipt);
const business = computed(() => data.value!.business as { name: string; logoUrl?: string; brandColor?: string; email?: string; publicPhone?: string; address?: string });
const config = useRuntimeConfig();
useSeoMeta({ title: computed(() => `Receipt ${receipt.value.receiptNumber} — ${business.value.name}`), robots: 'noindex' });
useHead({ titleTemplate: '%s' });
const pdfUrl = computed(() => `${config.public.apiBase}/public/receipts/${token.value}/pdf`);
const brand = computed(() => business.value.brandColor || '#FF5A1F');
function printReceipt() { window.print(); }
</script>

<template>
  <div class="min-h-dvh bg-[#F1EDE3] py-6 print:bg-white print:py-0">
    <div class="mx-auto max-w-2xl px-4">
      <div class="mb-4 flex justify-end gap-2 print:hidden">
        <a :href="pdfUrl" target="_blank" class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-bold text-forest-900"><Download class="h-4 w-4" /> PDF</a>
        <button class="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-4 py-2.5 text-xs font-bold text-white" @click="printReceipt"><Printer class="h-4 w-4" /> Print</button>
      </div>
      <div class="overflow-hidden rounded-3xl bg-white shadow-lift print:shadow-none">
        <div class="p-6 text-white sm:p-8" :style="{ background: '#06231A' }">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-2.5">
              <span v-if="business.logoUrl" class="h-11 w-11 overflow-hidden rounded-xl bg-white"><img :src="business.logoUrl" class="h-full w-full object-cover"></span>
              <span v-else class="flex h-11 w-11 items-center justify-center rounded-xl font-display text-lg font-bold text-white" :style="{ background: brand }">{{ business.name[0] }}</span>
              <div><p class="font-display text-lg font-bold">{{ business.name }}</p><p class="text-[10px] text-[#A8C0B4]">{{ business.email || business.publicPhone }}</p></div>
            </div>
            <div class="text-right"><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8C0B4]">Receipt</p><p class="text-sm font-bold">#{{ receipt.receiptNumber }}</p><p class="text-[10px] text-[#A8C0B4]">{{ formatDate(receipt.issuedAt) }}</p></div>
          </div>
        </div>
        <div class="p-6 sm:p-8">
          <div class="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-success"><CheckCircle2 class="h-5 w-5" /><div><p class="text-xs font-bold">Payment received</p><p class="text-[10px] opacity-80">Thank you for supporting this business.</p></div></div>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Billed to</p><p class="mt-1 text-sm font-bold">{{ receipt.customerName }}</p><p class="text-xs text-muted">{{ receipt.customerPhone || receipt.customerEmail }}</p></div>
            <div class="sm:text-right"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Payment method</p><p class="mt-1 text-sm font-bold capitalize">{{ receipt.paymentMethod }}</p><p class="text-xs text-muted">Paid {{ formatNaira(receipt.amountPaidKobo) }}</p></div>
          </div>
          <div class="mt-6 overflow-hidden rounded-xl border border-line">
            <table class="w-full text-left text-xs"><thead class="bg-[#F7F2E8]"><tr><th class="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">Item</th><th class="px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted">Qty</th><th class="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted">Price</th><th class="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted">Total</th></tr></thead><tbody><tr v-for="item in receipt.items" :key="item.productId + item.variantId" class="border-t border-line"><td class="px-3 py-3"><p class="font-semibold">{{ item.name }}</p><p class="text-[10px] text-muted">{{ item.variantName }}</p></td><td class="px-3 py-3 text-center">{{ item.quantity }}</td><td class="px-3 py-3 text-right">{{ formatNaira(item.unitPriceKobo) }}</td><td class="px-3 py-3 text-right font-semibold">{{ formatNaira(item.lineTotalKobo) }}</td></tr></tbody></table>
          </div>
          <dl class="ml-auto mt-4 max-w-xs space-y-1.5 text-xs">
            <div class="flex justify-between"><dt class="text-muted">Subtotal</dt><dd>{{ formatNaira(receipt.subtotalKobo) }}</dd></div>
            <div v-if="receipt.discountKobo" class="flex justify-between"><dt class="text-muted">Discount</dt><dd>-{{ formatNaira(receipt.discountKobo) }}</dd></div>
            <div v-if="receipt.deliveryFeeKobo" class="flex justify-between"><dt class="text-muted">Delivery</dt><dd>{{ formatNaira(receipt.deliveryFeeKobo) }}</dd></div>
            <div class="flex justify-between border-t border-line pt-2 font-display text-lg font-bold"><dt>Total</dt><dd :style="{ color: brand }">{{ formatNaira(receipt.totalKobo) }}</dd></div>
          </dl>
          <p class="mt-6 border-t border-line pt-4 text-center text-[10px] text-muted">This receipt was generated automatically by {{ business.name }} on Bossly.</p>
        </div>
      </div>
    </div>
  </div>
</template>
