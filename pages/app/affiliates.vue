<script setup lang="ts">
import { ArrowRight, BadgeCheck, Banknote, Check, Copy, Gift, Link2, Loader2, MessageCircle, Percent, Share2, Sparkles, Users, Wallet } from 'lucide-vue-next';
import { formatDate, formatDateTime } from '~/utils/date';
import { formatNaira, nairaInput, nairaToKobo } from '~/utils/money';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Refer & earn' });
const auth = useAuthStore();
const toast = useToast();
const affiliate = useAffiliate();
const payoutOpen = ref(false);
const detailsOpen = ref(false);
const details = reactive({ bankName: '', accountName: '', accountNumber: '' });
const payout = reactive({ amount: '' });
const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = { paid: 'success', requested: 'warning', rejected: 'danger', pending: 'warning', available: 'success', converted: 'success', registered: 'neutral' };
const shareText = computed(() => affiliate.data.value ? `I run ${auth.activeBusiness?.name || 'my business'} on Ojaly — real profit, stock and a free website. Use my code ${affiliate.data.value.code} when you sign up: ${affiliate.data.value.link}` : '');

async function copy(value: string, message = 'Copied.') {
  try { await navigator.clipboard.writeText(value); toast.success(message); }
  catch { toast.error('Could not copy. Long-press the link instead.'); }
}
async function share() {
  if (!affiliate.data.value) return;
  if (navigator.share) {
    try { await navigator.share({ title: 'Ojaly', text: shareText.value, url: affiliate.data.value.link }); return; } catch { /* fall through */ }
  }
  await copy(shareText.value, 'Referral message copied.');
}
async function saveDetails() {
  if (!details.bankName || !details.accountName || !/^\d{10}$/.test(details.accountNumber)) { toast.error('Enter your bank, account name and a 10-digit NUBAN.'); return; }
  try { await affiliate.updateDetails({ ...details }); toast.success('Payout details saved.'); detailsOpen.value = false; }
  catch (error) { toast.error((error as Error).message); }
}
async function requestPayout() {
  if (!affiliate.data.value) return;
  const amountKobo = nairaToKobo(payout.amount);
  if (amountKobo < affiliate.data.value.minimumPayoutKobo) { toast.error(`Minimum payout is ${formatNaira(affiliate.data.value.minimumPayoutKobo)}.`); return; }
  if (amountKobo > affiliate.data.value.stats.availableKobo) { toast.error('That is more than your available balance.'); return; }
  if (!details.bankName || !details.accountName || !/^\d{10}$/.test(details.accountNumber)) { toast.error('Add your bank details before requesting a payout.'); return; }
  try {
    await affiliate.requestPayout({ amountKobo, bankName: details.bankName, accountName: details.accountName, accountNumber: details.accountNumber });
    toast.success('Payout requested. We review payouts within two business days.');
    payoutOpen.value = false; payout.amount = '';
  } catch (error) { toast.error((error as Error).message); }
}
function openPayout() {
  if (!affiliate.data.value) return;
  if (!affiliate.data.value.payoutDetails.bankName) detailsOpen.value = true;
  else payoutOpen.value = true;
}
onMounted(async () => {
  try {
    await affiliate.load();
    const saved = affiliate.data.value?.payoutDetails;
    if (saved) Object.assign(details, { bankName: saved.bankName || '', accountName: saved.accountName || '', accountNumber: saved.accountNumber || '' });
  } catch (error) { toast.error((error as Error).message); }
});
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Refer & earn" subtitle="Share Ojaly with another student business. Earn 20% of their first payment." eyebrow="Grow together">
      <template #actions><BaseButton variant="outline" :disabled="!affiliate.data.value" @click="share"><Share2 class="h-4 w-4" /> Share invite</BaseButton></template>
    </PageHeader>

    <div v-if="!auth.isOwner" class="card p-8 text-center"><Gift class="mx-auto h-8 w-8 text-brand-500" /><p class="mt-3 font-display text-xl font-bold">The affiliate programme is owner-only</p><p class="mt-1 text-xs text-muted">Ask the business owner to share the referral link.</p></div>
    <div v-else-if="affiliate.loading.value && !affiliate.data.value" class="grid gap-4"><div class="skeleton h-64 rounded-3xl" /><div class="grid gap-3 sm:grid-cols-4"><div v-for="i in 4" :key="i" class="skeleton h-28 rounded-2xl" /></div></div>
    <div v-else-if="!affiliate.data.value" class="card p-8 text-center"><p class="font-bold">We couldn't load your referral programme.</p><p class="mt-1 text-xs text-muted">{{ affiliate.error.value }}</p><BaseButton size="sm" class="mt-3" @click="affiliate.load()">Try again</BaseButton></div>
    <template v-else>
      <section class="relative overflow-hidden rounded-3xl bg-forest-900 p-6 text-white sm:p-8">
        <div class="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" /><div class="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
        <div class="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300"><Gift class="h-3 w-3" /> Referral programme</span>
            <h2 class="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Good businesses<br><span class="text-brand-400">travel together.</span></h2>
            <p class="mt-3 max-w-lg text-sm leading-relaxed text-white/70">When another business signs up with your code and makes their first payment, you earn {{ affiliate.data.value.commissionRate }}% of it. One commission per business. No cap on referrals.</p>
            <div class="mt-5 flex flex-col gap-2 sm:flex-row">
              <button type="button" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-400" @click="share"><Share2 class="h-4 w-4" /> Share my invite</button>
              <button type="button" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-bold text-white hover:bg-white/10" @click="copy(affiliate.data.value.link, 'Referral link copied.')"><Link2 class="h-4 w-4" /> Copy link</button>
            </div>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Your code</p>
            <div class="mt-2 flex items-center gap-2">
              <p class="min-w-0 flex-1 truncate font-display text-3xl font-bold tracking-[0.12em] text-accent">{{ affiliate.data.value.code }}</p>
              <button type="button" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20" aria-label="Copy referral code" @click="copy(affiliate.data.value.code, 'Code copied.')"><Copy class="h-4 w-4" /></button>
            </div>
            <p class="mt-2 text-[10px] text-white/50">Share the link, not just the code. Attribution happens when they sign up.</p>
            <a :href="`https://wa.me/?text=${encodeURIComponent(shareText)}`" target="_blank" rel="noopener" class="mt-4 flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#25D366] text-xs font-bold text-forest-900"><MessageCircle class="h-4 w-4" /> Send on WhatsApp</a>
          </div>
        </div>
      </section>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-4"><div class="flex items-center justify-between"><p class="text-[9px] font-bold uppercase tracking-wider text-muted">Available to withdraw</p><Wallet class="h-4 w-4 text-success" /></div><p class="mt-1 font-display text-3xl font-bold">{{ formatNaira(affiliate.data.value.stats.availableKobo) }}</p><p class="text-[10px] text-muted">Minimum {{ formatNaira(affiliate.data.value.minimumPayoutKobo) }}</p></div>
        <div class="card p-4"><div class="flex items-center justify-between"><p class="text-[9px] font-bold uppercase tracking-wider text-muted">On hold</p><Loader2 class="h-4 w-4 text-warning" /></div><p class="mt-1 font-display text-3xl font-bold">{{ formatNaira(affiliate.data.value.stats.pendingKobo) }}</p><p class="text-[10px] text-muted">Clears {{ affiliate.data.value.holdDays }} days after conversion</p></div>
        <div class="card p-4"><div class="flex items-center justify-between"><p class="text-[9px] font-bold uppercase tracking-wider text-muted">Total earned</p><Percent class="h-4 w-4 text-brand-500" /></div><p class="mt-1 font-display text-3xl font-bold">{{ formatNaira(affiliate.data.value.stats.totalEarnedKobo) }}</p><p class="text-[10px] text-muted">{{ formatNaira(affiliate.data.value.stats.paidKobo) }} paid out</p></div>
        <div class="card p-4"><div class="flex items-center justify-between"><p class="text-[9px] font-bold uppercase tracking-wider text-muted">Conversions</p><Users class="h-4 w-4 text-muted" /></div><p class="mt-1 font-display text-3xl font-bold">{{ affiliate.data.value.stats.convertedCount }}<span class="text-sm text-muted"> / {{ affiliate.data.value.stats.referralCount }}</span></p><p class="text-[10px] text-muted">Signups that became paying businesses</p></div>
      </div>

      <div class="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <BaseCard padding="none">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line p-5"><div><h2 class="font-display text-xl font-bold">Your referrals</h2><p class="text-[11px] text-muted">You see a business name only after they convert.</p></div><BaseBadge variant="brand">{{ affiliate.data.value.referrals.length }} total</BaseBadge></div>
          <div v-if="affiliate.data.value.referrals.length" class="divide-y divide-line">
            <div v-for="referral in affiliate.data.value.referrals" :key="referral.id" class="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-raised"><Users class="h-4 w-4 text-muted" /></div>
              <div class="min-w-0 flex-1"><p class="truncate text-xs font-bold">{{ referral.business }}</p><p class="text-[10px] text-muted">Joined {{ formatDate(referral.createdAt) }}<span v-if="referral.convertedAt"> · converted {{ formatDate(referral.convertedAt) }}</span></p></div>
              <div class="text-right"><p v-if="referral.commissionKobo" class="text-xs font-bold">{{ formatNaira(referral.commissionKobo) }}</p><BaseBadge :variant="statusVariant[referral.commissionStatus] || 'neutral'">{{ referral.commissionStatus === 'pending' ? 'On hold' : referral.commissionStatus }}</BaseBadge></div>
            </div>
          </div>
          <div v-else class="p-10 text-center"><Gift class="mx-auto h-8 w-8 text-brand-500" /><p class="mt-3 font-display text-lg font-bold">No referrals yet</p><p class="mt-1 text-xs text-muted">Share your link with one business owner you trust. That is how this starts.</p><BaseButton size="sm" class="mt-3" @click="share"><Share2 class="h-3.5 w-3.5" /> Share invite</BaseButton></div>
        </BaseCard>

        <div class="space-y-4">
          <BaseCard>
            <div class="flex items-center justify-between gap-2"><div><h3 class="font-display text-lg font-bold">Payouts</h3><p class="text-[11px] text-muted">Paid by bank transfer after review.</p></div><BaseButton size="sm" :disabled="affiliate.data.value.stats.availableKobo < affiliate.data.value.minimumPayoutKobo" @click="openPayout"><Banknote class="h-3.5 w-3.5" /> Request</BaseButton></div>
            <div class="mt-3 rounded-xl bg-raised/60 p-3">
              <p class="text-[9px] font-bold uppercase tracking-wider text-muted">Bank details</p>
              <template v-if="affiliate.data.value.payoutDetails.bankName"><p class="mt-1 text-xs font-bold">{{ affiliate.data.value.payoutDetails.bankName }} · {{ affiliate.data.value.payoutDetails.accountNumber }}</p><p class="text-[10px] text-muted">{{ affiliate.data.value.payoutDetails.accountName }}</p></template>
              <p v-else class="mt-1 text-xs text-muted">Add your Nigerian bank details before requesting a payout.</p>
              <button type="button" class="mt-2 text-[10px] font-bold text-brand-600 dark:text-brand-300" @click="detailsOpen = true">{{ affiliate.data.value.payoutDetails.bankName ? 'Change details' : 'Add bank details' }}</button>
            </div>
            <div v-if="affiliate.data.value.payouts.length" class="mt-3 divide-y divide-line">
              <div v-for="item in affiliate.data.value.payouts" :key="item.id" class="flex items-center gap-2 py-2.5 text-[11px]"><div class="min-w-0 flex-1"><p class="font-bold">{{ formatNaira(item.amountKobo) }}</p><p class="text-[9px] text-muted">{{ formatDateTime(item.createdAt) }}</p></div><BaseBadge :variant="statusVariant[item.status] || 'neutral'">{{ item.status }}</BaseBadge></div>
            </div>
            <p v-else class="mt-3 text-[11px] text-muted">No payout requests yet.</p>
          </BaseCard>

          <BaseCard class="bg-accent/30 dark:bg-accent/10">
            <h3 class="font-display text-lg font-bold">How it works</h3>
            <ol class="mt-3 space-y-3 text-[11px] text-muted">
              <li class="flex gap-2"><span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-canvas">1</span>Share your link with a business owner.</li>
              <li class="flex gap-2"><span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-canvas">2</span>They sign up and make their first subscription payment.</li>
              <li class="flex gap-2"><span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-canvas">3</span>You earn {{ affiliate.data.value.commissionRate }}%. After {{ affiliate.data.value.holdDays }} days it becomes withdrawable.</li>
            </ol>
            <p class="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted"><BadgeCheck class="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Self-referrals and duplicate businesses are rejected. Abuse removes the commission.</p>
          </BaseCard>
        </div>
      </div>
    </template>

    <BaseModal v-model:open="detailsOpen" title="Payout bank details" description="Use a Nigerian bank account in the business owner's name.">
      <div class="grid gap-3"><BaseInput v-model="details.bankName" label="Bank" placeholder="GTBank" /><BaseInput v-model="details.accountName" label="Account name" /><BaseInput v-model="details.accountNumber" label="Account number" inputmode="numeric" :maxlength="10" placeholder="0123456789" /></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="detailsOpen = false">Cancel</BaseButton><BaseButton :loading="affiliate.saving.value" @click="saveDetails">Save details</BaseButton></div>
    </BaseModal>

    <BaseModal v-model:open="payoutOpen" title="Request a payout" :description="`Available: ${formatNaira(affiliate.data.value?.stats.availableKobo || 0)}`">
      <BaseInput v-model="payout.amount" label="Amount" prefix="₦" inputmode="decimal" :hint="`Minimum ${formatNaira(affiliate.data.value?.minimumPayoutKobo || 0)}`" />
      <div class="mt-3 rounded-xl bg-raised/60 p-3 text-[11px]"><p class="font-bold">{{ details.bankName }} · {{ details.accountNumber }}</p><p class="text-muted">{{ details.accountName }}</p></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="payoutOpen = false">Cancel</BaseButton><BaseButton :loading="affiliate.saving.value" @click="requestPayout"><Banknote class="h-4 w-4" /> Request payout</BaseButton></div>
    </BaseModal>
  </div>
</template>

