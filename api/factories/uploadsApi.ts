import { http } from '~/config/axios';
import type { UploadSignature } from '~/types';
import { compressImage } from '~/utils/image';
import { optimizedImage } from '~/utils/cloudinary';

class UploadsApi {
  async upload(file: File, purpose: 'products' | 'logo' | 'banner' | 'receipts' | 'avatar' | 'expenses' | 'lookbook' | 'story', onProgress?: (pct: number) => void): Promise<{ url: string; optimizedUrl: string }> {
    const isLogo = purpose === 'logo';
    const compressed = await compressImage(file, { maxWidth: isLogo ? 800 : 1800, maxHeight: isLogo ? 800 : 1800, quality: 0.8 });
    if (compressed.size > 8 * 1024 * 1024) throw new Error('That image is still over 8MB after compression. Choose a smaller file.');
    const signResponse = await http().post('/uploads/sign', { purpose });
    const signature: UploadSignature = signResponse.data.data;
    const form = new FormData();
    form.append('file', compressed);
    form.append('api_key', signature.apiKey);
    form.append('timestamp', String(signature.timestamp));
    form.append('folder', signature.folder);
    form.append('signature', signature.signature);
    const url = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', signature.uploadUrl);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText) as { secure_url?: string; error?: { message?: string } };
          if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) resolve(data.secure_url);
          else reject(new Error(data.error?.message || 'Upload failed. Try again.'));
        } catch {
          reject(new Error('Upload failed. Try again.'));
        }
      };
      xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
      xhr.send(form);
    });
    return { url, optimizedUrl: optimizedImage(url, 1200) };
  }

  async uploadVideo(file: File, onProgress?: (pct: number) => void): Promise<{ url: string }> {
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) throw new Error('Choose an MP4, WebM or MOV video.');
    if (file.size > 50 * 1024 * 1024) throw new Error('Video must be under 50MB.');
    const signResponse = await http().post('/uploads/sign', { purpose: 'video' });
    const signature: UploadSignature = signResponse.data.data;
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signature.apiKey);
    form.append('timestamp', String(signature.timestamp));
    form.append('folder', signature.folder);
    form.append('signature', signature.signature);
    const url = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', signature.uploadUrl);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText) as { secure_url?: string; error?: { message?: string } };
          if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) resolve(data.secure_url);
          else reject(new Error(data.error?.message || 'Video upload failed.'));
        } catch { reject(new Error('Video upload failed.')); }
      };
      xhr.onerror = () => reject(new Error('Video upload failed. Check your connection.'));
      xhr.send(form);
    });
    return { url };
  }
}
export const uploadsApi = new UploadsApi();
