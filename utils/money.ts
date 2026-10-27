export function formatNaira(kobo: number | null | undefined, opts: { compact?: boolean; withSymbol?: boolean; decimals?: boolean } = {}): string {
  const naira = (Number(kobo) || 0) / 100;
  const compact = opts.compact ?? false;
  const decimals = opts.decimals ?? !Number.isInteger(naira);
  const formatted = new Intl.NumberFormat('en-NG', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : decimals ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(naira);
  return `${opts.withSymbol === false ? '' : '₦'}${formatted}`;
}

export function nairaToKobo(value: string | number): number {
  if (typeof value === 'number') return Math.round(value * 100);
  const cleaned = value.replace(/[₦,\s]/g, '');
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function koboToNaira(kobo: number | null | undefined): number {
  return Math.round(Number(kobo) || 0) / 100;
}

export function nairaInput(kobo: number | null | undefined): string {
  const naira = koboToNaira(kobo);
  return naira ? String(naira) : '';
}

export function percent(value: number | null | undefined): string {
  const n = Number(value) || 0;
  return `${n > 0 ? '+' : ''}${n}%`;
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
