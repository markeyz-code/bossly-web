<script setup lang="ts">
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-vue-next';
import { whatsappLink } from '~/utils/phone';
definePageMeta({ layout: false });
const route = useRoute();
const toast = useToast();
const slug = computed(() => String(route.params.slug));
const { data, error } = await useStorefrontHome(slug);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Storefront not found', fatal: true });
const business = computed(() => data.value!.business);
const template = computed(() => data.value!.template);
const { contact } = useStorefrontCheckout(business.value.slug);
const form = reactive({ name: '', phone: '', email: '', message: '' });
const sending = ref(false);
const sent = ref(false);
const wa = computed(() => whatsappLink(business.value.whatsappNumber || business.value.publicPhone, `Hi ${business.value.name}! I have a question.`));
useSeoMeta({ title: computed(() => `Contact — ${business.value.name}`), description: computed(() => `Contact ${business.value.name}. Message on WhatsApp or send a note.`), ogType: 'website' });
useHead({ titleTemplate: '%s' });
async function submit() {
  if (!form.name || !form.phone || !form.message) { toast.error('Name, phone and message are required.'); return; }
  sending.value = true;
  try { await contact(form); sent.value = true; form.name = ''; form.phone = ''; form.email = ''; form.message = ''; }
  catch (err) { toast.error((err as Error).message); }
  finally { sending.value = false; }
}
</script>

<template>
  <StorefrontShell v-if="data" :business="business" :template="template">
    <div class="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: template.colors.primary }">Say hello</p>
          <h1 class="mt-2 font-display text-5xl font-bold tracking-[-0.05em]" :style="{ color: template.colors.ink }">Let's talk.</h1>
          <p class="mt-3 text-sm leading-relaxed" :style="{ color: template.colors.muted }">Sizing, delivery, custom orders — send a message and a real human from {{ business.name }} will reply.</p>
          <div class="mt-7 space-y-3">
            <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="flex items-center gap-3 rounded-2xl p-4 text-sm font-bold" :style="{ background: '#25D366', color: '#06231A', borderRadius: template.radius }"><MessageCircle class="h-5 w-5" /> Chat on WhatsApp <span class="ml-auto text-[10px] opacity-60">Fastest</span></a>
            <a v-if="business.publicPhone" :href="`tel:${business.publicPhone}`" class="flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: template.colors.ink }"><Phone class="h-4 w-4" /> {{ business.publicPhone }}</a>
            <a v-if="business.email" :href="`mailto:${business.email}`" class="flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: template.colors.ink }"><Mail class="h-4 w-4" /> {{ business.email }}</a>
            <p v-if="business.address" class="flex items-start gap-3 rounded-2xl border p-4 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 15%, transparent)`, color: template.colors.ink }"><MapPin class="mt-0.5 h-4 w-4 shrink-0" /> {{ business.address }}</p>
          </div>
        </div>
        <div class="rounded-2xl border p-5 sm:p-6" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 12%, transparent)`, background: template.colors.surface, borderRadius: template.radius }">
          <div v-if="sent" class="py-10 text-center">
            <CheckCircle2 class="mx-auto h-12 w-12" :style="{ color: template.colors.primary }" />
            <h2 class="mt-3 font-display text-2xl font-bold" :style="{ color: template.colors.ink }">Message sent.</h2>
            <p class="mt-1 text-sm" :style="{ color: template.colors.muted }">They'll get back to you. For a faster reply, use WhatsApp.</p>
            <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="mt-5 inline-flex rounded-full px-5 py-3 text-xs font-bold" :style="{ background: template.colors.primary, color: template.colors.onPrimary }">Open WhatsApp</a>
          </div>
          <form v-else class="space-y-3" @submit.prevent="submit">
            <h2 class="font-display text-xl font-bold" :style="{ color: template.colors.ink }">Send a message</h2>
            <label class="block"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Your name *</span><input v-model="form.name" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }"></label>
            <label class="block"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Phone number *</span><input v-model="form.phone" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }" inputmode="tel"></label>
            <label class="block"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Email (optional)</span><input v-model="form.email" type="email" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }"></label>
            <label class="block"><span class="mb-1 block text-[11px] font-bold" :style="{ color: template.colors.ink }">Message *</span><textarea v-model="form.message" rows="4" class="w-full rounded-xl border px-3 py-3 text-sm" :style="{ borderColor: `color-mix(in srgb, ${template.colors.ink} 18%, transparent)`, background: template.colors.background, color: template.colors.ink }" placeholder="What can we help with?"></textarea></label>
            <button type="submit" class="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full text-sm font-bold disabled:opacity-50" :style="{ background: template.colors.primary, color: template.colors.onPrimary }" :disabled="sending">{{ sending ? 'Sending…' : 'Send message' }} <Send v-if="!sending" class="h-4 w-4" /></button>
          </form>
        </div>
      </div>
    </div>
  </StorefrontShell>
</template>
