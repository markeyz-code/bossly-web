<script setup lang="ts">
import { Heart, MessageCircle, Sparkles } from 'lucide-vue-next';
import { whatsappLink } from '~/utils/phone';
definePageMeta({ layout: false });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { data, error } = await useStorefrontHome(slug);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Storefront not found', fatal: true });
const business = computed(() => data.value!.business);
const template = computed(() => data.value!.template);
const wa = computed(() => whatsappLink(business.value.whatsappNumber || business.value.publicPhone, `Hi ${business.value.name}! I'd like to know more.`));
useSeoMeta({ title: computed(() => `About — ${business.value.name}`), description: computed(() => business.value.about?.slice(0, 160) || business.value.description), ogTitle: computed(() => `About ${business.value.name}`), ogDescription: computed(() => business.value.tagline), ogType: 'website' });
useHead({ titleTemplate: '%s' });
</script>

<template>
  <StorefrontShell v-if="data" :business="business" :template="template">
    <div class="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">Our story</p>
      <h1 class="mt-2 max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-6xl" :style="{ color: template.colors.ink }">More than a shop. Someone's dream, in progress.</h1>
      <div class="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="prose-ojaly whitespace-pre-line text-sm leading-relaxed" :style="{ color: template.colors.muted }">{{ business.about || business.description || `${business.name} is a small Nigerian business built with care. Every order supports the dream.` }}</div>
        <div class="space-y-3">
          <div class="rounded-2xl p-5" :style="{ background: template.colors.primary, color: template.colors.onPrimary, borderRadius: template.radius }">
            <Sparkles class="h-6 w-6 opacity-60" />
            <p class="mt-3 font-display text-2xl font-bold">{{ business.name }}</p>
            <p class="mt-1 text-xs opacity-70">{{ business.tagline }}</p>
          </div>
          <div class="rounded-2xl border p-5" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: template.colors.ink }">
            <p class="text-[10px] font-bold uppercase tracking-widest opacity-50">Why shop small</p>
            <ul class="mt-2 space-y-2 text-xs"><li class="flex gap-2"><Heart class="h-3.5 w-3.5 shrink-0" :style="{ color: template.colors.primary }" /> Your money stays with a real person.</li><li class="flex gap-2"><Heart class="h-3.5 w-3.5 shrink-0" :style="{ color: template.colors.primary }" /> Personal service, not a call centre.</li><li class="flex gap-2"><Heart class="h-3.5 w-3.5 shrink-0" :style="{ color: template.colors.primary }" /> Every order helps a small business keep going.</li></ul>
          </div>
          <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="flex min-h-[50px] items-center justify-center gap-2 rounded-full text-sm font-bold" :style="{ background: template.colors.ink, color: template.colors.background }"><MessageCircle class="h-4 w-4" /> Talk to us</a>
        </div>
      </div>
    </div>
  </StorefrontShell>
</template>
