<script setup lang="ts">
import {
  Bell, Building2, Check, ChevronRight, Copy, CreditCard, Crown, Globe2, KeyRound, Link2, Loader2,
  Mail, MessageCircle, Plus, RefreshCw, ShieldCheck, Smartphone, Sparkles, Trash2, UserRound, Users,
} from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { dayName, formatDate } from '~/utils/date';
import { prettyPhone } from '~/utils/phone';
import { PERMISSION_OPTIONS, STAFF_DEFAULT } from '~/utils/permissions';
import { titleCase } from '~/utils/entities';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Settings' });
const route = useRoute();
const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const businessStore = useBusinessStore();
const profile = useProfile();
const staffApi = useStaff();
const whatsapp = useWhatsApp();
const summaries = useSummaries();
const billing = useBilling();
const domainApi = useDomain();
const { data: categoryOptions } = await useBusinessCategories();
const whatsappReadyLabels: Record<string, string> = { accessToken: 'Access token', phoneNumberId: 'Phone number ID', appSecret: 'App secret', verifyToken: 'Verify token', platformNumber: 'Platform number' };
const validTabs = ['profile', 'business', 'alerts', 'summaries', 'whatsapp', 'staff', 'billing', 'domain'];
const activeTab = ref(validTabs.includes(String(route.query.tab)) ? String(route.query.tab) : 'business');
const tabs = [
  { key: 'business', label: 'Business' }, { key: 'profile', label: 'Your profile' }, { key: 'alerts', label: 'Alerts' },
  { key: 'summaries', label: 'Summaries' }, { key: 'whatsapp', label: 'WhatsApp' }, { key: 'staff', label: 'Staff' },
  { key: 'billing', label: 'Billing' }, { key: 'domain', label: 'Domain' },
];
const businessForm = reactive({ name: '', category: '', tagline: '', description: '', about: '', address: '', email: '', publicPhone: '', whatsappNumber: '', brandColor: '#FF5A1F' });
const profileForm = reactive({ name: '', phone: '', avatarUrl: '' });
const passwordForm = reactive({ current: '', next: '', confirm: '' });
const alerts = reactive({ lowStockInApp: true, lowStockEmail: true, lowStockWhatsapp: true, debtReminders: true, reminderDaysBefore: 2, repeatOverdueEveryDays: 7 });
const summaryForm = reactive({ dailyEnabled: true, weeklyEnabled: true, sendTime: '20:00', weeklyDay: 1, whatsapp: true, email: true });
const otp = ref<Awaited<ReturnType<typeof whatsapp.generateOtp>> | null>(null);
const inviteOpen = ref(false);
const staffPermissionsOpen = ref(false);
const inviteForm = reactive({ name: '', email: '', permissions: [...STAFF_DEFAULT] });
const editingStaff = ref<string | null>(null);
const editingPermissions = ref<string[]>([]);
const summaryPeriod = ref<'daily' | 'weekly'>('daily');
const yearly = ref(false);
const coupon = ref('');
const domainInput = ref('');
const currentPlan = computed(() => businessStore.plan);
const subscription = computed(() => businessStore.subscription);
const entitlements = computed(() => businessStore.entitlements);
const isOwner = computed(() => auth.activeBusiness?.role === 'owner');
const paidPlans = computed(() => billing.plans.value.filter((p) => p.priceMonthlyKobo > 0));
const pendingInvitePlanBlocks = computed(() => (businessStore.usage?.staff || 0) >= (entitlements.value.staffSeats || 0));

