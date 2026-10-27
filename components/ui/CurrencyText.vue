<script setup lang="ts">
import { formatNaira } from '~/utils/money';
withDefaults(defineProps<{ value: number | null | undefined; compact?: boolean; colored?: boolean; symbol?: boolean }>(), { compact: false, colored: false, symbol: true });
</script>

<template>
  <span :class="colored ? (Number(value) >= 0 ? 'text-success' : 'text-danger') : ''">{{ formatNaira(value, { compact, withSymbol: symbol }) }}</span>
</template>
