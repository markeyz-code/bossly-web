export function entityId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const entity = value as { id?: string; _id?: string };
  return String(entity.id || entity._id || '');
}

export function initials(name?: string | null): string {
  if (!name) return 'B';
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export function titleCase(value?: string | null): string {
  if (!value) return '';
  return value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
