import { ref } from 'vue';
import { uploadsApi } from '~/api/factories/uploadsApi';

export function useUpload() {
  const uploading = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);

  async function upload(file: File, purpose: 'products' | 'logo' | 'banner' | 'receipts' | 'avatar' | 'expenses' | 'lookbook' | 'story') {
    uploading.value = true;
    progress.value = 0;
    error.value = null;
    try {
      const result = await uploadsApi.upload(file, purpose, (pct) => { progress.value = pct; });
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed.';
      throw err;
    } finally {
      uploading.value = false;
    }
  }

  async function uploadVideo(file: File) {
    uploading.value = true;
    progress.value = 0;
    error.value = null;
    try {
      const result = await uploadsApi.uploadVideo(file, (pct) => { progress.value = pct; });
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed.';
      throw err;
    } finally { uploading.value = false; }
  }

  return { uploading, progress, error, upload, uploadVideo };
}
