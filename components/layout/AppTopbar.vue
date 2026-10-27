<script setup lang="ts">
import { Bell, ChevronDown, CircleHelp, LogOut, Menu, Plus, Settings, Store, UserRound, WifiOff } from 'lucide-vue-next';
const emit = defineEmits<{ toggleMenu: [] }>();
const auth = useAuthStore();
const businessStore = useBusinessStore();
const router = useRouter();
const offline = useOfflineStore();
const { unread, fetchNotifications } = useNotifications();
const menuOpen = ref(false);
const bizOpen = ref(false);
const root = ref<HTMLElement | null>(null);

async function onSwitch(id: string) {
  if (id === auth.activeBusinessId) { bizOpen.value = false; return; }
  await auth.switchBusiness(id);
  businessStore.reset();
  bizOpen.value = false;
  await businessStore.load();
  await router.push('/app');
}
async function logout() {
  menuOpen.value = false;
  await auth.logout();
  businessStore.reset();
  await router.push('/login');
}
function onClickOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) { menuOpen.value = false; bizOpen.value = false; }
}
onMounted(async () => {
  document.addEventListener('click', onClickOutside);
  try { await fetchNotifications({ force: true }); } catch { /* silent */ }
  setInterval(() => fetchNotifications({ force: true }).catch(() => undefined), 60000);
});
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));
</script>

<template>
  <header ref="root" class="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-xl">
    <div class="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <div class="flex min-w-0 items-center gap-2">
        <button class="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface lg:hidden" aria-label="Open menu" @click="emit('toggleMenu')"><Menu class="h-5 w-5" /></button>
        <div class="relative">
          <button type="button" class="flex min-h-[44px] max-w-[220px] items-center gap-2 rounded-xl px-2 hover:bg-raised" :aria-expanded="bizOpen" @click="bizOpen = !bizOpen; menuOpen = false">
            <UserAvatar :name="businessStore.business?.name" :src="businessStore.business?.logoUrl" size="sm" />
            <span class="hidden min-w-0 text-left sm:block">
              <span class="block truncate text-[13px] font-bold">{{ businessStore.business?.name || 'Your business' }}</span>
              <span class="block text-[10px] font-semibold text-muted">{{ businessStore.plan?.name || '—' }} plan</span>
            </span>
            <ChevronDown class="h-4 w-4 shrink-0 text-muted" />
          </button>
          <Transition name="pop">
            <div v-if="bizOpen" class="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-line bg-surface p-2 shadow-lift">
              <p class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted">Switch business</p>
              <button v-for="biz in auth.businesses" :key="biz.id" type="button" class="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-sm hover:bg-raised" @click="onSwitch(biz.id)">
                <UserAvatar :name="biz.name" :src="biz.logoUrl" size="sm" />
                <span class="min-w-0 flex-1"><span class="block truncate font-semibold">{{ biz.name }}</span><span class="text-[10px] capitalize text-muted">{{ biz.role }}</span></span>
                <span v-if="biz.id === auth.activeBusinessId" class="h-2 w-2 rounded-full bg-success" />
              </button>
              <NuxtLink to="/app/settings?tab=profile" class="mt-1 flex items-center gap-2 rounded-xl border-t border-line px-3 py-2.5 text-xs font-semibold text-muted hover:text-ink" @click="bizOpen = false"><Settings class="h-3.5 w-3.5" /> Manage account</NuxtLink>
            </div>
          </Transition>
        </div>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <span v-if="!offline.online || offline.pendingCount" class="hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold sm:inline-flex" :class="offline.online ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'">
          <WifiOff class="h-3 w-3" /> {{ offline.online ? `${offline.pendingCount} queued` : 'Offline' }}
        </span>
        <NuxtLink to="/app/sales/new" data-tour="record-sale" class="hidden min-h-[40px] items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 text-xs font-bold text-white shadow-[0_2px_0_0_#8F290B] sm:inline-flex">
          <Plus class="h-4 w-4" /> Record sale
        </NuxtLink>
        <NuxtLink to="/app/help" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:bg-raised" aria-label="Help center"><CircleHelp class="h-[18px] w-[18px]" /></NuxtLink>
        <NuxtLink to="/app/notifications" class="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:bg-raised" aria-label="Notifications">
          <Bell class="h-[18px] w-[18px]" />
          <span v-if="unread" class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">{{ unread > 9 ? '9+' : unread }}</span>
        </NuxtLink>
        <ThemeToggle />
        <div class="relative">
          <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface" aria-label="Account menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen; bizOpen = false">
            <UserAvatar :name="auth.user?.name" :src="auth.user?.avatarUrl" size="sm" />
          </button>
          <Transition name="pop">
            <div v-if="menuOpen" class="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-line bg-surface p-2 shadow-lift">
              <div class="px-3 py-2">
                <p class="truncate text-sm font-bold">{{ auth.user?.name }}</p>
                <p class="truncate text-[11px] text-muted">{{ auth.user?.email }}</p>
              </div>
              <NuxtLink to="/app/settings?tab=profile" class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-raised" @click="menuOpen = false"><UserRound class="h-4 w-4 text-muted" /> Profile</NuxtLink>
              <NuxtLink to="/app/website" class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-raised" @click="menuOpen = false"><Store class="h-4 w-4 text-muted" /> Website</NuxtLink>
              <NuxtLink to="/app/settings" class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-raised" @click="menuOpen = false"><Settings class="h-4 w-4 text-muted" /> Settings</NuxtLink>
              <button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-danger hover:bg-danger/5" @click="logout"><LogOut class="h-4 w-4" /> Sign out</button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.pop-enter-active, .pop-leave-active { transition: all .16s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }
</style>
