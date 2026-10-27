<script setup lang="ts">
import { Menu, X, ArrowUpRight } from 'lucide-vue-next';
const open = ref(false);
const auth = useAuthStore();
const links = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Storefronts' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-line/70 bg-canvas/85 backdrop-blur-xl">
    <div class="shell flex h-[72px] items-center justify-between gap-4">
      <NuxtLink to="/" aria-label="Bossly home"><LogoMark /></NuxtLink>
      <nav class="hidden items-center gap-7 lg:flex" aria-label="Main">
        <a v-for="link in links" :key="link.href" :href="link.href" class="text-[13px] font-semibold text-muted transition hover:text-ink">{{ link.label }}</a>
      </nav>
      <div class="flex items-center gap-2">
        <ThemeToggle />
        <template v-if="auth.isAuthenticated">
          <BaseButton to="/app" size="sm" variant="dark">Open dashboard <ArrowUpRight class="h-3.5 w-3.5" /></BaseButton>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="hidden rounded-full px-4 py-2 text-sm font-semibold hover:bg-raised sm:inline-flex">Sign in</NuxtLink>
          <BaseButton to="/register" size="sm">Start free <span aria-hidden="true">→</span></BaseButton>
        </template>
        <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden" aria-label="Open menu" @click="open = !open">
          <X v-if="open" class="h-5 w-5" /><Menu v-else class="h-5 w-5" />
        </button>
      </div>
    </div>
    <div v-if="open" class="border-t border-line bg-surface p-4 lg:hidden">
      <a v-for="link in links" :key="link.href" :href="link.href" class="flex min-h-[48px] items-center rounded-xl px-3 text-sm font-semibold hover:bg-raised" @click="open = false">{{ link.label }}</a>
      <NuxtLink to="/login" class="flex min-h-[48px] items-center rounded-xl px-3 text-sm font-semibold hover:bg-raised" @click="open = false">Sign in</NuxtLink>
    </div>
  </header>
</template>
