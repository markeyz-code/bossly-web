<script setup lang="ts">
import { ArrowDown, ArrowUp, Check, Copy, ExternalLink, Eye, Globe2, Image as ImageIcon, Images, LayoutTemplate, Link2, Lock, Palette, Plus, Rocket, Save, Search, Settings, Sparkles, Trash2 } from 'lucide-vue-next';
import type { Business } from '~/types';
import { templateVars } from '~/utils/templates';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'My website' });
const toast = useToast();
const builder = useBuilder();
const businessStore = useBusinessStore();
const activeTab = ref<'design' | 'content' | 'media' | 'sections' | 'contact' | 'seo'>('design');
const draft = reactive<Partial<Business>>({});
const dirty = ref(false);
const savingLocal = ref(false);
const sectionLabels: Record<string, { label: string; hint: string }> = {
  hero: { label: 'Hero', hint: 'Big first impression with your tagline and CTA.' },
  featured: { label: 'Featured products', hint: 'Four products handpicked at the top.' },
  story: { label: 'Your story', hint: 'About the business and why it exists.' },
  lookbook: { label: 'Lookbook', hint: 'A media-first gallery of products in the wild.' },
  categories: { label: 'Categories', hint: 'Let shoppers jump to what they want.' },
  products: { label: 'All products', hint: 'The full catalogue, up to eight on the home page.' },
  testimonials: { label: 'Why shop with you', hint: 'Trust points, not fake reviews.' },
  contact: { label: 'Contact strip', hint: 'A strong final CTA with your details.' },
};
const allTemplates = computed(() => builder.data.value?.templates || []);
const currentTemplate = computed(() => allTemplates.value.find((t) => t.key === draft.templateKey) || allTemplates.value[0] || null);
const colors = ['#FF5A1F', '#0B3D2E', '#1F4FD8', '#E85D75', '#8B5CF6', '#C8FF00', '#D97706', '#0F766E'];
const socialFields = [{ key: 'instagram', label: 'Instagram' }, { key: 'tiktok', label: 'TikTok' }, { key: 'twitter', label: 'X / Twitter' }, { key: 'facebook', label: 'Facebook' }, { key: 'website', label: 'Other website' }];
const embedCopied = ref(false);
const lookbookUrls = computed<string[]>({
  get: () => (draft.lookbook || []).map((item) => item.url),
  set: (urls) => { draft.lookbook = urls.slice(0, 8).map((url, index) => ({ url, caption: draft.lookbook?.[index]?.caption || '' })); },
});

