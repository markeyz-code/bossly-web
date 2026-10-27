<script setup lang="ts">
withDefaults(defineProps<{ loading?: boolean; compact?: boolean; stickyHeader?: boolean }>(), { loading: false, compact: false, stickyHeader: false });
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-line bg-surface">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead class="border-b border-line bg-raised/70">
          <slot name="head" />
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="20" class="px-4 py-10 text-center">
              <div class="mx-auto flex max-w-sm flex-col items-center gap-3">
                <div class="skeleton h-4 w-40" />
                <div class="skeleton h-4 w-64" />
                <div class="skeleton h-4 w-52" />
              </div>
            </td>
          </tr>
          <slot v-else name="body" />
        </tbody>
      </table>
    </div>
    <slot name="footer" />
  </div>
</template>
