export function useOnboarding() {
  const store = useBusinessStore();
  const loading = ref(false);
  async function load() { loading.value = true; try { return await store.refreshOnboarding(); } finally { loading.value = false; } }
  async function markProfitSeen() {
    if (store.onboarding?.steps.find((s) => s.key === 'profit')?.done) return;
    try { await store.markStep('profit'); } catch { /* non-blocking */ }
  }
  return { onboarding: computed(() => store.onboarding), loading, load, markProfitSeen };
}
