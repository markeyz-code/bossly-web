<script setup lang="ts">
const { data: plans } = await usePublicPlans();
useSeoMeta({
  title: 'Ojaly — run your business. Know your money.',
  description: 'Ojaly is the operating system for ambitious Nigerian businesses. Track real profit, stock, debts and expenses — and turn your catalogue into a free storefront.',
  ogTitle: 'Ojaly — run your business. Know your money.',
  ogDescription: 'Track real profit, stock, debts and expenses. Your catalogue becomes a free storefront. Built for Nigerian businesses that run on WhatsApp.',
  ogType: 'website',
  ogUrl: 'https://ojaly.org',
  twitterCard: 'summary_large_image',
});
useHead({
  link: [{ rel: 'canonical', href: 'https://ojaly.org' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Ojaly',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Business management and free storefronts for ambitious Nigerian businesses.',
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