function setTab(tab: string) { activeTab.value = tab; void router.replace({ query: { tab } }); }
function hydrate() {
  const b = businessStore.business;
  if (b) Object.assign(businessForm, { name: b.name, category: b.category, tagline: b.tagline, description: b.description, about: b.about, address: b.address, email: b.email || '', publicPhone: b.publicPhone || '', whatsappNumber: b.whatsappNumber || '', brandColor: b.brandColor });
  const a = (b?.alertSettings || {}) as Record<string, unknown>;
  Object.assign(alerts, {
    lowStockInApp: a.lowStockInApp !== false, lowStockEmail: a.lowStockEmail !== false, lowStockWhatsapp: a.lowStockWhatsapp !== false,
    debtReminders: a.debtReminders !== false, reminderDaysBefore: Number(a.reminderDaysBefore ?? 2), repeatOverdueEveryDays: Number(a.repeatOverdueEveryDays ?? 7),
  });
  const s = b?.summarySettings;
  if (s) Object.assign(summaryForm, { dailyEnabled: s.dailyEnabled, weeklyEnabled: s.weeklyEnabled, sendTime: s.sendTime, weeklyDay: s.weeklyDay, whatsapp: s.channels?.whatsapp !== false, email: s.channels?.email !== false });
  if (auth.user) Object.assign(profileForm, { name: auth.user.name, phone: auth.user.phone || '', avatarUrl: auth.user.avatarUrl || '' });
  domainInput.value = b?.customDomain || '';
}
watch(activeTab, async (tab) => {
  if (tab === 'staff' && isOwner.value) await staffApi.load().catch(() => undefined);
  if (tab === 'whatsapp') await whatsapp.load().catch(() => undefined);
  if (tab === 'billing') await billing.load().catch(() => undefined);
  if (tab === 'summaries') await summaries.load(summaryPeriod.value).catch(() => undefined);
});
watch(summaryPeriod, (period) => summaries.load(period).catch(() => undefined));
async function saveBusiness() {
  try { await businessStore.update({ ...businessForm, email: businessForm.email || null, logoUrl: businessStore.business?.logoUrl || null }); toast.success('Business details saved.'); }
  catch (error) { toast.error((error as Error).message); }
}
async function saveProfile() {
  try { await profile.update({ name: profileForm.name, phone: profileForm.phone || undefined, avatarUrl: profileForm.avatarUrl || undefined }); toast.success('Profile saved.'); }
  catch (error) { toast.error((error as Error).message); }
}
async function savePassword() {
  if (!passwordForm.current || passwordForm.next.length < 8) { toast.error('Enter your current password and a new one of at least 8 characters.'); return; }
  if (passwordForm.next !== passwordForm.confirm) { toast.error('New passwords do not match.'); return; }
  try { await profile.changePassword(passwordForm.current, passwordForm.next); Object.assign(passwordForm, { current: '', next: '', confirm: '' }); }
  catch (error) { toast.error((error as Error).message); }
}
async function resendVerification() {
  try { await profile.resendVerification(); auth.fetchMe().catch(() => undefined); toast.success('Verification email sent.'); }
  catch (error) { toast.error((error as Error).message); }
}
async function saveAlerts() {
  try { await businessStore.update({ alertSettings: alerts }); toast.success('Alert preferences saved.'); }
  catch (error) { toast.error((error as Error).message); }
}
async function saveSummaries() {
  try {
    await businessStore.update({ summarySettings: { dailyEnabled: summaryForm.dailyEnabled, weeklyEnabled: summaryForm.weeklyEnabled, sendTime: summaryForm.sendTime, weeklyDay: Number(summaryForm.weeklyDay), channels: { whatsapp: summaryForm.whatsapp, email: summaryForm.email } } });
    toast.success('Summary schedule saved. Times are Africa/Lagos.');
  } catch (error) { toast.error((error as Error).message); }
}
async function sendSummaryNow() {
  try {
    await saveSummaries();
    const result = await summaries.send(summaryPeriod.value);
    toast.success(result.whatsapp || result.email ? 'Summary sent.' : 'Summary generated. Connect WhatsApp or email to deliver it.', 'Summary');
  } catch (error) { toast.error((error as Error).message); }
}
async function generateOtp() {
  try { otp.value = await whatsapp.generateOtp(); toast.success('Code generated. Send it from your WhatsApp.'); }
  catch (error) { toast.error((error as Error).message); }
}
async function testWhatsapp() {
  try { const r = await whatsapp.test(); if (r.sent) toast.success('Test message sent.'); else toast.warning(`Could not send: ${r.reason || 'no linked number'}.`); }
  catch (error) { toast.error((error as Error).message); }
}
async function inviteStaff() {
  if (!inviteForm.name || !inviteForm.email) { toast.error('Name and email are required.'); return; }
  try { const result = await staffApi.invite(inviteForm); toast.success(result.newAccount ? 'Invite sent. They will set their password by email.' : 'Staff access added.'); inviteOpen.value = false; Object.assign(inviteForm, { name: '', email: '', permissions: [...STAFF_DEFAULT] }); }
  catch (error) { toast.error((error as Error).message); }
}
function openPermissions(member: { id: string; permissions: string[] }) { editingStaff.value = member.id; editingPermissions.value = member.permissions.includes('all') ? PERMISSION_OPTIONS.map((p) => p.key) : [...member.permissions]; staffPermissionsOpen.value = true; }
async function savePermissions() {
  if (!editingStaff.value) return;
  try { await staffApi.update(editingStaff.value, { permissions: editingPermissions.value }); toast.success('Staff permissions updated.'); staffPermissionsOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
}
async function toggleStaff(member: { id: string; status: string }) {
  try { await staffApi.update(member.id, { status: member.status === 'active' ? 'disabled' : 'active' }); toast.success('Staff access updated.'); }
  catch (error) { toast.error((error as Error).message); }
}
async function removeStaff(id: string) {
  try { await staffApi.remove(id); toast.success('Staff member removed.'); }
  catch (error) { toast.error((error as Error).message); }
}
async function upgrade(planKey: string) {
  try {
    const result = await billing.checkout(planKey, yearly.value ? 'yearly' : 'monthly', coupon.value || undefined);
    window.location.href = result.authorizationUrl;
  } catch (error) { toast.error((error as Error).message); }
}
async function setDomain() {
  if (!domainInput.value) return;
  try { await domainApi.setDomain(domainInput.value); toast.success('Domain saved. Add the DNS record then verify.'); await businessStore.load(true); }
  catch (error) { toast.error((error as Error).message); }
}
async function verifyDomain() {
  try { const result = await domainApi.verify(); if (result.verified) { toast.success('Domain verified. SSL is being issued.'); await businessStore.load(true); } else toast.warning(result.reason, 'Not verified yet'); }
  catch (error) { toast.error((error as Error).message); }
}
async function removeDomain() {
  try { await domainApi.remove(); domainInput.value = ''; await businessStore.load(true); toast.success('Custom domain removed.'); }
  catch (error) { toast.error((error as Error).message); }
}
function copy(value: string) { void navigator.clipboard.writeText(value); toast.success('Copied.'); }
onMounted(async () => { if (!businessStore.context) await businessStore.load(); hydrate(); if (activeTab.value === 'billing') await billing.load().catch(() => undefined); if (activeTab.value === 'staff' && isOwner.value) await staffApi.load().catch(() => undefined); if (activeTab.value === 'whatsapp') await whatsapp.load().catch(() => undefined); if (activeTab.value === 'summaries') await summaries.load(summaryPeriod.value).catch(() => undefined); });
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Settings" subtitle="Your business, team, alerts and billing — all in your control." eyebrow="Control room" />
    <div class="scrollbar-none flex gap-5 overflow-x-auto border-b border-line">
      <button v-for="tab in tabs" :key="tab.key" class="shrink-0 border-b-2 pb-3 text-xs font-bold transition" :class="activeTab === tab.key ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink'" @click="setTab(tab.key)">{{ tab.label }}</button>
    </div>

    <div v-if="activeTab === 'business'" class="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
      <BaseCard>
        <h2 class="font-display text-xl font-bold">Business details</h2><p class="mt-1 text-xs text-muted">Shown on receipts, invoices and your storefront.</p>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="businessForm.name" label="Business name" />
          <BaseSelect v-model="businessForm.category" label="Category" :options="(categoryOptions || []).map((c) => ({ value: c.key, label: c.label }))" />
          <div class="sm:col-span-2"><BaseInput v-model="businessForm.tagline" label="Tagline" hint="One line that makes people look twice." /></div>
          <div class="sm:col-span-2"><BaseTextarea v-model="businessForm.description" label="Short description" :rows="2" /></div>
          <div class="sm:col-span-2"><BaseTextarea v-model="businessForm.about" label="About your business" :rows="4" /></div>
          <BaseInput v-model="businessForm.publicPhone" label="Public phone" inputmode="tel" />
          <BaseInput v-model="businessForm.whatsappNumber" label="WhatsApp number" inputmode="tel" hint="Where customers send orders." />
          <BaseInput v-model="businessForm.email" label="Business email" type="email" />
          <BaseInput v-model="businessForm.address" label="Address" />
        </div>
        <BaseButton class="mt-5" :loading="businessStore.loading" @click="saveBusiness">Save business details</BaseButton>
      </BaseCard>
      <div class="space-y-4">
        <BaseCard><h3 class="font-display text-lg font-bold">Storefront</h3><p class="mt-1 text-xs text-muted">Design and publish from the website builder.</p><NuxtLink to="/app/website" class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-300">Open website builder <ChevronRight class="h-3.5 w-3.5" /></NuxtLink></BaseCard>
        <BaseCard><h3 class="font-display text-lg font-bold">Brand</h3><p class="mt-1 text-xs text-muted">Logo and banner uploads are in the builder design tab.</p><NuxtLink to="/app/website" class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-300">Edit brand <ChevronRight class="h-3.5 w-3.5" /></NuxtLink></BaseCard>
      </div>
    </div>

    <div v-else-if="activeTab === 'profile'" class="grid gap-5 xl:grid-cols-2">
      <BaseCard>
        <h2 class="font-display text-xl font-bold">Your profile</h2>
        <div class="mt-4"><ImageUploader v-model="profileForm.avatarUrl" purpose="avatar" label="Profile photo" aspect="square" /></div>
        <div class="mt-4 grid gap-4"><BaseInput v-model="profileForm.name" label="Name" /><BaseInput v-model="profileForm.phone" label="Phone" inputmode="tel" /><BaseInput :model-value="auth.user?.email" label="Email" disabled /></div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <BaseBadge :variant="auth.user?.emailVerified ? 'success' : 'warning'" dot>{{ auth.user?.emailVerified ? 'Email verified' : 'Email not verified' }}</BaseBadge>
          <button v-if="!auth.user?.emailVerified" class="text-[11px] font-bold text-brand-600 underline dark:text-brand-300" @click="resendVerification">Resend verification email</button>
        </div>
        <BaseButton class="mt-5" :loading="profile.saving.value" @click="saveProfile">Save profile</BaseButton>
      </BaseCard>
      <BaseCard>
        <h2 class="font-display text-xl font-bold">Password</h2><p class="mt-1 text-xs text-muted">Changing your password signs out other devices.</p>
        <div class="mt-4 space-y-3"><BaseInput v-model="passwordForm.current" label="Current password" type="password" autocomplete="current-password" /><BaseInput v-model="passwordForm.next" label="New password" type="password" autocomplete="new-password" /><BaseInput v-model="passwordForm.confirm" label="Confirm new password" type="password" autocomplete="new-password" /></div>
        <BaseButton class="mt-4" variant="outline" :loading="profile.changing.value" @click="savePassword"><KeyRound class="h-4 w-4" /> Change password</BaseButton>
      </BaseCard>
    </div>

    <div v-else-if="activeTab === 'alerts'" class="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <BaseCard>
        <h2 class="font-display text-xl font-bold">Stock & debt alerts</h2><p class="mt-1 text-xs text-muted">We debounce low-stock alerts so you are not spammed.</p>
        <div class="mt-5 space-y-4">
          <BaseCheckbox v-model="alerts.lowStockInApp" label="In-app notifications" description="A bell notification inside Ojaly." />
          <BaseCheckbox v-model="alerts.lowStockEmail" label="Email alerts" description="Sent to the owner's email." />
          <BaseCheckbox v-model="alerts.lowStockWhatsapp" label="WhatsApp alerts" description="To your verified number, using an approved template outside the 24-hour window." />
          <BaseCheckbox v-model="alerts.debtReminders" label="Automatic debt reminders" description="Email reminders when a customer has an email address." />
          <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model.number="alerts.reminderDaysBefore" label="Remind before due date (days)" type="number" /><BaseInput v-model.number="alerts.repeatOverdueEveryDays" label="Repeat overdue reminder every (days)" type="number" /></div>
        </div>
        <BaseButton class="mt-5" @click="saveAlerts">Save alert settings</BaseButton>
      </BaseCard>
      <BaseCard><h3 class="font-display text-lg font-bold">How alerts work</h3><ul class="mt-3 space-y-3 text-xs leading-relaxed text-muted"><li class="flex gap-2"><Bell class="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> Stock alerts fire when a variant drops to or below its threshold. We wait 24 hours before repeating.</li><li class="flex gap-2"><MessageCircle class="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> Outbound WhatsApp outside the customer's 24-hour window uses Meta-approved templates.</li><li class="flex gap-2"><ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> Only the owner receives business alerts. Staff do not.</li></ul></BaseCard>
    </div>

    <div v-else-if="activeTab === 'summaries'" class="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <BaseCard>
        <h2 class="font-display text-xl font-bold">Daily & weekly summaries</h2><p class="mt-1 text-xs text-muted">Delivered in Africa/Lagos time.</p>
        <div class="mt-5 space-y-4">
          <BaseCheckbox v-model="summaryForm.dailyEnabled" label="Daily summary" description="Sales, profit, expenses, new debts, low stock and top product." />
          <BaseCheckbox v-model="summaryForm.weeklyEnabled" label="Weekly summary" description="The same picture over the week." />
          <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="summaryForm.sendTime" label="Send time (HH:MM)" pattern="[0-2][0-9]:[0-5][0-9]" /><BaseSelect v-model="summaryForm.weeklyDay" label="Weekly summary day" :options="[0,1,2,3,4,5,6].map((d) => ({ value: d, label: dayName(d) }))" /></div>
          <div class="grid gap-2 sm:grid-cols-2"><BaseCheckbox v-model="summaryForm.whatsapp" label="WhatsApp" /><BaseCheckbox v-model="summaryForm.email" label="Email" /></div>
        </div>
        <BaseButton class="mt-5" @click="saveSummaries">Save schedule</BaseButton>
      </BaseCard>
      <BaseCard>
        <div class="flex items-center justify-between gap-2"><h3 class="font-display text-lg font-bold">Preview & share</h3><div class="flex rounded-lg border border-line p-0.5"><button class="rounded-md px-2.5 py-1 text-[10px] font-bold" :class="summaryPeriod === 'daily' ? 'bg-ink text-canvas' : 'text-muted'" @click="summaryPeriod = 'daily'">Daily</button><button class="rounded-md px-2.5 py-1 text-[10px] font-bold" :class="summaryPeriod === 'weekly' ? 'bg-ink text-canvas' : 'text-muted'" @click="summaryPeriod = 'weekly'">Weekly</button></div></div>
        <div v-if="summaries.preview.value" class="mt-3 whitespace-pre-line rounded-2xl bg-[#06231A] p-4 font-mono text-[11px] leading-relaxed text-[#E8EFE9]">{{ summaries.preview.value.text }}</div>
        <div v-else class="mt-3 flex h-40 items-center justify-center rounded-2xl bg-raised"><Loader2 v-if="summaries.loading.value" class="h-5 w-5 animate-spin" /><p v-else class="text-xs text-muted">Preview unavailable.</p></div>
        <div class="mt-3 flex flex-wrap gap-2">
          <BaseButton v-if="summaries.preview.value" :href="summaries.preview.value.shareLink" target="_blank" size="sm" variant="outline"><MessageCircle class="h-4 w-4" /> Share on WhatsApp</BaseButton>
          <BaseButton size="sm" :loading="summaries.sending.value" @click="sendSummaryNow">Send now</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="summaries.load(summaryPeriod)"><RefreshCw class="h-4 w-4" /></BaseButton>
        </div>
        <p class="mt-3 text-[10px] text-muted">WhatsApp outside the 24-hour window requires the approved templates <code>ojaly_daily_summary</code> and <code>ojaly_weekly_summary</code>.</p>
      </BaseCard>
    </div>

    <div v-else-if="activeTab === 'whatsapp'" class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <BaseCard data-tour="whatsapp-link">
        <div class="flex items-center gap-2"><div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C4A]"><MessageCircle class="h-5 w-5" /></div><div><h2 class="font-display text-xl font-bold">WhatsApp bot</h2><p class="text-[11px] text-muted">{{ whatsapp.status.value?.configured ? 'Cloud API connected' : 'Cloud API not configured yet' }}</p></div><BaseBadge class="ml-auto" :variant="whatsapp.status.value?.configured ? 'success' : 'warning'" dot>{{ whatsapp.status.value?.configured ? 'Connected' : 'Setup needed' }}</BaseBadge></div>
        <div class="mt-4"><p class="label-base">Platform number</p><p class="rounded-xl bg-raised p-3 text-sm font-semibold">{{ whatsapp.status.value?.platformNumber || 'Add WHATSAPP_PLATFORM_NUMBER to your env' }}</p></div>
        <div class="mt-4 rounded-xl border border-line p-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-muted">Connection checklist</p>
          <div class="mt-2 grid gap-1.5 text-[10px] sm:grid-cols-2">
            <span v-for="(ready, key) in whatsapp.status.value?.readiness || {}" :key="key" class="flex items-center gap-1.5" :class="ready ? 'text-success' : 'text-warning'"><span class="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold" :class="ready ? 'bg-success/15' : 'bg-warning/15'">{{ ready ? '✓' : '!' }}</span>{{ whatsappReadyLabels[String(key)] || key }}</span>
          </div>
          <p class="mt-2 text-[9px] leading-relaxed text-muted">The bot needs Meta credentials, an app secret, a verify token and a platform number. Use “Send test message” after linking your number.</p>
        </div>
        <div class="mt-4">
          <p class="text-sm font-bold">Link your number</p><p class="mt-1 text-xs text-muted">Generate a one-time code, then send <code>LINK 123456</code> from your WhatsApp to the platform number.</p>
          <BaseButton class="mt-3" :loading="whatsapp.generating.value" :disabled="!whatsapp.status.value?.configured" @click="generateOtp"><Smartphone class="h-4 w-4" /> Get link code</BaseButton>
          <div v-if="otp" class="mt-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
            <p class="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">Your code</p><p class="mt-1 font-display text-3xl font-bold tracking-[0.2em]">{{ otp.code }}</p><p class="mt-1 text-[11px] text-muted">Expires in 10 minutes. Open WhatsApp and send <strong>LINK {{ otp.code }}</strong>.</p>
            <div class="mt-2 flex gap-2"><a v-if="otp.waLink" :href="otp.waLink" target="_blank" class="rounded-lg bg-[#25D366] px-3 py-2 text-[11px] font-bold text-forest-900">Open WhatsApp</a><button class="rounded-lg border border-line px-3 py-2 text-[11px] font-bold" @click="copy(`LINK ${otp.code}`)"><Copy class="mr-1 inline h-3 w-3" />Copy</button></div>
          </div>
        </div>
        <div class="mt-5 border-t border-line pt-4"><p class="text-sm font-bold">Commands</p><div class="mt-2 grid gap-1.5 text-[11px] text-muted"><p><code class="rounded bg-raised px-1">sold 3 shirts 5000, Tola owes 2000</code> — draft a sale</p><p><code class="rounded bg-raised px-1">EXPENSE 2500 transport</code> — record spending</p><p><code class="rounded bg-raised px-1">SUMMARY</code> · <code class="rounded bg-raised px-1">STOCK</code> · <code class="rounded bg-raised px-1">OWES</code> · <code class="rounded bg-raised px-1">UNDO</code> · <code class="rounded bg-raised px-1">HELP</code></p></div></div>
      </BaseCard>
      <div class="space-y-4">
        <BaseCard><h3 class="font-display text-lg font-bold">Linked numbers</h3><div v-if="whatsapp.status.value?.contacts.length" class="mt-3 divide-y divide-line"><div v-for="contact in whatsapp.status.value.contacts" :key="contact.id" class="flex items-center gap-2 py-2.5"><div class="min-w-0 flex-1"><p class="text-xs font-bold">{{ prettyPhone(contact.phone) }}</p><p class="text-[10px] text-muted">{{ contact.verifiedAt ? `Verified ${formatDate(contact.verifiedAt)}` : 'Not verified' }} · {{ contact.alertsOptOut ? 'alerts off' : 'alerts on' }}</p></div><button class="text-[10px] font-bold text-danger" @click="whatsapp.unlink(contact.id)">Unlink</button></div></div><p v-else class="mt-3 text-xs text-muted">No numbers linked yet.</p><BaseButton class="mt-3" size="sm" variant="outline" :disabled="!whatsapp.status.value?.contacts.length" @click="testWhatsapp">Send test message</BaseButton></BaseCard>
        <BaseCard><h3 class="font-display text-lg font-bold">Approved templates</h3><p class="mt-1 text-[11px] text-muted">Register these names in Meta WhatsApp Manager.</p><div class="mt-2 space-y-2"><div v-for="template in whatsapp.status.value?.templates || []" :key="template.name" class="rounded-xl bg-raised/60 p-2.5"><p class="text-[11px] font-bold">{{ template.name }}</p><p class="text-[10px] text-muted">{{ template.params }} params · {{ template.description }}</p></div></div><p class="mt-3 break-all text-[10px] text-muted">Webhook: {{ whatsapp.status.value?.webhookUrl }}</p></BaseCard>
      </div>
    </div>

    <div v-else-if="activeTab === 'staff'" class="space-y-5">
      <div v-if="!isOwner" class="card p-6"><p class="font-bold">Only the owner can manage staff.</p><p class="mt-1 text-xs text-muted">Ask the business owner if you need access changed.</p></div>
      <template v-else>
        <div class="flex flex-wrap items-center justify-between gap-2"><div><h2 class="font-display text-xl font-bold">Team</h2><p class="text-xs text-muted">{{ businessStore.usage?.staff || 0 }} of {{ businessStore.usage?.staffSeats || 0 }} staff seats used on {{ currentPlan?.name }}.</p></div><BaseButton :disabled="pendingInvitePlanBlocks" @click="inviteOpen = true"><Plus class="h-4 w-4" /> Invite staff</BaseButton></div>
        <div v-if="pendingInvitePlanBlocks" class="rounded-2xl border border-warning/30 bg-warning/10 p-3 text-xs font-semibold text-warning">Your plan's staff seats are full. Upgrade to invite more people.</div>
        <div class="space-y-2">
          <div v-for="member in staffApi.staff.value" :key="member.id" class="card flex flex-wrap items-center gap-3 p-4">
            <UserAvatar :name="member.user?.name" :src="member.user?.avatarUrl" />
            <div class="min-w-0 flex-1"><p class="text-sm font-bold">{{ member.user?.name || member.user?.email }} <span class="ml-1 text-[10px] font-semibold capitalize text-muted">{{ member.role }}</span></p><p class="text-[11px] text-muted">{{ member.user?.email }} · {{ member.status }}</p><p class="mt-0.5 text-[10px] text-muted">{{ member.role === 'owner' ? 'Full access' : member.permissions.length + ' permissions' }}</p></div>
            <template v-if="member.role !== 'owner'"><BaseButton size="sm" variant="outline" @click="openPermissions(member)">Permissions</BaseButton><BaseButton size="sm" variant="ghost" @click="toggleStaff(member)">{{ member.status === 'active' ? 'Disable' : 'Enable' }}</BaseButton><button class="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/5" aria-label="Remove staff" @click="removeStaff(member.id)"><Trash2 class="h-4 w-4" /></button></template>
            <BaseBadge v-else variant="brand">Owner</BaseBadge>
          </div>
        </div>
      </template>
    </div>

    <div v-else-if="activeTab === 'billing'" class="space-y-5">
      <BaseCard>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div><p class="eyebrow">Current plan</p><h2 class="mt-1 font-display text-2xl font-bold">{{ currentPlan?.name }} <BaseBadge v-if="businessStore.isTrial" variant="brand" class="ml-1">{{ businessStore.trialDaysLeft }} day trial</BaseBadge></h2><p v-if="businessStore.isTrial" class="mt-1 text-xs text-muted">Trial ends {{ subscription?.trialEndsAt ? formatDate(subscription.trialEndsAt) : '—' }}. Your data is never locked.</p><p v-else class="mt-1 text-xs text-muted">Renews {{ subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : '—' }} · {{ subscription?.status }}</p></div>
          <div class="rounded-xl bg-raised/60 p-3 text-xs"><p class="text-muted">Products</p><p class="font-bold">{{ businessStore.usage?.products || 0 }} / {{ entitlements.productLimit ?? '∞' }}</p></div>
        </div>
        <div class="mt-4 grid gap-2 sm:grid-cols-3"><div class="rounded-xl bg-raised/50 p-3 text-xs"><p class="text-muted">Staff seats</p><p class="font-bold">{{ businessStore.usage?.staff || 0 }} / {{ entitlements.staffSeats }}</p></div><div class="rounded-xl bg-raised/50 p-3 text-xs"><p class="text-muted">Exports</p><p class="font-bold">{{ entitlements.csvExport ? 'Included' : 'Upgrade needed' }}</p></div><div class="rounded-xl bg-raised/50 p-3 text-xs"><p class="text-muted">Custom domain</p><p class="font-bold">{{ entitlements.customDomain ? 'Included' : 'Boss plan' }}</p></div></div>
      </BaseCard>
      <div class="flex flex-wrap items-center justify-between gap-2"><h2 class="font-display text-xl font-bold">Plans</h2><div class="inline-flex rounded-full border border-line bg-surface p-1"><button class="rounded-full px-3 py-1.5 text-[10px] font-bold" :class="!yearly ? 'bg-ink text-canvas' : 'text-muted'" @click="yearly = false">Monthly</button><button class="rounded-full px-3 py-1.5 text-[10px] font-bold" :class="yearly ? 'bg-ink text-canvas' : 'text-muted'" @click="yearly = true">Yearly · save 20%</button></div></div>
      <div class="grid gap-3 lg:grid-cols-3" data-tour="billing-plans">
        <div v-for="plan in billing.plans.value" :key="plan.key" class="flex flex-col rounded-3xl border p-5" :class="plan.key === currentPlan?.key ? 'border-2 border-ink bg-forest-900 text-white' : 'border-line bg-surface'">
          <div class="flex items-center justify-between"><p class="font-display text-xl font-bold">{{ plan.name }}</p><Crown v-if="plan.key === 'boss'" class="h-4 w-4 text-accent" /></div>
          <p class="mt-1 text-[11px]" :class="plan.key === currentPlan?.key ? 'text-[#A8C0B4]' : 'text-muted'">{{ plan.description }}</p>
          <p class="mt-4 font-display text-3xl font-bold">{{ plan.priceMonthlyKobo === 0 ? 'Free' : formatNaira(yearly ? plan.priceYearlyKobo : plan.priceMonthlyKobo) }}<span v-if="plan.priceMonthlyKobo" class="text-[10px] font-normal">/{{ yearly ? 'yr' : 'mo' }}</span></p>
          <ul class="mt-3 flex-1 space-y-1.5 text-[11px]"><li v-for="feature in plan.marketingFeatures" :key="feature" class="flex gap-1.5"><Check class="mt-0.5 h-3 w-3 shrink-0" :class="plan.key === currentPlan?.key ? 'text-accent' : 'text-success'" />{{ feature }}</li></ul>
          <BaseButton class="mt-4" size="sm" :variant="plan.key === currentPlan?.key ? 'secondary' : 'outline'" :disabled="plan.key === currentPlan?.key || plan.priceMonthlyKobo === 0 || plan.key === 'free'" :loading="billing.checkingOut.value" @click="upgrade(plan.key)">{{ plan.key === currentPlan?.key ? 'Current plan' : plan.priceMonthlyKobo === 0 ? 'Free tier' : 'Choose plan' }}</BaseButton>
        </div>
      </div>
      <BaseCard><h3 class="font-display text-lg font-bold">Have a coupon?</h3><div class="mt-2 flex flex-col gap-2 sm:flex-row"><input v-model="coupon" class="input-base sm:flex-1" placeholder="STUDENT20" aria-label="Coupon code"><p class="text-[10px] text-muted sm:max-w-xs">Apply at checkout after choosing a plan. Coupons are issued by the Ojaly team.</p></div></BaseCard>
    </div>

    <div v-else-if="activeTab === 'domain'" class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <BaseCard>
        <div class="flex items-center gap-2"><Globe2 class="h-5 w-5 text-brand-500" /><h2 class="font-display text-xl font-bold">Custom domain</h2><BaseBadge v-if="entitlements.customDomain" variant="success">Boss plan</BaseBadge><BaseBadge v-else variant="warning"><Lock class="mr-1 h-3 w-3" /> Paid feature</BaseBadge></div>
        <div v-if="!entitlements.customDomain" class="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4"><p class="text-sm font-bold">Your own domain is a Boss feature.</p><p class="mt-1 text-xs text-muted">Use your free <strong>{{ businessStore.storefrontUrls?.subdomain }}</strong> link, or upgrade to connect shop.yourname.com.</p><BaseButton to="/app/settings?tab=billing" size="sm" class="mt-3">See Boss plan</BaseButton></div>
        <template v-else>
          <div class="mt-4"><BaseInput v-model="domainInput" label="Your domain" placeholder="shop.yourname.com" hint="Use a subdomain you control. Do not include https://." /></div>
          <div class="mt-3 flex flex-wrap gap-2"><BaseButton :loading="domainApi.saving.value" @click="setDomain">Save domain</BaseButton><BaseButton variant="outline" :loading="domainApi.verifying.value" @click="verifyDomain"><RefreshCw class="h-4 w-4" /> Verify DNS</BaseButton><BaseButton v-if="businessStore.business?.customDomain" variant="ghost" class="text-danger" @click="removeDomain">Remove</BaseButton></div>
          <div v-if="businessStore.business?.customDomain" class="mt-4 rounded-2xl bg-raised/60 p-4 text-xs"><p class="font-bold">{{ businessStore.business.customDomain }} <BaseBadge :variant="businessStore.business.customDomainVerified ? 'success' : 'warning'" class="ml-1">{{ businessStore.business.customDomainVerified ? 'Verified' : 'Pending DNS' }}</BaseBadge></p><div class="mt-3 grid gap-2 sm:grid-cols-2"><div><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Record type</p><p class="font-mono">CNAME</p></div><div><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Target</p><p class="font-mono">cname.ojaly.ng</p></div></div><p class="mt-2 text-[10px] text-muted">DNS can take up to 24 hours. SSL is issued automatically after verification. Until then, your ojaly.ng storefront keeps working.</p></div>
          <div v-if="domainApi.result.value" class="mt-3 rounded-xl border p-3 text-xs" :class="domainApi.result.value.verified ? 'border-success/30 bg-success/5 text-success' : 'border-warning/30 bg-warning/10 text-warning'">{{ domainApi.result.value.reason }}</div>
        </template>
      </BaseCard>
      <BaseCard><h3 class="font-display text-lg font-bold">Your links</h3><div class="mt-3 space-y-2"><div class="rounded-xl bg-raised/60 p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Free storefront</p><p class="break-all text-xs font-semibold">{{ businessStore.storefrontUrls?.subdomain }}</p></div><div class="rounded-xl bg-raised/60 p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Path</p><p class="break-all text-xs font-semibold">{{ businessStore.storefrontUrls?.path }}</p></div><div v-if="businessStore.business?.customDomain" class="rounded-xl bg-raised/60 p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-muted">Custom</p><p class="break-all text-xs font-semibold">{{ businessStore.business.customDomain }}</p></div></div><NuxtLink to="/app/website" class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-300"><Sparkles class="h-3.5 w-3.5" /> Open website builder</NuxtLink></BaseCard>
    </div>

    <BaseModal v-model:open="inviteOpen" title="Invite a team member" description="They get an email to set their password. You control their access.">
      <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="inviteForm.name" label="Name" /><BaseInput v-model="inviteForm.email" label="Email" type="email" /></div>
      <div class="mt-4"><p class="label-base">Permissions</p><div class="grid max-h-56 gap-1.5 overflow-y-auto rounded-xl border border-line p-3 sm:grid-cols-2"><label v-for="permission in PERMISSION_OPTIONS" :key="permission.key" class="flex items-center gap-2 rounded-lg px-1 py-1.5 text-xs"><input v-model="inviteForm.permissions" type="checkbox" :value="permission.key" class="rounded border-line">{{ permission.label }}</label></div></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="inviteOpen = false">Cancel</BaseButton><BaseButton :loading="staffApi.saving.value" @click="inviteStaff"><Plus class="h-4 w-4" /> Send invite</BaseButton></div>
    </BaseModal>
    <BaseModal v-model:open="staffPermissionsOpen" title="Edit permissions" description="Control what this staff member can see and do.">
      <div class="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-2"><label v-for="permission in PERMISSION_OPTIONS" :key="permission.key" class="flex items-center gap-2 text-xs"><input v-model="editingPermissions" type="checkbox" :value="permission.key" class="rounded border-line">{{ permission.label }}</label></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="staffPermissionsOpen = false">Cancel</BaseButton><BaseButton :loading="staffApi.saving.value" @click="savePermissions">Save permissions</BaseButton></div>
    </BaseModal>
  </div>
</template>
