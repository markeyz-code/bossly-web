<script setup lang="ts">
import { Film, Loader2, Trash2, UploadCloud } from 'lucide-vue-next';
import { useToast } from '~/composables/useToast';

const props = defineProps<{ modelValue?: string | null; label?: string; hint?: string }>();
const emit = defineEmits<{ 'update:modelValue': [string | null] }>();
const toast = useToast();
const { uploading, progress, uploadVideo } = useUpload();
const fileInput = ref<HTMLInputElement | null>(null);

async function handle(file: File | undefined) {
  if (!file) return;
  try {
    const result = await uploadVideo(file);
    emit('update:modelValue', result.url);
    toast.success('Video uploaded.');
  } catch (error) { toast.error((error as Error).message); }
  if (fileInput.value) fileInput.value.value = '';
}
</script>

<template>
  <div>
    <label v-if="label" class="label-base">{{ label }}</label>
    <p v-if="hint" class="mb-2 text-xs text-muted">{{ hint }}</p>
    <div v-if="modelValue" class="relative overflow-hidden rounded-2xl border border-line bg-black">
      <video :src="modelValue" class="aspect-video w-full object-cover" controls muted playsinline preload="metadata" />
      <button type="button" class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white" aria-label="Remove video" @click="emit('update:modelValue', null)"><Trash2 class="h-4 w-4" /></button>
    </div>
    <button v-else type="button" class="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface text-muted transition hover:border-brand hover:text-brand" :disabled="uploading" @click="fileInput?.click()">
      <Loader2 v-if="uploading" class="h-6 w-6 animate-spin" /><UploadCloud v-else class="h-6 w-6" />
      <span class="text-[11px] font-semibold">{{ uploading ? `Uploading ${progress}%` : 'Upload a short hero video' }}</span>
      <span class="text-[10px]">MP4, WebM or MOV · max 50MB</span>
    </button>
    <div v-if="uploading" class="mt-2 h-1.5 overflow-hidden rounded-full bg-raised"><div class="h-full rounded-full bg-brand-500 transition-all" :style="{ width: `${progress}%` }" /></div>
    <div v-if="!modelValue && !uploading" class="mt-2 flex items-center gap-1.5 text-[11px] text-muted"><Film class="h-3.5 w-3.5" /> A 5–10 second clip makes fashion and food stores feel alive.</div>
    <input ref="fileInput" type="file" accept="video/mp4,video/webm,video/quicktime" class="sr-only" @change="handle(($event.target as HTMLInputElement).files?.[0])">
  </div>
</template>
