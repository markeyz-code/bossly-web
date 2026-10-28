<script setup lang="ts">
import { BarChart3, Boxes, CircleHelp, Gift, Globe2, House, LayoutGrid, Plus, ReceiptText, Settings, ShoppingBag, Users, WalletCards, X } from 'lucide-vue-next';
const route = useRoute();
const moreOpen = ref(false);
const links = [
  { to: '/app', label: 'Home', icon: House, exact: true },
  { to: '/app/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/app/stock', label: 'Stock', icon: Boxes },
];
const more = [
  { to: '/app/sales', label: 'Sales', icon: ReceiptText },
  { to: '/app/customers', label: 'Customers', icon: Users },
  { to: '/app/debts', label: 'Debts', icon: WalletCards },
  { to: '/app/expenses', label: 'Expenses', icon: ReceiptText },
  { to: '/app/reports', label: 'Reports', icon: BarChart3 },
  { to: '/app/website', label: 'My website', icon: Globe2 },
  { to: '/app/affiliates', label: 'Refer & earn', icon: Gift },
  { to: '/app/help', label: 'Help center', icon: CircleHelp },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];
const isActive = (to: string, exact = false) => exact ? route.path === to : route.path.startsWith(to);
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden safe-bottom" aria-label="App navigation">
    <div class="grid grid-cols-5 items-end px-2 pb-1 pt-2">
      <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold" :class="isActive(link.to, link.exact) ? 'text-brand-500' : 'text-muted'">
        <component :is="link.icon" class="h-5 w-5" :stroke-width="isActive(link.to, link.exact) ? 2.5 : 2" />{{ link.label }}
      </NuxtLink>
      <NuxtLink to="/app/sales/new" class="-mt-5 flex flex-col items-center gap-1 text-[10px] font-bold text-ink">
        <span class="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand-500 text-white shadow-chunky-sm"><Plus class="h-7 w-7" :stroke-width="2.5" /></span>
        Sell
      </NuxtLink>
      <button type="button" class="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold" :class="moreOpen ? 'text-brand-500' : 'text-muted'" @click="moreOpen = true">
        <LayoutGrid class="h-5 w-5" /> More
      </button>
    </div>
  </nav>

  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="moreOpen" class="fixed inset-0 z-[70] bg-forest-900/50 backdrop-blur-sm lg:hidden" @click="moreOpen = false">
        <div class="absolute inset-x-0 bottom-0 rounded-t-[2rem] border border-line bg-surface p-5 pb-10" @click.stop>
          <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-display text-xl font-bold">More in Ojaly</h2>
            <button class="flex h-9 w-9 items-center justify-center rounded-full bg-raised" aria-label="Close" @click="moreOpen = false"><X class="h-4 w-4" /></button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <NuxtLink v-for="link in more" :key="link.to" :to="link.to" class="flex min-h-[64px] items-center gap-3 rounded-2xl border border-line bg-raised/50 p-3.5 text-sm font-semibold" @click="moreOpen = false">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-surface"><component :is="link.icon" class="h-4 w-4" /></span>
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s ease; }
.sheet-leave-active > div, .sheet-enter-active > div { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from > div, .sheet-leave-to > div { transform: translateY(100%); }
</style>
