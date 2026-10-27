import type { StorefrontTemplate } from '~/types';

export const TEMPLATES: StorefrontTemplate[] = [
  {
    key: 'lagos-pop', name: 'Lagos Pop', description: 'Bold orange, deep green, big type. Made for fashion and culture.',
    vibe: 'Loud, confident, unmistakably Lagos.',
    colors: { ink: '#06231A', background: '#FBF7EF', surface: '#FFFFFF', primary: '#FF5A1F', accent: '#F5D547', muted: '#5F6B64', onPrimary: '#FFFFFF' },
    fonts: { display: 'Space Grotesk', body: 'DM Sans' }, layout: 'split', heroStyle: 'block', cardStyle: 'rounded', radius: '24px', motif: 'dots', isPaid: false,
  },
  {
    key: 'market-bright', name: 'Market Bright', description: 'Sunny yellow, cobalt blue and a market-day bounce.',
    vibe: 'Cheerful, busy, full of life.',
    colors: { ink: '#10243E', background: '#FFF8E1', surface: '#FFFFFF', primary: '#1F4FD8', accent: '#FFC93C', muted: '#5D6575', onPrimary: '#FFFFFF' },
    fonts: { display: 'Bricolage Grotesque', body: 'DM Sans' }, layout: 'centered', heroStyle: 'ticker', cardStyle: 'rounded', radius: '20px', motif: 'stripes', isPaid: false,
  },
  {
    key: 'editorial-green', name: 'Editorial Green', description: 'Cream paper, forest green, quiet confidence.',
    vibe: 'Considered, premium, grown.',
    colors: { ink: '#0B2B1C', background: '#F3EFE4', surface: '#FBF9F3', primary: '#0B3D2E', accent: '#C9A227', muted: '#65705F', onPrimary: '#FBF9F3' },
    fonts: { display: 'Fraunces', body: 'DM Sans' }, layout: 'editorial', heroStyle: 'type', cardStyle: 'editorial', radius: '6px', motif: 'lines', isPaid: true,
  },
  {
    key: 'midnight-studio', name: 'Midnight Studio', description: 'Black, acid lime, sharp edges. For tech, sneakers and streetwear.',
    vibe: 'Late-night, future-facing, cool.',
    colors: { ink: '#F4F4EC', background: '#0A0A0A', surface: '#141414', primary: '#C8FF00', accent: '#8B5CF6', muted: '#A3A39A', onPrimary: '#0A0A0A' },
    fonts: { display: 'Space Grotesk', body: 'DM Sans' }, layout: 'poster', heroStyle: 'photo', cardStyle: 'dark', radius: '12px', motif: 'grid', isPaid: true,
  },
  {
    key: 'soft-serve', name: 'Soft Serve', description: 'Blush pink, cocoa and soft curves. Beauty, food and self-care.',
    vibe: 'Warm, gentle, a little playful.',
    colors: { ink: '#3B2528', background: '#FFF1F0', surface: '#FFFFFF', primary: '#E85D75', accent: '#F4B860', muted: '#80686B', onPrimary: '#FFFFFF' },
    fonts: { display: 'Fraunces', body: 'DM Sans' }, layout: 'soft', heroStyle: 'stack', cardStyle: 'soft', radius: '32px', motif: 'blobs', isPaid: true,
  },
];

export function getTemplate(key?: string | null): StorefrontTemplate {
  return TEMPLATES.find((t) => t.key === key) || TEMPLATES[0];
}

export function templateVars(template: StorefrontTemplate): Record<string, string> {
  return {
    '--sf-ink': template.colors.ink,
    '--sf-bg': template.colors.background,
    '--sf-surface': template.colors.surface,
    '--sf-primary': template.colors.primary,
    '--sf-accent': template.colors.accent,
    '--sf-muted': template.colors.muted,
    '--sf-on-primary': template.colors.onPrimary,
    '--sf-radius': template.radius,
  };
}
