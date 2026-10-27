<script setup lang="ts">
useHead({ titleTemplate: (title) => title ? `${title} · Bossly` : 'Bossly — run your student business' });
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#FF5A1F" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
    <PwaInstallPrompt />
  </div>
</template>
