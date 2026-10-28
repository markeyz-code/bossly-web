<script setup lang="ts">
import { Check, ExternalLink } from 'lucide-vue-next';
import { TEMPLATES, templateVars } from '~/utils/templates';
const active = ref(0);
const template = computed(() => TEMPLATES[active.value]);
</script>

<template>
  <section id="templates" class="overflow-hidden border-b border-line bg-forest-900 py-16 text-white sm:py-24">
    <div class="shell">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C9989]">Free storefronts</p>
          <h2 class="mt-3 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Not a template. <span class="text-accent">A storefront.</span></h2>
          <p class="mt-4 max-w-xl text-sm leading-relaxed text-[#BFD2C7]">Five designed starting points, all driven by the same catalog. Change your colour, logo and words — never touch code.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="(item, index) in TEMPLATES" :key="item.key" type="button" class="rounded-full border px-3.5 py-2 text-xs font-bold transition" :class="active === index ? 'border-accent bg-accent text-forest-900' : 'border-white/20 text-[#C7D8CE] hover:border-white/50'" @click="active = index">{{ item.name }}</button>
        </div>
      </div>

      <div class="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p class="text-2xl font-display font-bold">{{ template.name }}</p>
          <p class="mt-2 text-sm leading-relaxed text-[#A8C0B4]">{{ template.description }}</p>
          <p class="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-[#D5E4DB]"><Check class="h-3.5 w-3.5 text-accent" /> {{ template.vibe }}</p>
          <div class="mt-6 flex flex-wrap gap-2">
            <span v-for="feature in ['SSR + fast', 'WhatsApp checkout', 'Paystack payments', 'Open Graph previews']" :key="feature" class="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-[#A8C0B4]">{{ feature }}</span>
          </div>
          <BaseButton to="/register" variant="secondary" size="md" class="mt-7">Get this style free <ExternalLink class="h-4 w-4" /></BaseButton>
        </div>

        <div class="relative">
          <div class="absolute -inset-3 rotate-2 rounded-[2rem] border border-white/10" />
          <div class="relative overflow-hidden rounded-[1.5rem] border border-white/20 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,.7)]" :style="templateVars(template)">
            <div class="flex items-center gap-1.5 border-b px-4 py-2.5" style="background: var(--sf-surface); border-color: color-mix(in srgb, var(--sf-ink) 12%, transparent)">
              <span class="h-2 w-2 rounded-full bg-[#FF5A5F]" /><span class="h-2 w-2 rounded-full bg-[#FFBD2E]" /><span class="h-2 w-2 rounded-full bg-[#27C93F]" />
              <span class="mx-auto rounded-md px-3 py-1 text-[9px]" style="background: color-mix(in srgb, var(--sf-ink) 5%, transparent); color: var(--sf-muted)">tolathrift.ojaly.org</span>
            </div>
            <div class="min-h-[420px] p-5 sm:p-7" :style="{ background: template.colors.background, color: template.colors.ink, fontFamily: template.fonts.body }">
              <div class="flex items-center justify-between">
                <span class="font-bold" :style="{ fontFamily: template.fonts.display, fontSize: '18px' }">Tola Thrift.</span>
                <span class="rounded-full px-3 py-1 text-[9px] font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">Shop now</span>
              </div>
              <div class="mt-10" :class="template.layout === 'centered' ? 'text-center' : ''">
                <p class="text-[9px] font-bold uppercase tracking-[0.2em]" :style="{ color: template.colors.primary }">Fresh drops every Friday</p>
                <h3 class="mt-2 max-w-[320px] font-bold leading-[0.95] tracking-[-0.05em]" :class="template.layout === 'centered' ? 'mx-auto' : ''" :style="{ fontFamily: template.fonts.display, fontSize: '44px' }">Campus fits.<br>Campus prices.</h3>
                <p class="mt-3 max-w-[280px] text-[11px] leading-relaxed" :class="template.layout === 'centered' ? 'mx-auto' : ''" :style="{ color: template.colors.muted }">Hand-picked thrift and streetwear for students who want to look expensive on a student budget.</p>
              </div>
              <div class="mt-8 grid grid-cols-3 gap-2">
                <div v-for="(label, index) in ['Hoodie', 'Cap', 'Tee']" :key="label" class="overflow-hidden rounded-[var(--sf-radius)] border" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)` }">
                  <div class="flex h-24 items-center justify-center" :style="{ background: index === 0 ? template.colors.ink : index === 1 ? template.colors.primary : template.colors.accent }">
                    <span class="font-bold text-[24px] opacity-80" :style="{ color: template.colors.onPrimary, fontFamily: template.fonts.display }">{{ label[0] }}</span>
                  </div>
                  <div class="p-2" :style="{ background: template.colors.surface }"><p class="text-[9px] font-bold">{{ label }}</p><p class="text-[8px]" :style="{ color: template.colors.muted }">₦12,500</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
