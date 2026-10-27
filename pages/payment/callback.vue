<script setup lang="ts">
import { CheckCircle2, Clock, XCircle } from 'lucide-vue-next';
definePageMeta({ layout: false });
const route = useRoute();
const router = useRouter();
const reference = computed(() => typeof route.query.reference === 'string' ? route.query.reference : '');
const verification = usePaymentVerification();
const status = verification.status;
const nextUrl = verification.nextUrl;
const message = verification.message;
useSeoMeta({ title: 'Payment status', robots: 'noindex' });
onMounted(async () => {
  if (!reference.value) { status.value = 'failed'; message.value = 'No payment reference was provided.'; return; }
  await verification.verify(reference.value);
  if (status.value === 'success' && nextUrl.value) setTimeout(() => { void router.push(nextUrl.value as string); }, 2800);
});
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-canvas p-4">
    <div class="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lift">
      <template v-if="status === 'checking'"><div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-raised"><Clock class="h-8 w-8 animate-pulse text-brand-500" /></div><h1 class="mt-4 font-display text-2xl font-bold">Checking your payment…</h1><p class="mt-1 text-sm text-muted">Hold on, we're confirming it with Paystack.</p></template>
      <template v-else-if="status === 'success'"><CheckCircle2 class="mx-auto h-16 w-16 text-success" /><h1 class="mt-4 font-display text-2xl font-bold">Payment confirmed</h1><p class="mt-1 text-sm text-muted">Thank you. The business has been updated automatically.</p><NuxtLink v-if="nextUrl" :to="nextUrl" class="mt-5 inline-flex rounded-full bg-brand-500 px-5 py-3 text-xs font-bold text-white">Continue</NuxtLink></template>
      <template v-else-if="status === 'pending'"><Clock class="mx-auto h-16 w-16 text-warning" /><h1 class="mt-4 font-display text-2xl font-bold">Still processing</h1><p class="mt-1 text-sm text-muted">{{ message }}</p><button class="mt-5 rounded-full bg-ink px-5 py-3 text-xs font-bold text-canvas" @click="router.go(0)">Check again</button></template>
      <template v-else><XCircle class="mx-auto h-16 w-16 text-danger" /><h1 class="mt-4 font-display text-2xl font-bold">Payment not confirmed</h1><p class="mt-1 text-sm text-muted">{{ message || 'Nothing was charged or the payment failed. You can try again from the original link.' }}</p><NuxtLink to="/" class="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-xs font-bold text-canvas">Back home</NuxtLink></template>
    </div>
  </div>
</template>
