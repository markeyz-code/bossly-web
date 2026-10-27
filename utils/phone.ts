export function normalizeNigerianPhone(input?: string | null): string | null {
  if (!input) return null;
  let digits = String(input).replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = `234${digits.slice(1)}`;
  if (digits.startsWith('234') && digits.length === 13) return digits;
  if (digits.length === 10 && /^[789]/.test(digits)) return `234${digits}`;
  return null;
}

export function prettyPhone(input?: string | null): string {
  const n = normalizeNigerianPhone(input);
  if (!n) return input || '';
  return `+${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`;
}

export function whatsappLink(phone?: string | null, message = ''): string {
  const n = normalizeNigerianPhone(phone) || String(phone || '').replace(/\D/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${n}${text}`;
}

export function isNigerianPhone(value: string): boolean {
  return Boolean(normalizeNigerianPhone(value));
}
