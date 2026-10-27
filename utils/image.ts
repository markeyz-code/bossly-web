export interface CompressOptions { maxWidth?: number; maxHeight?: number; quality?: number; }

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
  const maxWidth = opts.maxWidth ?? 1600;
  const maxHeight = opts.maxHeight ?? 1600;
  const quality = opts.quality ?? 0.78;
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  if (file.size < 180 * 1024) return file;
  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const ratio = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  bitmap.close?.();
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, '.webp');
  return new File([blob], name, { type: 'image/webp', lastModified: Date.now() });
}

export function imageSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
