<script setup lang="ts">
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-vue-next';
definePageMeta({ layout: false });
useSeoMeta({ title: 'Opening business app', robots: 'noindex,nofollow' });
const router = useRouter();
const auth = useAuth();
const error = ref('');
const opening = ref(true);

onMounted(async () => {
  try {
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    const businessId = params.get('businessId') || '';
    history.replaceState(null, '', window.location.pathname);
    if (!token) throw new Error('This impersonation link is missing its secure token.');
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number; impersonatorId?: string; businessId?: string };
    if (!payload.impersonatorId) throw new Error('This is not an impersonation token.');
    if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new Error('This impersonation link has expired. Ask the admin to generate a new one.');
    await auth.acceptImpersonation({
      token,
      businessId,
      userName: 'Business owner',
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    await router.replace('/app');
  } catch (err) {
    auth.clearSession();
    error.value = (err as Error).message;
    opening.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-forest-900 px-4 text-white">
    <div class="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
      <template v-if="opening">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-forest-900"><ShieldAlert class="h-7 w-7" /></div>
        <h1 class="mt-4 font-display text-2xl font-bold">Opening the business app</h1>
        <p class="mt-2 text-sm text-white/60">You are entering as the business owner through a short-lived, audited support session.</p>
        <Loader2 class="mx-auto mt-5 h-6 w-6 animate-spin text-accent" />
      </template>
      <template v-else>
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/20 text-danger"><AlertTriangle class="h-7 w-7" /></div>
        <h1 class="mt-4 font-display text-2xl font-bold">Could not open the session</h1>
        <p class="mt-2 text-sm text-white/60">{{ error }}</p>
        <a href="/login" class="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-forest-900">Go to sign in</a>
      </template>
    </div>
  </div>
</template>
