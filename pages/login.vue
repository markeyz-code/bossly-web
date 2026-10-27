<script setup lang="ts">
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-vue-next';
import { loginSchema, zodErrors } from '~/utils/validators';
definePageMeta({ layout: 'auth' });
useSeoMeta({ title: 'Sign in', description: 'Sign in to your Bossly business dashboard.' });
const route = useRoute();
const router = useRouter();
const auth = useAuth();
const businessStore = useBusinessStore();
const toast = useToast();
const form = reactive({ email: '', password: '' });
const errors = reactive<Record<string, string>>({});
const showPassword = ref(false);
const serverError = ref('');

async function submit() {
  serverError.value = '';
  Object.keys(errors).forEach((k) => delete errors[k]);
  const parsed = loginSchema.safeParse(form);
  if (!parsed.success) { Object.assign(errors, zodErrors(parsed.error)); return; }
  try {
    await auth.login({ email: form.email, password: form.password });
    businessStore.reset();
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/app') ? route.query.redirect : '/app';
    await router.push(redirect);
  } catch (error) {
    serverError.value = (error as Error).message;
  }
}
function useDemo() {
  form.email = 'demo@bossly.ng';
  form.password = 'Demo12345';
  toast.info('Demo account filled. Tap sign in.');
}
</script>

<template>
  <div>
    <div class="mb-8">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"><Sparkles class="h-3.5 w-3.5" /> Welcome back, boss</span>
      <h1 class="mt-4 font-display text-4xl font-bold tracking-[-0.045em]">Your numbers missed you.</h1>
      <p class="mt-2 text-sm leading-relaxed text-muted">Sign in to see today's profit, stock and who owes you.</p>
    </div>
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <BaseInput v-model="form.email" label="Email address" type="email" autocomplete="email" placeholder="you@example.com" :error="errors.email" required>
        <template #suffix><Mail class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /></template>
      </BaseInput>
      <div>
        <BaseInput v-model="form.password" label="Password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Your password" :error="errors.password" required>
          <template #suffix>
            <button type="button" class="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" class="h-4 w-4" /><Eye v-else class="h-4 w-4" />
            </button>
          </template>
        </BaseInput>
        <div class="mt-2 text-right"><NuxtLink to="/forgot-password" class="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">Forgot password?</NuxtLink></div>
      </div>
      <div v-if="serverError" class="rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs font-medium text-danger" role="alert">{{ serverError }}</div>
      <BaseButton type="submit" block size="lg" :loading="auth.loading">Sign in <LockKeyhole class="h-4 w-4" /></BaseButton>
    </form>
    <div class="mt-6 flex items-center gap-3"><span class="h-px flex-1 bg-line" /><span class="text-[10px] font-bold uppercase tracking-wider text-muted">or</span><span class="h-px flex-1 bg-line" /></div>
    <button type="button" class="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-sm font-bold transition hover:bg-raised" @click="useDemo"><Sparkles class="h-4 w-4 text-brand-500" /> Try the demo business</button>
    <p class="mt-6 text-center text-sm text-muted">New to Bossly? <NuxtLink to="/register" class="font-bold text-ink underline decoration-brand decoration-2 underline-offset-4">Create your business</NuxtLink></p>
  </div>
</template>
