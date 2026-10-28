<script setup lang="ts">
const { data: plans } = await usePublicPlans();
useSeoMeta({
  title: 'Run your student business. Get a free website.',
  description: 'The business management system for Nigerian student entrepreneurs. Track real profit, stock, debts and expenses — and get an auto-generated storefront for free.',
  ogTitle: 'Ojaly — run your student business. Get a free website.',
  ogDescription: 'Track real profit, stock, debts and expenses. Your catalog becomes a free storefront. Built for Nigerian student businesses.',
  ogType: 'website',
  ogUrl: 'https://ojaly.ng',
  twitterCard: 'summary_large_image',
});
useHead({
  link: [{ rel: 'canonical', href: 'https://ojaly.ng' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Ojaly',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Business management and free storefronts for Nigerian student entrepreneurs.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
    }),
  }],
});
definePageMeta({ layout: 'default' });
</script>

<template>
  <div>
    <LandingHero />
    <PainPoints />
    <HowItWorks />
    <FeatureGrid />
    <TemplateShowcase />
    <PricingSection :plans="plans || []" />
    <FaqSection />
    <FinalCta />
  </div>
</template>
