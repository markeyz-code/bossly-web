<script setup lang="ts">
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-vue-next';
import { useId } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string | null;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}>(), {
  placeholder: 'Select date',
  clearable: true,
});

const emit = defineEmits<{
  'update:modelValue': [string];
  change: [string];
}>();

const id = useId();
const trigger = ref<HTMLButtonElement | null>(null);
const open = ref(false);
const viewMode = ref<'days' | 'months'>('days');

const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());
const activeIso = ref('');
const menuStyle = ref<Record<string, string>>({});
const placement = ref<'bottom' | 'top'>('bottom');
const isMobile = ref(false);

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseIso(value?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return { year, month, day };
}

function iso(year: number, month: number, day: number) {
  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function todayParts() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

const selected = computed(() => parseIso(props.modelValue));
const minDate = computed(() => parseIso(props.min));
const maxDate = computed(() => parseIso(props.max));
const todayIso = computed(() => iso(todayParts().year, todayParts().month, todayParts().day));

const displayValue = computed(() => {
  const value = selected.value;
  if (!value) return props.placeholder;

  const dateObj = new Date(value.year, value.month, value.day, 12);
  const formatted = new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);

  const selectedIsoStr = props.modelValue;
  if (selectedIsoStr === todayIso.value) return `Today · ${formatted}`;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = iso(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  if (selectedIsoStr === tomorrowIso) return `Tomorrow · ${formatted}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = iso(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  if (selectedIsoStr === yesterdayIso) return `Yesterday · ${formatted}`;

  return formatted;
});

const monthLabel = computed(() => {
  return new Intl.DateTimeFormat('en-NG', { month: 'long', year: 'numeric' }).format(new Date(viewYear.value, viewMonth.value, 1));
});

function isDisabled(value: string) {
  if (props.min && value < props.min) return true;
  if (props.max && value > props.max) return true;
  return false;
}

// Preset shortcuts dynamically calculated based on current context (future vs past limits)
const presets = computed(() => {
  const list: { label: string; iso: string }[] = [];
  const now = new Date();

  // Helper
  const makePreset = (daysDiff: number, label: string) => {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysDiff);
    const targetIso = iso(target.getFullYear(), target.getMonth(), target.getDate());
    if (!isDisabled(targetIso)) {
      list.push({ label, iso: targetIso });
    }
  };

  // If max is today or in the past, prioritize past presets
  if (props.max && props.max <= todayIso.value) {
    makePreset(0, 'Today');
    makePreset(-1, 'Yesterday');
    makePreset(-7, 'Last 7d');
    makePreset(-30, 'Last 30d');
  } else {
    // Normal / Future oriented presets (due dates, orders, tasks)
    makePreset(0, 'Today');
    makePreset(1, 'Tomorrow');
    makePreset(3, '+3 Days');
    makePreset(7, '+1 Week');
    makePreset(14, '+2 Weeks');
    makePreset(30, '+1 Month');

    // End of current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfMonthIso = iso(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate());
    if (!isDisabled(endOfMonthIso) && !list.some((p) => p.iso === endOfMonthIso)) {
      list.push({ label: 'Month End', iso: endOfMonthIso });
    }
  }

  return list.slice(0, 5);
});

const cells = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(viewYear.value, viewMonth.value, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const value = iso(date.getFullYear(), date.getMonth(), date.getDate());
    return {
      iso: value,
      day: date.getDate(),
      inMonth: date.getMonth() === viewMonth.value,
      isToday: value === todayIso.value,
      isSelected: value === props.modelValue,
      isDisabled: isDisabled(value),
    };
  });
});

function updatePosition() {
  if (typeof window === 'undefined') return;
  isMobile.value = window.innerWidth < 640;

  if (isMobile.value) {
    menuStyle.value = {};
    return;
  }

  if (!trigger.value) return;
  const rect = trigger.value.getBoundingClientRect();
  const width = Math.min(348, window.innerWidth - 24);
  const height = 430;

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const place = spaceBelow < height + 12 && spaceAbove > spaceBelow ? 'top' : 'bottom';
  placement.value = place;

  const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12));
  menuStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    width: `${width}px`,
    zIndex: '150',
    ...(place === 'top'
      ? { bottom: `${window.innerHeight - rect.top + 6}px` }
      : { top: `${rect.bottom + 6}px` }),
  };
}

async function openMenu() {
  if (props.disabled || open.value) return;
  viewMode.value = 'days';
  isMobile.value = window.innerWidth < 640;
  open.value = true;
  const base = selected.value || (minDate.value && todayIso.value < props.min! ? minDate.value : todayParts());
  viewYear.value = base.year;
  viewMonth.value = base.month;
  activeIso.value = selected.value ? props.modelValue! : firstAvailable(base.year, base.month);

  await nextTick();
  updatePosition();
  focusActive();

  document.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
}

function close(restore = true) {
  if (!open.value) return;
  open.value = false;
  viewMode.value = 'days';
  document.removeEventListener('pointerdown', onPointerDown, true);
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
  if (restore) trigger.value?.focus();
}

function firstAvailable(year: number, month: number) {
  const days = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= days; day++) {
    const value = iso(year, month, day);
    if (!isDisabled(value) && value >= (props.min || '')) return value;
  }
  return iso(year, month, 1);
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as Node;
  if (trigger.value?.contains(target) || document.getElementById(`${id}-calendar`)?.contains(target)) return;
  close(false);
}

function select(value: string) {
  if (isDisabled(value)) return;
  emit('update:modelValue', value);
  emit('change', value);
  close();
}

function selectMonth(mIndex: number) {
  viewMonth.value = mIndex;
  viewMode.value = 'days';
  activeIso.value = firstAvailable(viewYear.value, viewMonth.value);
  nextTick(focusActive);
}

function setActive(value: string) {
  if (isDisabled(value)) return;
  const parsed = parseIso(value);
  if (!parsed) return;
  activeIso.value = value;
  viewYear.value = parsed.year;
  viewMonth.value = parsed.month;
  nextTick(focusActive);
}

function moveDays(days: number) {
  const parsed = parseIso(activeIso.value) || selected.value || todayParts();
  const next = new Date(parsed.year, parsed.month, parsed.day + days);
  setActive(iso(next.getFullYear(), next.getMonth(), next.getDate()));
}

function moveMonths(months: number) {
  const parsed = parseIso(activeIso.value) || selected.value || todayParts();
  const next = new Date(parsed.year, parsed.month + months, 1);
  viewYear.value = next.getFullYear();
  viewMonth.value = next.getMonth();
  const maxDays = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  const day = Math.min(parsed.day, maxDays);
  setActive(iso(next.getFullYear(), next.getMonth(), day));
}

function focusActive() {
  if (!activeIso.value) return;
  document.querySelector<HTMLButtonElement>(`#${CSS.escape(`${id}-calendar`)} [data-date="${activeIso.value}"]`)?.focus({ preventScroll: true });
}

function triggerKeys(event: KeyboardEvent) {
  if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    void openMenu();
  } else if (event.key === 'Escape') {
    close();
  }
}

function dialogKeys(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    close();
  } else if (event.key === 'Tab' && !isMobile.value) {
    // Keep focus or allow tabbing
  }
}

