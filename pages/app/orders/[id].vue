<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Copy, ExternalLink, Link2, MessageCircle, PackageCheck, Send, Truck, XCircle } from 'lucide-vue-next';
import type { Order } from '~/types';
import { formatNaira, nairaToKobo } from '~/utils/money';
import { formatDateTime } from '~/utils/date';
import { whatsappLink } from '~/utils/phone';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Order details' });
const route = useRoute();
const config = useRuntimeConfig();
const toast = useToast();
const orderApi = useOrders();
const receipts = useReceipts();
const order = ref<Order | null>(null);
const loading = ref(true);
const actionLoading = ref(false);
const payOpen = ref(false);
const cancelOpen = ref(false);
const amount = ref('');
const method = ref('cash');
const cancelReason = ref('');
const paymentLink = ref<string | null>(null);
const receiptToken = ref('');
const orderId = computed(() => String(route.params.id));

async function load() {
  loading.value = true;
  try { order.value = await orderApi.getOrder(orderId.value); amount.value = String(((order.value?.totalKobo || 0) - (order.value?.amountPaidKobo || 0)) / 100); }
  catch (error) { toast.error((error as Error).message); }
  finally { loading.value = false; }
}
async function act(action: 'confirm' | 'deliver') {
  if (!order.value) return;
  actionLoading.value = true;
  try {
    await (action === 'confirm' ? orderApi.confirm(order.value.id) : orderApi.deliver(order.value.id));
    toast.success(action === 'confirm' ? 'Order confirmed. Sale created.' : 'Order marked delivered.');
    await load();
  } catch (error) { toast.error((error as Error).message); }
  finally { actionLoading.value = false; }
}
async function recordPay() {
  if (!order.value) return;
  actionLoading.value = true;
  try {
    await orderApi.pay(order.value.id, nairaToKobo(amount.value), method.value);
    toast.success('Payment recorded.'); payOpen.value = false; await load();
  } catch (error) { toast.error((error as Error).message); }
  finally { actionLoading.value = false; }
}
async function cancelOrder() {
  if (!order.value) return;
  actionLoading.value = true;
  try { await orderApi.cancel(order.value.id, cancelReason.value); toast.success('Order cancelled and stock restored.'); cancelOpen.value = false; await load(); }
  catch (error) { toast.error((error as Error).message); }
  finally { actionLoading.value = false; }
}
async function makePaymentLink() {
  if (!order.value) return;
  actionLoading.value = true;
  try {
    const link = await orderApi.linkPayment(order.value.id, order.value.customerEmail || undefined);
    paymentLink.value = link.authorizationUrl;
    await navigator.clipboard.writeText(link.authorizationUrl).catch(() => undefined);
    toast.success('Paystack link created and copied. Share it with the customer.');
  } catch (error) { toast.error((error as Error).message); }
  finally { actionLoading.value = false; }
}
async function openReceipt() {
  if (!order.value?.receiptId) return;
  try { const receipt = await receipts.getReceipt(order.value.receiptId); receiptToken.value = receipt.publicToken; window.open(`/receipt/${receipt.publicToken}`, '_blank'); }
  catch (error) { toast.error((error as Error).message); }
}
function copyPublicLink() {
  if (!order.value) return;
  void navigator.clipboard.writeText(`${window.location.origin}/order/${order.value.publicToken}`);
  toast.success('Order tracking link copied.');
}
const paymentWhatsappLink = computed(() => order.value && paymentLink.value ? whatsappLink(order.value.customerPhone, `Hello ${order.value.customerName.split(' ')[0]}, here is a secure payment link for order ${order.value.orderNumber}: ${paymentLink.value}`) : '');
const waMessage = computed(() => order.value ? `Hello ${order.value.customerName.split(' ')[0]}, this is about your order ${order.value.orderNumber} — total ${formatNaira(order.value.totalKobo)}.${outstanding.value > 0 ? ` Outstanding: ${formatNaira(outstanding.value)}.` : ''}\n\nTrack and pay here: ${config.public.appUrl}/order/${order.value.publicToken}` : '');
const statusOrder = ['pending', 'confirmed', 'paid', 'delivered'];
function stepDone(status: string) { if (!order.value) return false; if (order.value.status === 'cancelled') return false; return statusOrder.indexOf(order.value.status) >= statusOrder.indexOf(status); }
const outstanding = computed(() => Math.max(0, (order.value?.totalKobo || 0) - (order.value?.amountPaidKobo || 0)));
onMounted(load);
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-5">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3"><NuxtLink to="/app/orders" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:bg-raised" aria-label="Back"><ArrowLeft class="h-4 w-4" /></NuxtLink><div><p class="eyebrow">Order</p><h1 class="font-display text-3xl font-bold tracking-tight">{{ order?.orderNumber || 'Loading…' }}</h1></div></div>
      <BaseBadge v-if="order" :variant="order.status === 'paid' || order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'neutral' : order.status === 'confirmed' ? 'info' : 'warning'" dot>{{ order.status }}</BaseBadge>
    </div>

    <div v-if="loading" class="space-y-4"><div class="skeleton h-32 rounded-3xl" /><div class="skeleton h-64 rounded-3xl" /></div>
    <template v-else-if="order">
      <BaseCard>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div><p class="text-xs text-muted">Customer</p><p class="font-bold">{{ order.customerName }}</p><p class="text-xs text-muted">{{ order.customerPhone }}{{ order.deliveryAddress ? ` · ${order.deliveryAddress}` : '' }}</p></div>
          <div class="text-right"><p class="text-xs text-muted">Order total</p><p class="font-display text-2xl font-bold">{{ formatNaira(order.totalKobo) }}</p><p class="text-xs" :class="outstanding ? 'text-warning' : 'text-success'">{{ outstanding ? `${formatNaira(outstanding)} outstanding` : 'Fully paid' }}</p></div>
        </div>
        <div v-if="order.status !== 'cancelled'" class="mt-6 grid grid-cols-4 gap-1">
          <div v-for="(status, index) in statusOrder" :key="status" class="flex flex-col items-center gap-1.5">
            <div class="flex w-full items-center"><div class="h-0.5 flex-1" :class="index === 0 ? 'bg-transparent' : stepDone(status) ? 'bg-success' : 'bg-line'" /><div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2" :class="stepDone(status) ? 'border-success bg-success text-white' : 'border-line bg-surface text-muted'"><CheckCircle2 class="h-4 w-4" /></div><div class="h-0.5 flex-1" :class="index === statusOrder.length - 1 ? 'bg-transparent' : stepDone(statusOrder[index + 1]) ? 'bg-success' : 'bg-line'" /></div>
            <span class="text-[10px] font-bold capitalize" :class="stepDone(status) ? 'text-success' : 'text-muted'">{{ status }}</span>
          </div>
        </div>
        <div class="mt-5 flex flex-wrap gap-2">
          <BaseButton v-if="order.status === 'pending'" size="sm" :loading="actionLoading" @click="act('confirm')"><CheckCircle2 class="h-4 w-4" /> Confirm order</BaseButton>
          <BaseButton v-if="outstanding > 0 && order.status !== 'cancelled'" size="sm" variant="outline" @click="payOpen = true">Record payment</BaseButton>
          <BaseButton v-if="outstanding > 0 && order.status !== 'cancelled'" size="sm" variant="outline" :loading="actionLoading" @click="makePaymentLink"><Link2 class="h-4 w-4" /> Paystack link</BaseButton>
          <BaseButton v-if="['confirmed', 'paid'].includes(order.status)" size="sm" variant="outline" :loading="actionLoading" @click="act('deliver')"><Truck class="h-4 w-4" /> Mark delivered</BaseButton>
          <BaseButton v-if="order.receiptId" size="sm" variant="ghost" @click="openReceipt"><ExternalLink class="h-4 w-4" /> Receipt</BaseButton>
          <BaseButton v-if="['pending', 'confirmed'].includes(order.status)" size="sm" variant="ghost" class="text-danger" @click="cancelOpen = true"><XCircle class="h-4 w-4" /> Cancel</BaseButton>
          <BaseButton :href="whatsappLink(order.customerPhone, waMessage)" target="_blank" size="sm" variant="ghost"><MessageCircle class="h-4 w-4" /> WhatsApp</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="copyPublicLink"><Copy class="h-4 w-4" /> Tracking link</BaseButton>
        </div>
        <div v-if="paymentLink" class="mt-3 rounded-xl border border-success/20 bg-success/5 p-3 text-xs"><p class="font-bold text-success">Paystack link ready</p><a :href="paymentLink" target="_blank" class="break-all underline">{{ paymentLink }}</a><a :href="paymentWhatsappLink" target="_blank" rel="noopener" class="mt-2 inline-flex items-center gap-1 font-bold text-success"><MessageCircle class="h-3.5 w-3.5" /> Send link on WhatsApp</a></div>
      </BaseCard>

      <div class="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <BaseCard>
          <h2 class="font-display text-lg font-bold">Items</h2>
          <div class="mt-3 divide-y divide-line">
            <div v-for="item in order.items" :key="item.productId + item.variantId" class="flex items-center justify-between gap-3 py-3 text-sm"><div><p class="font-semibold">{{ item.quantity }} × {{ item.name }}</p><p class="text-[10px] text-muted">{{ item.variantName }} · {{ formatNaira(item.unitPriceKobo) }} each</p></div><p class="font-bold">{{ formatNaira(item.lineTotalKobo) }}</p></div>
          </div>
          <dl class="mt-3 space-y-1.5 border-t border-line pt-3 text-xs">
            <div class="flex justify-between"><dt class="text-muted">Subtotal</dt><dd>{{ formatNaira(order.subtotalKobo) }}</dd></div>
            <div v-if="order.discountKobo" class="flex justify-between"><dt class="text-muted">Discount</dt><dd>-{{ formatNaira(order.discountKobo) }}</dd></div>
            <div v-if="order.deliveryFeeKobo" class="flex justify-between"><dt class="text-muted">Delivery</dt><dd>{{ formatNaira(order.deliveryFeeKobo) }}</dd></div>
            <div class="flex justify-between font-bold"><dt>Total</dt><dd>{{ formatNaira(order.totalKobo) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Paid</dt><dd class="text-success">{{ formatNaira(order.amountPaidKobo) }}</dd></div>
          </dl>
          <p v-if="order.notes" class="mt-3 rounded-xl bg-raised/50 p-3 text-xs text-muted">{{ order.notes }}</p>
        </BaseCard>
        <div class="space-y-4">
          <BaseCard>
            <h2 class="font-display text-lg font-bold">Timeline</h2>
            <div class="mt-3 space-y-3">
              <div v-for="event in [...order.history].reverse()" :key="event.at + event.status" class="flex gap-3"><span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" /><div><p class="text-xs font-bold capitalize">{{ event.status }}</p><p class="text-[10px] text-muted">{{ formatDateTime(event.at) }} · {{ event.note }}</p></div></div>
            </div>
          </BaseCard>
          <BaseCard>
            <h2 class="font-display text-lg font-bold">Delivery</h2>
            <p class="mt-2 text-xs leading-relaxed text-muted">{{ order.deliveryAddress || 'No delivery address provided.' }}</p>
            <p v-if="order.deliveryDetails" class="mt-1 text-[11px] text-muted">{{ order.deliveryDetails }}</p>
            <p class="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted">Source</p><p class="text-xs font-semibold capitalize">{{ order.source.replace('_', ' ') }}</p>
          </BaseCard>
        </div>
      </div>
    </template>

    <BaseModal v-model:open="payOpen" title="Record a payment" :description="`Outstanding: ${formatNaira(outstanding)}`">
      <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="amount" label="Amount" prefix="₦" inputmode="decimal" /><BaseSelect v-model="method" label="Method" :options="[{ value: 'cash', label: 'Cash' }, { value: 'transfer', label: 'Transfer' }, { value: 'pos', label: 'POS' }, { value: 'paystack', label: 'Paystack' }, { value: 'other', label: 'Other' }]" /></div>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="payOpen = false">Cancel</BaseButton><BaseButton :loading="actionLoading" @click="recordPay">Save payment</BaseButton></div>
    </BaseModal>
    <BaseModal v-model:open="cancelOpen" title="Cancel this order?" description="Stock will be returned to inventory. This cannot be undone.">
      <BaseTextarea v-model="cancelReason" label="Reason" placeholder="Customer changed their mind" />
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="cancelOpen = false">Keep order</BaseButton><BaseButton variant="danger" :loading="actionLoading" @click="cancelOrder">Cancel order</BaseButton></div>
    </BaseModal>
  </div>
</template>
