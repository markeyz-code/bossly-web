<script setup lang="ts">
import { ArrowLeft, MailCheck } from 'lucide-vue-next';
import { emailSchema } from '~/utils/validators';
definePageMeta({ layout: 'auth' });
useSeoMeta({ title: 'Reset your password' });
const auth = useAuth();
const email = ref('');
const error = ref('');
const sent = ref(false);
const loading = ref(false);
async function submit() {
  error.value = '';
  const parsed = emailSchema.safeParse(email.value);
  if (!parsed.success) { error.value = parsed.error.issues[0].message; return; }
  loading.value = true;
  try { await auth.forgotPassword(email.value); sent.value = true; }
  catch (err) { error.value = (err as Error).message; }
  finally { loading.value = false; }
}
</script>

<template>
  <div>
    <NuxtLink to="/login" class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" /> Back to sign in</NuxtLink>
    <div v-if="sent" class="mt-8 text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"><MailCheck class="h-8 w-8" /></div>
      <h1 class="mt-5 font-display text-3xl font-bold tracking-tight">Check your inbox</h1>
      <p class="mt-2 text-sm leading-relaxed text-muted">If an account exists for <strong>{{ email }}</strong>, a reset link is on its way. It expires in one hour.</p>
      <BaseButton to="/login" variant="outline" class="mt-6">Back to sign in</BaseButton>
    </div>
    <div v-else>
      <h1 class="mt-6 font-display text-4xl font-bold tracking-[-0.045em]">Forgot your password?</h1>
      <p class="mt-2 text-sm text-muted">It happens. Enter your email and we’ll send a reset link.</p>
      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <BaseInput v-model="email" label="Email address" type="email" placeholder="you@example.com" :error="error" autocomplete="email" />
        <BaseButton type="submit" block size="lg" :loading="loading">Send reset link</BaseButton>
      </form>
      <p class="mt-5 text-xs leading-relaxed text-muted">No email after a few minutes? Check spam, or message us on WhatsApp and we’ll sort it out.</p>
    </div>
  </div>
</template>
