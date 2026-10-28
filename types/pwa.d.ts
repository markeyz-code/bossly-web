/**
 * Local declaration for the virtual #pwa composables used by @vite-pwa/nuxt.
 * Nuxt generates the implementation at build time; this keeps `nuxt typecheck`
 * deterministic when the generated alias is not included in the TS program.
 */
declare module '#pwa' {
  export function useTransparentPwaIcon(image: unknown): { icon: Record<string, unknown> };
  export function useMaskablePwaIcon(image: unknown): { icon: Record<string, unknown> };
  export function useFaviconPwaIcon(image: unknown): { icon: Record<string, unknown> };
  export function useApplePwaIcon(image: unknown): { icon: Record<string, unknown> };
  export function useAppleSplashScreenPwaIcon(image: unknown): { icon: Record<string, unknown> };
}
