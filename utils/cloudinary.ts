export function optimizedImage(url?: string | null, width = 800): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
}

export function cloudinaryOriginal(url?: string | null): string {
  if (!url) return '';
  return url;
}
