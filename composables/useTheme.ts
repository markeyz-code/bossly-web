import { computed } from 'vue';

export function useTheme() {
  const isDark = useState<boolean>('ojaly-dark', () => false);

  function apply() {
    if (!import.meta.client) return;
    document.documentElement.classList.toggle('dark', isDark.value);
    document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light';
    localStorage.setItem('ojaly.theme', isDark.value ? 'dark' : 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', isDark.value ? '#0A0F0C' : '#06231A');
  }

  function init() {
    if (!import.meta.client) return;
    const stored = localStorage.getItem('ojaly.theme');
    isDark.value = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply();
  }

  function toggle() {
    isDark.value = !isDark.value;
    apply();
  }

  return { isDark: computed(() => isDark.value), toggle, init };
}
