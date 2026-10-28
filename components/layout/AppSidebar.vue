<script setup lang="ts">
import type { Component } from 'vue';
import {
  ArrowUpRight, BarChart3, Boxes, Building2, CircleDollarSign, CircleHelp, Gift, Globe2, LayoutDashboard,
  Package, Settings, ShoppingBag, Users, WalletCards, X, ReceiptText,
} from 'lucide-vue-next';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const route = useRoute();
const businessStore = useBusinessStore();
const auth = useAuthStore();

interface NavLink { to: string; label: string; icon: Component; exact?: boolean; ownerOnly?: boolean }
const groups: Array<{ label: string; links: NavLink[] }> = [
  {
    label: 'Run it',
    links: [
      { to: '/app', label: 'Overview', icon: LayoutDashboard, exact: true },
      { to: '/app/orders', label: 'Orders', icon: ShoppingBag },
      { to: '/app/sales', label: 'Sales', icon: CircleDollarSign },
      { to: '/app/products', label: 'Products', icon: Package },
      { to: '/app/stock', label: 'Stock', icon: Boxes },
    ],
  },
  {
    label: 'Money & people',
    links: [
      { to: '/app/customers', label: 'Customers', icon: Users },
      { to: '/app/debts', label: 'Debts', icon: WalletCards },
      { to: '/app/expenses', label: 'Expenses', icon: ReceiptText },
      { to: '/app/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Grow',
    links: [
      { to: '/app/website', label: 'My website', icon: Globe2 },
      { to: '/app/affiliates', label: 'Refer & earn', icon: Gift, ownerOnly: true },
      { to: '/app/help', label: 'Help center', icon: CircleHelp },
      { to: '/app/settings', label: 'Settings', icon: Settings },
    ],
  },
];
const isActive = (to: string, exact = false) => exact ? route.path === to : route.path === to || route.path.startsWith(`${to}/`);
const trialDays = computed(() => businessStore.trialDaysLeft);
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 bg-forest-900/50 backdrop-blur-sm lg:hidden" @click="emit('close')" />
  <aside class="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-surface transition-transform duration-300 lg:translate-x-0" :class="open ? 'translate-x-0' : '-translate-x-full'">
    <div class="flex h-[72px] items-center justify-between px-5">
      <NuxtLink to="/app" aria-label="Ojaly dashboard"><LogoMark /></NuxtLink>
      <button class="flex h-9 w-9 items-center justify-center rounded-full hover:bg-raised lg:hidden" aria-label="Close menu" @click="emit('close')"><X class="h-5 w-5" /></button>
    </div>

    <div class="mx-3 mb-4 rounded-2xl border border-line bg-raised/60 p-3">
      <div class="flex items-center gap-2.5">
        <UserAvatar :name="businessStore.business?.name" :src="businessStore.business?.logoUrl" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-bold">{{ businessStore.business?.name || 'Your business' }}</p>
          <p class="text-[10px] font-semibold text-muted">{{ businessStore.plan?.name || 'Loading' }} plan</p>
        </div>
        <BadgeTrial v-if="businessStore.isTrial" :days="trialDays" />
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
      <div v-for="group in groups" :key="group.label" class="mb-4">
        <p class="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted/70">{{ group.label }}</p>
        <NuxtLink
          v-for="link in group.links"
          v-show="!link.ownerOnly || auth.isOwner"
          :key="link.to"
          :to="link.to"
          class="group flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition"
          :class="isActive(link.to, link.exact) ? 'bg-ink text-canvas shadow-sm' : 'text-muted hover:bg-raised hover:text-ink'"
          @click="emit('close')"
        >
          <component :is="link.icon" class="h-[18px] w-[18px]" :class="isActive(link.to, link.exact) ? 'text-brand-400' : 'text-muted group-hover:text-ink'" />
          {{ link.label }}
        </NuxtLink>
      </div>
    </nav>

    <div class="m-3 rounded-2xl bg-forest-900 p-4 text-white" data-tour="storefront">
      <div class="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#A8C0B4]"><Building2 class="h-3.5 w-3.5" /> Your storefront</div>
      <p class="truncate text-xs text-[#D5E4DB]">{{ businessStore.storefrontUrls?.subdomain || 'Publish your website' }}</p>
      <NuxtLink :to="businessStore.business?.storefrontPublished ? `/s/${businessStore.business?.slug}` : '/app/website'" target="_blank" class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300">
        {{ businessStore.business?.storefrontPublished ? 'View live site' : 'Finish setup' }} <ArrowUpRight class="h-3.5 w-3.5" />
      </NuxtLink>
    </div>
  </aside>
</template>
