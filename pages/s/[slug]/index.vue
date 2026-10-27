<script setup lang="ts">
definePageMeta({ layout: false });
const route = useRoute();
const config = useRuntimeConfig();
const slug = computed(() => String(route.params.slug));
const { data, error } = await useStorefrontHome(slug);
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Storefront not found', fatal: true });
const business = computed(() => data.value!.business);
const template = computed(() => data.value!.template);
const ogImage = computed(() => business.value.bannerUrl || business.value.logoUrl || `${config.public.appUrl}/pwa-512.png`);
useSeoMeta({
  title: computed(() => business.value.seoTitle || `${business.value.name} — shop online`),
  description: computed(() => business.value.seoDescription || business.value.tagline),
  ogTitle: computed(() => business.value.seoTitle || business.value.name),
  ogDescription: computed(() => business.value.seoDescription || business.value.tagline),
  ogImage: computed(() => ogImage.value),
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: computed(() => business.value.name),
  twitterDescription: computed(() => business.value.tagline),
  twitterImage: computed(() => ogImage.value),
});
useHead({
  titleTemplate: '%s',
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: business.value.name,
      description: business.value.seoDescription || business.value.tagline,
      image: ogImage.value,
      telephone: business.value.publicPhone || undefined,
      address: business.value.address || undefined,
      url: `${config.public.appUrl}/s/${business.value.slug}`,
    })),
  }],
});
</script>

<template>
  <StorefrontShell v-if="data" :business="data.business" :template="data.template">
    <StorefrontHomeSections :home="data" />
  </StorefrontShell>
</template>
