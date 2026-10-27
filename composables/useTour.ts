import { TOURS, getTour } from '~/utils/tours';

const STORAGE_KEY = 'bossly.tours.completed';

export function useTour() {
  const activeId = useState<string | null>('tour-active', () => null);
  const stepIndex = useState<number>('tour-step', () => 0);
  const completed = useState<string[]>('tour-completed', () => []);
  const router = useRouter();

  const activeTour = computed(() => (activeId.value ? getTour(activeId.value) : undefined));
  const step = computed(() => activeTour.value?.steps[stepIndex.value]);
  const isLast = computed(() => Boolean(activeTour.value && stepIndex.value >= activeTour.value.steps.length - 1));

  function hydrateProgress() {
    if (!import.meta.client) return;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
      if (Array.isArray(stored)) completed.value = stored;
    } catch { completed.value = []; }
  }

  function persistProgress() {
    if (!import.meta.client) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(completed.value)); } catch { /* storage can be full/blocked */ }
  }

  function markCompleted(id: string) {
    if (!completed.value.includes(id)) completed.value = [...completed.value, id];
    persistProgress();
  }

  async function goTo(index: number) {
    const tour = activeTour.value;
    if (!tour) return;
    const next = Math.max(0, Math.min(index, tour.steps.length - 1));
    stepIndex.value = next;
    const targetRoute = tour.steps[next]?.route;
    if (targetRoute && router.currentRoute.value.fullPath !== targetRoute) {
      await router.push(targetRoute);
    }
    await nextTick();
  }

  async function start(id: string) {
    const tour = getTour(id);
    if (!tour?.steps.length) return;
    activeId.value = id;
    stepIndex.value = 0;
    if (router.currentRoute.value.fullPath !== tour.steps[0].route) await router.push(tour.steps[0].route);
    await nextTick();
  }

  async function next() {
    if (!activeTour.value) return;
    if (isLast.value) { markCompleted(activeTour.value.id); stop(); return; }
    await goTo(stepIndex.value + 1);
  }

  async function previous() { await goTo(stepIndex.value - 1); }

  function stop() {
    activeId.value = null;
    stepIndex.value = 0;
  }

  return { tours: TOURS, activeId, activeTour, step, stepIndex, isLast, completed, start, next, previous, stop, markCompleted, hydrateProgress };
}