function hydrate() {
  const b = builder.data.value?.business;
  if (!b) return;
  Object.assign(draft, {
    name: b.name, tagline: b.tagline, description: b.description, about: b.about, logoUrl: b.logoUrl,
    bannerUrl: b.bannerUrl, heroVideoUrl: b.heroVideoUrl, storyImageUrl: b.storyImageUrl, lookbookTitle: b.lookbookTitle || 'The lookbook', lookbook: [...(b.lookbook || [])], brandColor: b.brandColor, templateKey: b.templateKey, sections: [...(b.sections || [])],
    socialLinks: { ...(b.socialLinks || {}) }, publicPhone: b.publicPhone, whatsappNumber: b.whatsappNumber,
    email: b.email, address: b.address, seoTitle: b.seoTitle, seoDescription: b.seoDescription,
  });
  dirty.value = false;
}
watch(draft, () => { if (builder.data.value) dirty.value = true; }, { deep: true });
function moveSection(index: number, direction: -1 | 1) {
  const sections = [...(draft.sections || [])];
  const target = index + direction;
  if (target < 0 || target >= sections.length) return;
  [sections[index], sections[target]] = [sections[target], sections[index]];
  draft.sections = sections;
}
function removeSection(key: string) { draft.sections = (draft.sections || []).filter((s) => s !== key); }
function addSection(key: string) { draft.sections = [...(draft.sections || []), key]; }
const availableToAdd = computed(() => Object.keys(sectionLabels).filter((key) => !(draft.sections || []).includes(key)));
async function save(showToast = true) {
  if (!builder.data.value) return;
  savingLocal.value = true;
  try {
    await builder.update({
      name: draft.name, tagline: draft.tagline, description: draft.description, about: draft.about,
      logoUrl: draft.logoUrl, bannerUrl: draft.bannerUrl, heroVideoUrl: draft.heroVideoUrl || null, storyImageUrl: draft.storyImageUrl || null, lookbookTitle: draft.lookbookTitle, lookbook: draft.lookbook, brandColor: draft.brandColor, templateKey: draft.templateKey,
      sections: draft.sections, socialLinks: draft.socialLinks, publicPhone: draft.publicPhone,
      whatsappNumber: draft.whatsappNumber, email: draft.email, address: draft.address,
      seoTitle: draft.seoTitle, seoDescription: draft.seoDescription,
    });
    dirty.value = false;
    await businessStore.load(true).catch(() => undefined);
    if (showToast) toast.success('Website saved.');
    return true;
  } catch (error) { toast.error((error as Error).message); return false; }
  finally { savingLocal.value = false; }
}
async function publish() {
  if (dirty.value) { const ok = await save(false); if (!ok) return; }
  try { const result = await builder.publish(); toast.success('Your website is live. Share the link everywhere.'); await businessStore.load(true).catch(() => undefined); return result; }
  catch (error) { toast.error((error as Error).message); }
}
async function unpublish() {
  try { await builder.unpublish(); toast.info('Storefront unpublished. Your back office is unaffected.'); await businessStore.load(true).catch(() => undefined); }
  catch (error) { toast.error((error as Error).message); }
}
async function copyEmbed() {
  const snippet = builder.data.value?.urls.embedScript;
  if (!snippet) return;
  await navigator.clipboard.writeText(snippet).catch(() => undefined);
  embedCopied.value = true; toast.success('Embed code copied.');
  setTimeout(() => { embedCopied.value = false; }, 2500);
}
async function copyLink() {
  if (!builder.data.value) return;
  await navigator.clipboard.writeText(`${window.location.origin}${builder.data.value.urls.path}`).catch(() => undefined);
  toast.success('Storefront link copied.');
}
onMounted(async () => { await builder.load(); hydrate(); });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="My website" subtitle="Your catalog is the website. Pick a look, tweak the words, publish." eyebrow="Free storefront">
      <template #actions>
        <BaseButton v-if="builder.data.value" :to="builder.data.value.urls.path" target="_blank" variant="outline"><Eye class="h-4 w-4" /> View live</BaseButton>
        <BaseButton variant="outline" :loading="savingLocal" :disabled="!dirty" @click="save()"><Save class="h-4 w-4" /> Save</BaseButton>
        <BaseButton v-if="builder.data.value?.business.storefrontPublished" variant="ghost" @click="unpublish">Unpublish</BaseButton>
        <BaseButton v-else :loading="builder.publishing.value" @click="publish"><Rocket class="h-4 w-4" /> Publish</BaseButton>
      </template>
    </PageHeader>

    <div v-if="builder.loading.value && !builder.data.value" class="grid gap-4 lg:grid-cols-[380px_1fr]"><div class="skeleton h-[600px] rounded-3xl" /><div class="skeleton h-[600px] rounded-3xl" /></div>
    <div v-else-if="!builder.data.value" class="card p-6"><p class="font-bold">Could not load your website builder.</p><BaseButton size="sm" class="mt-3" @click="builder.load().then(hydrate)">Try again</BaseButton></div>
    <template v-else-if="currentTemplate">
      <div class="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-3">
        <BaseBadge :variant="builder.data.value.business.storefrontPublished ? 'success' : 'warning'" dot>{{ builder.data.value.business.storefrontPublished ? 'Live' : 'Draft' }}</BaseBadge>
        <span class="text-xs text-muted">{{ builder.data.value.urls.subdomain }}</span>
        <button class="ml-auto inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-300" @click="copyLink"><Copy class="h-3.5 w-3.5" /> Copy link</button>
        <span v-if="dirty" class="rounded-full bg-warning/10 px-2 py-1 text-[10px] font-bold text-warning">Unsaved changes</span>
      </div>

      <div class="grid gap-5 xl:grid-cols-[390px_1fr]">
        <div class="space-y-4">
          <div class="scrollbar-none flex gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1">
            <button v-for="tab in [{ key: 'design', label: 'Design', icon: Palette }, { key: 'content', label: 'Content', icon: ImageIcon }, { key: 'media', label: 'Media', icon: Images }, { key: 'sections', label: 'Sections', icon: LayoutTemplate }, { key: 'contact', label: 'Contact', icon: Link2 }, { key: 'seo', label: 'SEO', icon: Search }]" :key="tab.key" class="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold" :class="activeTab === tab.key ? 'bg-ink text-canvas' : 'text-muted hover:bg-raised'" @click="activeTab = tab.key as typeof activeTab"><component :is="tab.icon" class="h-3.5 w-3.5" />{{ tab.label }}</button>
          </div>

          <BaseCard v-if="activeTab === 'design'" padding="sm">
            <h2 class="font-display text-lg font-bold">Template</h2>
            <p class="text-[11px] text-muted">Every template is a data-driven layout. No code.</p>
            <div class="mt-3 grid grid-cols-2 gap-2" data-tour="website-templates">
              <button v-for="template in allTemplates" :key="template.key" type="button" class="relative overflow-hidden rounded-xl border-2 p-2 text-left transition" :class="draft.templateKey === template.key ? 'border-ink' : 'border-line hover:border-muted'" :disabled="!template.available" @click="draft.templateKey = template.key">
                <div class="h-16 overflow-hidden rounded-lg p-2" :style="{ background: template.colors.background, color: template.colors.ink }"><p class="text-[9px] font-bold" :style="{ color: template.colors.primary }">TOLA THRIFT</p><div class="mt-1 grid grid-cols-2 gap-1"><span class="h-6 rounded" :style="{ background: template.colors.ink }" /><span class="h-6 rounded" :style="{ background: template.colors.primary }" /></div></div>
                <p class="mt-1.5 text-[10px] font-bold">{{ template.name }}</p>
                <span v-if="!template.available" class="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-forest-900/90 px-2 py-1 text-[8px] font-bold text-white"><Lock class="h-2.5 w-2.5" /> Paid</span>
                <span v-if="draft.templateKey === template.key" class="absolute bottom-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-canvas"><Check class="h-2.5 w-2.5" /></span>
              </button>
            </div>
            <div class="mt-5"><label class="label-base">Brand colour</label><div class="flex flex-wrap gap-2"><button v-for="color in colors" :key="color" type="button" class="h-8 w-8 rounded-full border-2" :class="draft.brandColor === color ? 'border-ink ring-2 ring-brand/30' : 'border-white'" :style="{ background: color }" :aria-label="`Use ${color}`" @click="draft.brandColor = color" /><label class="flex h-8 items-center gap-1 rounded-full border border-line px-3 text-[10px] font-bold"><input v-model="draft.brandColor" type="color" class="h-4 w-4 border-0 bg-transparent p-0"> Custom</label></div></div>
            <div class="mt-4"><ImageUploader v-model="draft.logoUrl" purpose="logo" label="Logo" hint="Square works best. Optional." aspect="square" /></div>
            <div class="mt-4"><ImageUploader v-model="draft.bannerUrl" purpose="banner" label="Banner (optional)" aspect="banner" /></div>
          </BaseCard>

          <BaseCard v-else-if="activeTab === 'content'" padding="sm">
            <h2 class="font-display text-lg font-bold">Your words</h2>
            <div class="mt-3 space-y-3">
              <BaseInput v-model="draft.name" label="Business name" />
              <BaseInput v-model="draft.tagline" label="Tagline" hint="Short. Human. Shown in the hero." />
              <BaseTextarea v-model="draft.description" label="Short description" :rows="3" />
              <BaseTextarea v-model="draft.about" label="Your story" :rows="6" hint="Why you started, how you source, why people should care." />
            </div>
          </BaseCard>

          <BaseCard v-else-if="activeTab === 'media'" padding="sm">
            <h2 class="font-display text-lg font-bold">Rich media</h2>
            <p class="text-[11px] text-muted">Give customers something to feel. Video, a story image and a lookbook.</p>
            <div class="mt-4 space-y-4">
              <VideoUploader v-model="draft.heroVideoUrl" label="Hero video" hint="Used in the hero instead of the banner image. Keep it under 10 seconds." />
              <ImageUploader v-model="draft.storyImageUrl" purpose="story" label="Story image" hint="A behind-the-scenes photo for the story section." aspect="banner" />
              <div>
                <ImageUploader v-model="lookbookUrls" purpose="lookbook" label="Lookbook images" hint="Up to 8 lifestyle photos. The first becomes the large feature." aspect="square" multiple :max="8" />
                <div v-if="(draft.lookbook || []).length" class="mt-2 space-y-2">
                  <div v-for="(item, index) in draft.lookbook" :key="item.url" class="flex items-center gap-2">
                    <img :src="item.url" alt="" class="h-9 w-9 rounded-lg object-cover">
                    <input v-model="item.caption" maxlength="160" class="input-base h-9 min-h-0 flex-1 py-1.5 text-xs" :placeholder="`Caption ${index + 1} (optional)`">
                  </div>
                </div>
                <div class="mt-3"><BaseInput v-model="draft.lookbookTitle" label="Lookbook heading" placeholder="In the wild" /></div>
              </div>
            </div>
          </BaseCard>

          <BaseCard v-else-if="activeTab === 'sections'" padding="sm">
            <h2 class="font-display text-lg font-bold">Sections & order</h2>
            <p class="text-[11px] text-muted">Top to bottom, exactly how customers scroll.</p>
            <div class="mt-3 space-y-2">
              <div v-for="(section, index) in draft.sections" :key="section" class="flex items-center gap-2 rounded-xl border border-line p-2.5">
                <span class="flex h-6 w-6 items-center justify-center rounded-md bg-raised text-[9px] font-bold">{{ index + 1 }}</span>
                <div class="min-w-0 flex-1"><p class="text-[11px] font-bold">{{ sectionLabels[section]?.label || section }}</p><p class="truncate text-[9px] text-muted">{{ sectionLabels[section]?.hint }}</p></div>
                <button class="flex h-7 w-7 items-center justify-center rounded-md hover:bg-raised disabled:opacity-20" :disabled="index === 0" aria-label="Move up" @click="moveSection(index, -1)"><ArrowUp class="h-3.5 w-3.5" /></button>
                <button class="flex h-7 w-7 items-center justify-center rounded-md hover:bg-raised disabled:opacity-20" :disabled="index === (draft.sections?.length || 0) - 1" aria-label="Move down" @click="moveSection(index, 1)"><ArrowDown class="h-3.5 w-3.5" /></button>
                <button class="flex h-7 w-7 items-center justify-center rounded-md text-danger hover:bg-danger/5" aria-label="Remove section" @click="removeSection(section)"><Trash2 class="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div v-if="availableToAdd.length" class="mt-3 flex flex-wrap gap-1.5"><button v-for="section in availableToAdd" :key="section" class="rounded-full border border-line px-2.5 py-1.5 text-[10px] font-bold hover:border-ink" @click="addSection(section)"><Plus class="mr-0.5 inline h-3 w-3" />{{ sectionLabels[section].label }}</button></div>
          </BaseCard>

          <BaseCard v-else-if="activeTab === 'contact'" padding="sm">
            <h2 class="font-display text-lg font-bold">Contact & socials</h2>
            <div class="mt-3 space-y-3">
              <BaseInput v-model="draft.whatsappNumber" label="WhatsApp number" inputmode="tel" hint="This powers the order button and cart checkout." />
              <BaseInput v-model="draft.publicPhone" label="Public phone" inputmode="tel" />
              <BaseInput v-model="draft.email" label="Public email" type="email" />
              <BaseInput v-model="draft.address" label="Address" />
              <div v-for="social in socialFields" :key="social.key"><BaseInput v-model="(draft.socialLinks as Record<string,string>)[social.key]" :label="social.label" placeholder="https://" /></div>
            </div>
          </BaseCard>

          <BaseCard v-else padding="sm">
            <h2 class="font-display text-lg font-bold">Search & sharing</h2>
            <p class="text-[11px] text-muted">This is what shows on Google and when someone drops your link in WhatsApp.</p>
            <div class="mt-3 space-y-3">
              <BaseInput v-model="draft.seoTitle" label="SEO title" :maxlength="70" hint="Keep it under 60 characters." />
              <BaseTextarea v-model="draft.seoDescription" label="SEO description" :rows="3" :maxlength="160" hint="Around 150 characters. Say what you sell and where." />
              <div class="rounded-xl border border-line bg-raised/50 p-3"><p class="text-[9px] font-bold uppercase tracking-wider text-muted">WhatsApp preview</p><p class="mt-1 truncate text-xs font-bold">{{ draft.seoTitle || draft.name }}</p><p class="line-clamp-2 text-[10px] text-muted">{{ draft.seoDescription || draft.tagline }}</p></div>
            </div>
            <div class="mt-5 border-t border-line pt-4">
              <div class="flex items-center gap-2"><Globe2 class="h-4 w-4 text-brand-500" /><h3 class="font-display text-base font-bold">Custom domain</h3><Lock v-if="!builder.data.value.plan.entitlements.customDomain" class="h-3.5 w-3.5 text-muted" /></div>
              <p class="mt-1 text-[11px] text-muted">Connect shop.yourname.com on the Boss plan.</p>
              <div v-if="builder.data.value.plan.entitlements.customDomain" class="mt-2 flex flex-wrap items-center gap-2"><span class="rounded-lg bg-raised px-2 py-1 text-[10px] font-semibold">{{ builder.data.value.business.customDomain || 'Not connected' }}</span><NuxtLink to="/app/settings?tab=domain" class="text-[10px] font-bold text-brand-600 dark:text-brand-300">Manage domain →</NuxtLink></div>
              <BaseButton v-else to="/app/settings?tab=billing" size="sm" variant="outline" class="mt-2">Upgrade to Boss</BaseButton>
            </div>
            <div class="mt-4 border-t border-line pt-4">
              <h3 class="font-display text-base font-bold">Embed on your existing site</h3>
              <p class="mt-1 text-[11px] text-muted">Paste this before &lt;/body&gt;. Renders a floating order button.</p>
              <pre class="mt-2 overflow-x-auto rounded-xl bg-forest-900 p-3 text-[9px] leading-relaxed text-[#C7D8CE]">{{ builder.data.value.urls.embedScript }}</pre>
              <BaseButton size="sm" variant="outline" class="mt-2" @click="copyEmbed"><Check v-if="embedCopied" class="h-3.5 w-3.5 text-success" /><Copy v-else class="h-3.5 w-3.5" /> {{ embedCopied ? 'Copied' : 'Copy embed code' }}</BaseButton>
            </div>
          </BaseCard>

          <div class="flex gap-2"><BaseButton block variant="outline" :loading="savingLocal" :disabled="!dirty" @click="save()"><Save class="h-4 w-4" /> Save changes</BaseButton><BaseButton v-if="!builder.data.value.business.storefrontPublished" block :loading="builder.publishing.value" @click="publish"><Rocket class="h-4 w-4" /> Publish</BaseButton></div>
        </div>

        <div class="xl:sticky xl:top-[84px] xl:self-start">
          <StorefrontPreview :business="draft" :template="currentTemplate" :products="builder.data.value.products" :slug="builder.data.value.business.slug" />
          <div class="mt-3 grid gap-2 sm:grid-cols-2">
            <a :href="builder.data.value.urls.path" target="_blank" class="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-[11px] font-bold"><ExternalLink class="h-3.5 w-3.5" /> Open storefront</a>
            <NuxtLink to="/app/settings?tab=domain" class="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-[11px] font-bold"><Settings class="h-3.5 w-3.5" /> Domain settings</NuxtLink>
          </div>
          <p class="mt-3 text-center text-[10px] text-muted"><Sparkles class="mr-1 inline h-3 w-3 text-brand-500" /> Live preview updates as you type. Save to make it permanent.</p>
        </div>
      </div>
    </template>
  </div>
</template>
