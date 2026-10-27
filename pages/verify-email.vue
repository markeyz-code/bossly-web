<script setup lang="ts">
import { CheckCircle2, Loader2, MailWarning } from 'lucide-vue-next';
definePageMeta({ layout: 'auth' });
useSeoMeta({ title: 'Verify your email' });
const route = useRoute();
const auth = useAuth();
const loading = ref(true);
const verified = ref(false);
const error = ref('');
const resending = ref(false);
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '');
async function verify() {
  if (!token.value) { loading.value = false; error.value = 'This verification link is missing its token.'; return; }
  try { await auth.verifyEmail(token.value); verified.value = true; await auth.fetchMe().catch(() => undefined); }
  catch (err) { error.value = (err as Error).message; }
  finally { loading.value = false; }
}
async function resend() {
  resending.value = true;
  try { await auth.resendVerification(); useToast().success('A fresh verification email is on its way.'); }
  catch (err) { error.value = (err as Error).message; }
  finally { resending.value = false; }
}
onMounted(verify);
</script>

<template>
  <div class="text-center">
    <div v-if="loading" class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-raised"><Loader2 class="h-8 w-8 animate-spin text-brand-500" /></div>
    <div v-else-if="verified" class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"><CheckCircle2 class="h-8 w-8" /></div>
    <div v-else class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 text-warning"><MailWarning class="h-8 w-8" /></div>
    <h1 class="mt-5 font-display text-3xl font-bold tracking-tight">{{ loading ? 'Checking your link…' : verified ? 'Email confirmed' : 'That link didn’t work' }}</h1>
    <p class="mt-2 text-sm leading-relaxed text-muted">{{ loading ? 'One second.' : verified ? 'Your account is secure. Receipts and reminders can now reach you.' : error }}</p>
    <div v-if="!loading" class="mt-6 flex flex-col gap-2">
      <BaseButton v-if="verified" to="/app" size="lg" block>Go to my dashboard</BaseButton>
      <template v-else>
        <BaseButton :loading="resending" size="lg" block @click="resend">Send a fresh link</BaseButton>
        <BaseButton to="/login" variant="ghost" block>Back to sign in</BaseButton>
      </template>
    </div>
  </div>
</template>
