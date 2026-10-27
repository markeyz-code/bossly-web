<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const props = withDefaults(defineProps<{
  variant?: Variant;
  size?: Size;
  type?: 'button' | 'submit' | 'reset';
  to?: string;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  target?: string;
}>(), { variant: 'primary', size: 'md', type: 'button', loading: false, disabled: false, block: false });

const emit = defineEmits<{ click: [MouseEvent] }>();

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-[0_3px_0_0_#8F290B] active:translate-y-[2px] active:shadow-[0_1px_0_0_#8F290B]',
  secondary: 'bg-forest-900 text-white hover:bg-forest-800 shadow-[0_3px_0_0_#FF5A1F] active:translate-y-[2px] active:shadow-none dark:bg-accent dark:text-forest-900 dark:shadow-[0_3px_0_0_#FF5A1F]',
  outline: 'border-2 border-ink bg-transparent text-ink hover:bg-raised',
  ghost: 'bg-transparent text-ink hover:bg-raised',
  danger: 'bg-danger text-white hover:brightness-90',
  dark: 'bg-ink text-canvas hover:opacity-90',
};
const sizes: Record<Size, string> = {
  sm: 'min-h-[40px] px-3.5 text-[13px] rounded-xl gap-1.5',
  md: 'min-h-[48px] px-5 text-sm rounded-2xl gap-2',
  lg: 'min-h-[54px] px-7 text-base rounded-2xl gap-2.5',
  icon: 'h-11 w-11 rounded-xl justify-center',
};
const cls = computed(() => [
  'inline-flex items-center justify-center font-bold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50',
  variants[props.variant],
  sizes[props.size],
  props.block ? 'w-full' : '',
]);
</script>

<template>
  <NuxtLink v-if="to && !disabled" :to="to" :class="cls" :target="target">
    <slot /><slot name="icon" />
  </NuxtLink>
  <a v-else-if="href && !disabled" :href="href" :class="cls" :target="target" rel="noopener">
    <slot /><slot name="icon" />
  </a>
  <button v-else :type="type" :class="cls" :disabled="disabled || loading" @click="emit('click', $event)">
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot v-else /><slot name="icon" />
  </button>
</template>
