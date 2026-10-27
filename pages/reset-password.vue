<script setup lang="ts">
import { Eye, EyeOff, ShieldCheck } from 'lucide-vue-next';
import { passwordSchema } from '~/utils/validators';
definePageMeta({ layout: 'auth' });
useSeoMeta({ title: 'Choose a new password' });
const auth = useAuth();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '');
const password = ref('');
const confirm = ref('');
const show = ref(false);
const loading = ref(false);
const error = ref('');
const done = ref(false);
const invite = computed(() => route.query.invite === '1');
async function submit() {
  error.value = '';
  const parsed = passwordSchema.safeParse(password.value);
  if (!parsed.success) { error.value = parsed.error.issues[0].message; return; }
  if (password.value !== confirm.value) { error.value = 'The passwords do not match.'; return; }
  if (!token.value) { error.value = 'This link is missing its token. Request a new one.'; return; }
  loading.value = true;
  try {
    await auth.resetPassword(token.value, password.value);
    done.value = true;
    toast.success('Password changed. You can sign in now.');
    setTimeout(() => router.push('/login'), 1200);
  } catch (err) { error.value = (err as Error).message; }
  finally { loading.value = false; }
}
</script>

<template>
  <div>
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><ShieldCheck class="h-7 w-7" /></div>
    <h1 class="mt-5 font-display text-4xl font-bold tracking-[-0.045em]">{{ done ? 'You’re back in.' : invite ? 'Welcome to the team.' : 'Choose a new password.' }}</h1>
    <p class="mt-2 text-sm text-muted">{{ done ? 'Taking you to sign in…' : invite ? 'Set a password for your staff account. Then sign in and get to work.' : 'Make it strong. At least 8 characters with a number.' }}</p>
    <form v-if="!done" class="mt-6 space-y-4" @submit.prevent="submit">
      <BaseInput v-model="password" label="New password" :type="show ? 'text' : 'password'" autocomplete="new-password" :error="error" />
      <BaseInput v-model="confirm" label="Confirm new password" :type="show ? 'text' : 'password'" autocomplete="new-password" />
      <label class="flex items-center gap-2 text-xs font-medium text-muted"><input v-model="show" type="checkbox" class="accent-brand-500"> Show passwords</label>
      <BaseButton type="submit" block size="lg" :loading="loading">Set new password</BaseButton>
    </form>
    <BaseButton v-else to="/login" block size="lg">Go to sign in</BaseButton>
  </div>
</template>
