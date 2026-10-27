<script setup lang="ts">
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-vue-next';
import { optimizedImage } from '~/utils/cloudinary';
import { useToast } from '~/composables/useToast';

const props = withDefaults(defineProps<{
  modelValue?: string | string[] | null;
  purpose: 'products' | 'logo' | 'banner' | 'receipts' | 'avatar' | 'expenses' | 'lookbook' | 'story';
  label?: string;
  hint?: string;
  multiple?: boolean;
  max?: number;
  aspect?: 'square' | 'video' | 'banner' | 'free';
}>(), { multiple: false, max: 5, aspect: 'square' });

const emit = defineEmits<{ 'update:modelValue': [string | string[] | null] }>();
const { uploading, progress, upload } = useUpload();
const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

const values = computed<string[]>(() => {
  if (!props.modelValue) return [];
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
});
const aspectClass = computed(() => ({
  square: 'aspect-square', video: 'aspect-video', banner: 'aspect-[3/1]', free: 'aspect-[4/3]',
}[props.aspect]));

async function handleFiles(files: FileList | null) {
  if (!files?.length) return;
  const remaining = props.multiple ? props.max - values.value.length : 1;
  const selected = Array.from(files).slice(0, Math.max(0, remaining));
  for (const file of selected) {
    if (!file.type.startsWith('image/')) { toast.error('Choose an image file.'); continue; }
    try {
      const result = await upload(file, props.purpose);
      if (props.multiple) emit('update:modelValue', [...values.value, result.url].slice(0, props.max));
      else emit('update:modelValue', result.url);
      toast.success('Image uploaded.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed.');
    }
  }
  if (fileInput.value) fileInput.value.value = '';
}
function removeAt(index: number) {
  if (props.multiple) emit('update:modelValue', values.value.filter((_, i) => i !== index));
  else emit('update:modelValue', null);
}
function onDrop(event: DragEvent) { dragging.value = false; void handleFiles(event.dataTransfer?.files || null); }
</script>

<template>
  <div>
    <label v-if="label" class="label-base">{{ label }}</label>
    <p v-if="hint" class="mb-2 text-xs text-muted">{{ hint }}</p>
    <div class="flex flex-wrap gap-3">
      <div v-for="(url, index) in values" :key="url" class="group relative overflow-hidden rounded-2xl border border-line bg-raised" :class="[aspectClass, multiple ? 'w-28' : 'w-full max-w-xs']">
        <img :src="optimizedImage(url, 500)" alt="Uploaded image" class="h-full w-full object-cover" loading="lazy">
        <button type="button" class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-forest-900/80 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 focus:opacity-100" aria-label="Remove image" @click="removeAt(index)">
          <Trash2 class="h-4 w-4" />
        </button>
        <span v-if="index === 0 && multiple" class="absolute bottom-2 left-2 rounded-full bg-forest-900/80 px-2 py-0.5 text-[10px] font-bold text-white">COVER</span>
      </div>

      <button
        v-if="(multiple && values.length < max) || (!multiple && !values.length)"
        type="button"
        class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface text-muted transition hover:border-brand hover:text-brand"
        :class="[aspectClass, multiple ? 'w-28' : 'w-full max-w-xs']"
        :disabled="uploading"
        @click="fileInput?.click()"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <Loader2 v-if="uploading" class="h-6 w-6 animate-spin" />
        <UploadCloud v-else class="h-6 w-6" />
        <span class="px-2 text-center text-[11px] font-semibold">{{ uploading ? `Uploading ${progress}%` : 'Tap to upload' }}</span>
        <span v-if="!multiple && !uploading" class="px-3 text-center text-[10px]">JPG, PNG or WebP · compressed automatically</span>
      </button>
    </div>
    <div v-if="uploading" class="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
      <div class="h-full rounded-full bg-brand-500 transition-all" :style="{ width: `${progress}%` }" />
    </div>
    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :multiple="multiple" @change="handleFiles(($event.target as HTMLInputElement).files)">
    <div v-if="!values.length && !uploading" class="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
      <ImagePlus class="h-3.5 w-3.5" /> Products with photos sell faster. A clean phone photo is enough.
    </div>
  </div>
</template>
