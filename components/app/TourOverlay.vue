<script setup lang="ts">
import { ArrowLeft, ArrowRight, X } from 'lucide-vue-next';
const { activeTour, step, stepIndex, isLast, next, previous, stop } = useTour();
const targetRect = ref<DOMRect | null>(null);
const bubbleStyle = ref<Record<string, string>>({});
const highlightStyle = ref<Record<string, string>>({});
const ready = ref(false);
const nextButton = ref<HTMLButtonElement | null>(null);
let timers: Array<ReturnType<typeof setTimeout>> = [];

function measure() {
  if (!import.meta.client || !step.value) return;
  const selector = step.value.target ? `[data-tour="${step.value.target}"]` : '';
  const element = selector ? document.querySelector<HTMLElement>(selector) : null;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const bubbleWidth = Math.min(360, viewportWidth - 24);

  if (!element) {
    targetRect.value = null;
    highlightStyle.value = {};
    bubbleStyle.value = {
      position: 'fixed', left: '50%', top: '50%', width: `${bubbleWidth}px`,
      transform: 'translate(-50%, -50%)', zIndex: '110',
    };
    ready.value = true;
    return;
  }

  const rect = element.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > viewportHeight) element.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const refreshed = element.getBoundingClientRect();
  targetRect.value = refreshed;
  highlightStyle.value = {
    position: 'fixed',
    top: `${Math.max(6, refreshed.top - 6)}px`,
    left: `${Math.max(6, refreshed.left - 6)}px`,
    width: `${Math.min(viewportWidth - 12, refreshed.width + 12)}px`,
    height: `${Math.min(viewportHeight - 12, refreshed.height + 12)}px`,
    borderRadius: '18px',
    boxShadow: '0 0 0 9999px rgba(4, 20, 14, 0.72)',
    border: '2px solid rgba(255,255,255,0.65)',
    pointerEvents: 'none',
    zIndex: '100',
  };

  const placement = step.value.placement || 'bottom';
  const bubbleHeight = 245;
  const gap = 16;
  let left = Math.min(Math.max(12, refreshed.left + refreshed.width / 2 - bubbleWidth / 2), viewportWidth - bubbleWidth - 12);
  let top = refreshed.bottom + gap;
  if (placement === 'top' || (placement !== 'bottom' && refreshed.bottom + bubbleHeight + gap > viewportHeight)) {
    top = refreshed.top - bubbleHeight - gap;
  }
  if (placement === 'left' && refreshed.left > bubbleWidth + 24) {
    left = refreshed.left - bubbleWidth - gap;
    top = Math.max(12, refreshed.top);
  }
  if (placement === 'right' && refreshed.right + bubbleWidth + 24 < viewportWidth) {
    left = refreshed.right + gap;
    top = Math.max(12, refreshed.top);
  }
  top = Math.min(Math.max(12, top), viewportHeight - bubbleHeight - 12);
  bubbleStyle.value = { position: 'fixed', left: `${left}px`, top: `${top}px`, width: `${bubbleWidth}px`, zIndex: '110' };
  ready.value = true;
}

function scheduleMeasure() {
  ready.value = false;
  timers.forEach(clearTimeout);
  timers = [setTimeout(measure, 120), setTimeout(measure, 450), setTimeout(measure, 900)];
}

function onKey(event: KeyboardEvent) {
  if (!activeTour.value) return;
  if (event.key === 'Escape') { event.preventDefault(); stop(); }
  if (event.key === 'ArrowRight') { event.preventDefault(); void next(); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); void previous(); }
}

watch(() => [activeTour.value?.id, stepIndex.value, step.value?.route], () => {
  scheduleMeasure();
  nextTick(() => setTimeout(() => nextButton.value?.focus({ preventScroll: true }), 300));
}, { immediate: true });

onMounted(() => {
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', measure, true);
});
onBeforeUnmount(() => {
  timers.forEach(clearTimeout);
  document.removeEventListener('keydown', onKey);
  window.removeEventListener('resize', measure);
  window.removeEventListener('scroll', measure, true);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="tour-fade">
      <div v-if="activeTour && step" class="pointer-events-none fixed inset-0 z-[100]" role="dialog" aria-modal="true" :aria-label="`${activeTour.title} tour`">
        <div v-if="!targetRect" class="absolute inset-0 bg-forest-900/70" />
        <div v-if="targetRect" :style="highlightStyle" aria-hidden="true" />
        <div :style="bubbleStyle" class="pointer-events-auto rounded-3xl border border-white/15 bg-[#0B2319] p-5 text-white shadow-2xl ring-1 ring-black/20">
          <div class="flex items-center justify-between gap-3">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300">{{ activeTour.title }} · {{ stepIndex + 1 }}/{{ activeTour.steps.length }}</p>
            <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close tour" @click="stop"><X class="h-4 w-4" /></button>
          </div>
          <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/15"><div class="h-full rounded-full bg-brand-400 transition-all" :style="{ width: `${((stepIndex + 1) / activeTour.steps.length) * 100}%` }" /></div>
          <h2 class="mt-4 font-display text-xl font-bold tracking-tight">{{ step.title }}</h2>
          <p class="mt-2 text-[13px] leading-relaxed text-white/70">{{ step.body }}</p>
          <div class="mt-5 flex items-center gap-2">
            <button v-if="stepIndex > 0" type="button" class="flex min-h-[42px] items-center gap-1.5 rounded-xl border border-white/15 px-3 text-xs font-bold text-white/80 hover:bg-white/10" @click="previous"><ArrowLeft class="h-3.5 w-3.5" /> Back</button>
            <button type="button" class="ml-auto text-[11px] font-semibold text-white/50 hover:text-white" @click="stop">Skip tour</button>
            <button ref="nextButton" type="button" class="flex min-h-[42px] items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-xs font-bold text-white hover:bg-brand-400" @click="next">{{ isLast ? 'Finish' : 'Next' }} <ArrowRight class="h-3.5 w-3.5" /></button>
          </div>
          <p v-if="!targetRect && ready" class="mt-3 text-[10px] text-white/40">This part of the screen is not visible on this device — the tour will continue.</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tour-fade-enter-active, .tour-fade-leave-active { transition: opacity .18s ease; }
.tour-fade-enter-from, .tour-fade-leave-to { opacity: 0; }
</style>
