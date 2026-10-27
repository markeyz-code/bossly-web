<script setup lang="ts">
import { Monitor, Smartphone } from 'lucide-vue-next';
import type { Business, Product, StorefrontBusiness, StorefrontHome, StorefrontProduct, StorefrontTemplate } from '~/types';
import { templateVars } from '~/utils/templates';
const props = defineProps<{ business: Partial<Business>; template: StorefrontTemplate; products: Product[]; slug: string }>();
const device = ref<'desktop' | 'mobile'>('desktop');
const mappedBusiness = computed<StorefrontBusiness>(() => ({
  id: props.business.id || 'preview', name: props.business.name || 'Your business', slug: props.slug,
  category: props.business.category || 'Fashion', description: props.business.description || '',
  logoUrl: props.business.logoUrl || null, bannerUrl: props.business.bannerUrl || null,
  heroVideoUrl: props.business.heroVideoUrl || null, storyImageUrl: props.business.storyImageUrl || null,
  lookbookTitle: props.business.lookbookTitle || 'The lookbook', lookbook: props.business.lookbook || [],
  tagline: props.business.tagline || 'Your tagline goes here', brandColor: props.business.brandColor || '#FF5A1F',
  templateKey: props.template.key, sections: props.business.sections || [], socialLinks: props.business.socialLinks || {},
  publicPhone: props.business.publicPhone || null, whatsappNumber: props.business.whatsappNumber || null,
  email: props.business.email || null, address: props.business.address || '', about: props.business.about || '',
  seoTitle: props.business.seoTitle || '', seoDescription: props.business.seoDescription || '', currency: 'NGN',
}));
const mappedProducts = computed<StorefrontProduct[]>(() => props.products.map((p) => ({
  id: p.id, name: p.name, description: p.description, category: p.category, images: p.images, tags: p.tags,
  priceKobo: p.priceKobo, inStock: p.quantity > 0, soldCount: p.soldCount,
  variants: p.variants.map((v) => ({ id: v.id || v._id || '', name: v.name, attributes: v.attributes || {}, priceKobo: v.priceKobo, imageUrl: v.imageUrl, inStock: v.quantity > 0, lowStock: v.quantity > 0 && v.quantity <= v.lowStockThreshold })),
})));
const home = computed<StorefrontHome>(() => ({
  business: mappedBusiness.value, template: props.template, products: mappedProducts.value,
  categories: [...new Set(mappedProducts.value.map((p) => p.category))], productCount: mappedProducts.value.length,
}));
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-line bg-raised/50">
    <div class="flex items-center justify-between gap-2 border-b border-line bg-surface px-3 py-2">
      <div class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-danger/60" /><span class="h-2 w-2 rounded-full bg-warning/60" /><span class="h-2 w-2 rounded-full bg-success/60" /><span class="ml-2 hidden rounded bg-raised px-2 py-0.5 text-[9px] text-muted sm:inline">{{ slug }}.bossly.ng</span></div>
      <div class="flex gap-1"><button class="rounded p-1.5" :class="device === 'desktop' ? 'bg-ink text-canvas' : 'text-muted'" aria-label="Desktop preview" @click="device = 'desktop'"><Monitor class="h-3.5 w-3.5" /></button><button class="rounded p-1.5" :class="device === 'mobile' ? 'bg-ink text-canvas' : 'text-muted'" aria-label="Mobile preview" @click="device = 'mobile'"><Smartphone class="h-3.5 w-3.5" /></button></div>
    </div>
    <div class="flex justify-center overflow-auto bg-[#D9D2C4] p-2 sm:p-4" style="max-height: 720px">
      <div class="pointer-events-none origin-top overflow-hidden bg-white shadow-xl transition-all" :class="device === 'mobile' ? 'w-[390px] rounded-[1.5rem]' : 'w-full rounded-lg'" :style="{ maxWidth: device === 'mobile' ? '390px' : '1100px' }">
        <div :style="templateVars(template)">
          <StorefrontHomeSections :home="home" />
        </div>
      </div>
    </div>
  </div>
</template>
