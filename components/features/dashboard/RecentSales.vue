<script setup lang="ts">
import { ArrowRight, ReceiptText } from 'lucide-vue-next';
import type { Sale } from '~/types';
import { formatNaira } from '~/utils/money';
import { formatDateTime } from '~/utils/date';
defineProps<{ sales: Sale[] }>();
const statusStyle: Record<string, string> = { paid: 'success', partial: 'warning', unpaid: 'danger' };
</script>

<template>
  <BaseCard padding="none" class="overflow-hidden">
    <div class="flex items-center justify-between border-b border-line px-5 py-4">
      <div><p class="font-display text-lg font-bold">Recent sales</p><p class="text-[11px] text-muted">The latest money that entered your business.</p></div>
      <NuxtLink to="/app/sales" class="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline dark:text-brand-300">All sales <ArrowRight class="h-3.5 w-3.5" /></NuxtLink>
    </div>
    <div v-if="!sales.length" class="p-8 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-raised text-muted"><ReceiptText class="h-6 w-6" /></div>
      <p class="mt-3 text-sm font-semibold">No sales yet</p>
      <p class="mt-1 text-xs text-muted">Record your first sale and watch this space wake up.</p>
      <BaseButton to="/app/sales/new" size="sm" class="mt-4">Record a sale</BaseButton>
    </div>
    <div v-else class="divide-y divide-line">
      <NuxtLink v-for="sale in sales" :key="sale.id" :to="`/app/sales?highlight=${sale.id}`" class="flex items-center gap-3 px-5 py-3.5 transition hover:bg-raised/50">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-raised text-xs font-bold">{{ sale.customerName.split(' ').map((w) => w[0]).slice(0, 2).join('') }}</div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold">{{ sale.customerName }}</p>
          <p class="text-[11px] text-muted">{{ sale.saleNumber }} · {{ formatDateTime(sale.soldAt) }}</p>
        </div>
        <BaseBadge :variant="(statusStyle[sale.paymentStatus] as 'success' | 'warning' | 'danger') || 'neutral'" dot>{{ sale.paymentStatus }}</BaseBadge>
        <p class="text-right text-sm font-bold">{{ formatNaira(sale.totalKobo) }}</p>
      </NuxtLink>
    </div>
  </BaseCard>
</template>