function calendarKeys(event: KeyboardEvent) {
  if (viewMode.value !== 'days') return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveDays(-1); }
  else if (event.key === 'ArrowRight') { event.preventDefault(); moveDays(1); }
  else if (event.key === 'ArrowUp') { event.preventDefault(); moveDays(-7); }
  else if (event.key === 'ArrowDown') { event.preventDefault(); moveDays(7); }
  else if (event.key === 'PageUp') { event.preventDefault(); moveMonths(event.shiftKey ? -12 : -1); }
  else if (event.key === 'PageDown') { event.preventDefault(); moveMonths(event.shiftKey ? 12 : 1); }
  else if (event.key === 'Home') { event.preventDefault(); moveDays(-((new Date(activeIso.value).getDay() + 6) % 7)); }
  else if (event.key === 'End') { event.preventDefault(); moveDays(6 - ((new Date(activeIso.value).getDay() + 6) % 7)); }
  else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(activeIso.value); }
}

function clear(e?: Event) {
  e?.stopPropagation();
  emit('update:modelValue', '');
  emit('change', '');
  close();
}

watch(() => props.modelValue, (value) => {
  if (!open.value) return;
  const parsed = parseIso(value);
  if (parsed && value) {
    viewYear.value = parsed.year;
    viewMonth.value = parsed.month;
    activeIso.value = value;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true);
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
});
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label-base">{{ label }} <span v-if="required" class="text-brand-500">*</span></label>

    <div class="relative w-full">
      <button
        :id="id"
        ref="trigger"
        type="button"
        :disabled="disabled"
        :aria-label="ariaLabel || label || placeholder"
        :aria-expanded="open"
        aria-haspopup="dialog"
        :aria-required="required || undefined"
        class="group flex w-full items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5 text-left text-ink transition-all duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          selected ? 'font-medium' : 'text-muted/70',
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
          open ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-sm' : 'hover:border-ink/20',
        ]"
        style="min-height: 48px"
        @click="open ? close() : openMenu()"
        @keydown="triggerKeys"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700 dark:bg-forest-900/40 dark:text-forest-300">
          <CalendarDays class="h-4 w-4" />
        </div>

        <span class="min-w-0 flex-1 truncate text-xs sm:text-sm">{{ displayValue }}</span>

        <ChevronDown
          class="h-4 w-4 shrink-0 text-muted transition-transform duration-200"
          :class="open ? 'rotate-180 text-brand-500' : 'group-hover:text-ink'"
        />
      </button>
    </div>

    <p v-if="error" class="mt-1.5 text-xs font-medium text-danger">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-muted">{{ hint }}</p>

    <!-- Custom Date Popover / Bottom Sheet -->
    <Teleport to="body">
      <Transition :name="isMobile ? 'date-sheet' : 'date-pop'">
        <div
          v-if="open"
          :id="`${id}-calendar`"
          :style="isMobile ? undefined : menuStyle"
          role="dialog"
          aria-modal="true"
          :aria-label="`${label || 'Choose date'} calendar`"
          class="border border-line bg-surface shadow-2xl backdrop-blur-xl"
          :class="[
            isMobile
              ? 'fixed inset-x-0 bottom-0 z-[150] rounded-t-3xl p-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom'
              : 'overflow-hidden rounded-3xl p-3.5',
          ]"
          @keydown="dialogKeys"
        >
          <!-- Mobile Pull Handle -->
          <div v-if="isMobile" class="mb-3 flex flex-col items-center">
            <div class="h-1.5 w-10 rounded-full bg-line" />
            <div class="mt-2 flex w-full items-center justify-between">
              <span class="font-display text-sm font-bold text-ink">{{ label || 'Select date' }}</span>
              <button
                type="button"
                class="flex h-7 w-7 items-center justify-center rounded-full bg-raised text-muted hover:text-ink"
                @click="close()"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Quick Preset Shortcuts Bar -->
          <div v-if="presets.length" class="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              v-for="p in presets"
              :key="p.iso"
              type="button"
              class="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition"
              :class="[
                modelValue === p.iso
                  ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                  : 'border-line bg-surface hover:bg-raised text-muted hover:text-ink',
              ]"
              @click="select(p.iso)"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Calendar Header with Month/Year Navigation -->
          <div class="flex items-center justify-between gap-1 border-b border-line/60 pb-2.5">
            <div class="flex items-center gap-0.5">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-raised hover:text-ink transition"
                aria-label="Previous year"
                @click="viewMode === 'months' ? viewYear-- : moveMonths(-12)"
              >
                <ChevronsLeft class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-raised hover:text-ink transition"
                aria-label="Previous month"
                @click="moveMonths(-1)"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
            </div>

            <!-- Toggle Month/Year View button -->
            <button
              type="button"
              class="flex items-center gap-1 rounded-xl px-2.5 py-1 font-display text-sm font-bold text-ink hover:bg-raised transition"
              :title="viewMode === 'days' ? 'Switch to month view' : 'Switch to calendar view'"
              @click="viewMode = viewMode === 'days' ? 'months' : 'days'"
            >
              <span>{{ viewMode === 'months' ? viewYear : monthLabel }}</span>
              <ChevronDown class="h-3.5 w-3.5 text-muted transition-transform" :class="viewMode === 'months' ? 'rotate-180' : ''" />
            </button>

            <div class="flex items-center gap-0.5">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-raised hover:text-ink transition"
                aria-label="Next month"
                @click="moveMonths(1)"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-raised hover:text-ink transition"
                aria-label="Next year"
                @click="viewMode === 'months' ? viewYear++ : moveMonths(12)"
              >
                <ChevronsRight class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Fast Month & Year Picker Grid Mode -->
          <div v-if="viewMode === 'months'" class="mt-3 grid grid-cols-3 gap-2 py-1">
            <button
              v-for="(mName, mIdx) in monthsShort"
              :key="mName"
              type="button"
              class="flex h-11 items-center justify-center rounded-xl text-xs font-bold transition"
              :class="[
                viewMonth === mIdx
                  ? 'bg-ink text-canvas font-extrabold shadow-sm'
                  : 'text-ink hover:bg-raised',
              ]"
              @click="selectMonth(mIdx)"
            >
              {{ mName }}
            </button>
          </div>

          <!-- Standard Days Calendar Grid Mode -->
          <template v-else>
            <!-- Weekday Row -->
            <div class="mt-2 grid grid-cols-7 text-center">
              <span
                v-for="weekday in weekdays"
                :key="weekday"
                class="py-1 text-[10px] font-bold uppercase tracking-wider text-muted"
              >
                {{ weekday.slice(0, 2) }}
              </span>
            </div>

            <!-- Days Grid -->
            <div class="mt-1 grid grid-cols-7 gap-1" role="grid" @keydown="calendarKeys">
              <button
                v-for="cell in cells"
                :key="cell.iso"
                type="button"
                role="gridcell"
                :data-date="cell.iso"
                :disabled="cell.isDisabled"
                :aria-label="new Date(`${cell.iso}T12:00:00`).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })"
                :aria-selected="cell.isSelected"
                :tabindex="cell.iso === activeIso ? 0 : -1"
                class="relative flex h-9 w-full items-center justify-center rounded-xl text-xs font-semibold transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-25"
                :class="[
                  cell.isSelected
                    ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/25 ring-2 ring-brand-500/30'
                    : cell.isToday
                      ? 'border border-brand-500/40 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      : cell.inMonth
                        ? 'text-ink hover:bg-raised'
                        : 'text-muted/40 hover:bg-raised/60',
                  cell.iso === activeIso && !cell.isSelected ? 'ring-2 ring-brand-500/40' : '',
                ]"
                @click="select(cell.iso)"
                @focus="activeIso = cell.iso"
              >
                <span>{{ cell.day }}</span>
                <span
                  v-if="cell.isToday && !cell.isSelected"
                  class="absolute bottom-1 h-1 w-1 rounded-full bg-brand-500"
                />
              </button>
            </div>
          </template>

          <!-- Footer Actions Bar -->
          <div class="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5">
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="rounded-xl px-2.5 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40 transition"
                @click="select(todayIso); viewYear = todayParts().year; viewMonth = todayParts().month"
              >
                Today
              </button>

              <button
                v-if="clearable && modelValue"
                type="button"
                class="rounded-xl px-2.5 py-1.5 text-xs font-bold text-muted hover:bg-raised hover:text-ink transition"
                @click="clear"
              >
                Clear
              </button>
            </div>

            <button
              type="button"
              class="rounded-xl bg-ink px-3 py-1.5 text-xs font-bold text-canvas hover:opacity-90 transition"
              @click="close()"
            >
              Done
            </button>
          </div>
        </div>
      </Transition>

      <!-- Mobile Backdrop Overlay -->
      <Transition name="fade">
        <div
          v-if="open && isMobile"
          class="fixed inset-0 z-[140] bg-black/50 backdrop-blur-xs transition-opacity"
          @click="close(false)"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.date-pop-enter-active,
.date-pop-leave-active {
  transition: opacity 0.16s cubic-bezier(0.16, 1, 0.3, 1), transform 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}
.date-pop-enter-from,
.date-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.date-sheet-enter-active,
.date-sheet-leave-active {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}
.date-sheet-enter-from,
.date-sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
