<script setup lang="ts">
import { ArrowLeft, CreditCard, ExternalLink, FileText, Link2, Mail, MessageCircle, Plus, ReceiptText, Trash2 } from 'lucide-vue-next';
import { formatNaira, nairaToKobo } from '~/utils/money';
import { addDaysInput, formatDate, todayInput } from '~/utils/date';
import { whatsappLink } from '~/utils/phone';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Invoices & receipts' });
const toast = useToast();
const api = useReceipts();
const active = ref<'invoices' | 'receipts'>('invoices');
const createOpen = ref(false);
const items = ref<{ name: string; quantity: number; price: string }[]>([{ name: '', quantity: 1, price: '' }]);
const form = reactive({ customerName: '', customerEmail: '', customerPhone: '', customerAddress: '', dueDate: addDaysInput(14), discount: '', delivery: '', notes: '', sendEmail: true });
const subtotal = computed(() => items.value.reduce((s, i) => s + nairaToKobo(i.price) * i.quantity, 0));
const total = computed(() => Math.max(0, subtotal.value - nairaToKobo(form.discount) + nairaToKobo(form.delivery)));
function addLine() { items.value.push({ name: '', quantity: 1, price: '' }); }
async function createInvoice() {
  if (!form.customerName || !items.value.some((i) => i.name && nairaToKobo(i.price))) { toast.error('Add a customer and at least one line item.'); return; }
  try {
    const invoice = await api.create({
      customerName: form.customerName, customerEmail: form.customerEmail || undefined, customerPhone: form.customerPhone,
      customerAddress: form.customerAddress, items: items.value.filter((i) => i.name).map((i) => ({ name: i.name, quantity: i.quantity, unitPriceKobo: nairaToKobo(i.price) })),
      discountKobo: nairaToKobo(form.discount), deliveryFeeKobo: nairaToKobo(form.delivery), dueDate: form.dueDate, notes: form.notes, sendEmail: form.sendEmail,
    });
    toast.success(`${invoice.invoiceNumber} created.`); createOpen.value = false; await load();
    Object.assign(form, { customerName: '', customerEmail: '', customerPhone: '', customerAddress: '', dueDate: addDaysInput(14), discount: '', delivery: '', notes: '', sendEmail: true });
    items.value = [{ name: '', quantity: 1, price: '' }];
  } catch (error) { toast.error((error as Error).message); }
}
async function sendInvoice(id: string) {
  try { const r = await api.send(id); toast.success(r.sent ? 'Invoice emailed.' : 'Invoice email could not be sent. Check Resend.'); await load(); }
  catch (error) { toast.error((error as Error).message); }
}
function shareInvoice(invoice: { invoiceNumber: string; customerName: string; customerPhone: string; publicToken: string; totalKobo: number }) {
  if (!invoice.customerPhone) { toast.error('Add the customer’s phone number first.'); return; }
  const url = `${window.location.origin}/invoice/${invoice.publicToken}`;
  const message = `Hello ${invoice.customerName.split(' ')[0]}, here is invoice ${invoice.invoiceNumber} for ${formatNaira(invoice.totalKobo)}. View and pay here: ${url}`;
  window.open(whatsappLink(invoice.customerPhone, message), '_blank');
}
async function markPaid(id: string) { try { await api.markPaid(id); toast.success('Invoice marked paid.'); await load(); } catch (e) { toast.error((e as Error).message); } }
async function paymentLink(id: string) { try { const r = await api.paymentLink(id); await navigator.clipboard.writeText(r.authorizationUrl).catch(() => undefined); toast.success('Payment link copied.'); } catch (e) { toast.error((e as Error).message); } }
async function load() { if (active.value === 'invoices') await api.loadInvoices(); else await api.loadReceipts(); }
watch(active, load);
onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-3"><NuxtLink to="/app/sales" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface" aria-label="Back"><ArrowLeft class="h-4 w-4" /></NuxtLink><div><p class="eyebrow">Paperwork, handled</p><h1 class="font-display text-3xl font-bold">Invoices & receipts</h1></div><BaseButton class="ml-auto" @click="createOpen = true"><Plus class="h-4 w-4" /> New invoice</BaseButton></div>
    <div class="inline-flex rounded-xl border border-line bg-surface p-1"><button class="rounded-lg px-4 py-2 text-xs font-bold" :class="active === 'invoices' ? 'bg-ink text-canvas' : 'text-muted'" @click="active = 'invoices'">Invoices</button><button class="rounded-lg px-4 py-2 text-xs font-bold" :class="active === 'receipts' ? 'bg-ink text-canvas' : 'text-muted'" @click="active = 'receipts'">Receipts</button></div>

    <BaseTable v-if="active === 'invoices'" :loading="api.loading.value">
      <template #head><tr><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Invoice</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Customer</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted">Total</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Status</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted"></th></tr></template>
      <template #body>
        <tr v-for="invoice in api.invoices.value" :key="invoice.id" class="border-b border-line last:border-0 hover:bg-raised/40">
          <td class="px-4 py-3"><p class="text-xs font-bold">{{ invoice.invoiceNumber }}</p><p class="text-[10px] text-muted">Due {{ formatDate(invoice.dueDate) }}</p></td>
          <td class="px-4 py-3"><p class="text-xs font-semibold">{{ invoice.customerName }}</p><p class="text-[10px] text-muted">{{ invoice.customerEmail || invoice.customerPhone }}</p></td>
          <td class="px-4 py-3 text-right text-xs font-bold">{{ formatNaira(invoice.totalKobo) }}</td>
          <td class="px-4 py-3"><BaseBadge :variant="invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'" dot>{{ invoice.status }}</BaseBadge></td>
          <td class="px-4 py-3"><div class="flex flex-wrap justify-end gap-1"><a :href="`/invoice/${invoice.publicToken}`" target="_blank" class="rounded-lg p-1.5 text-muted hover:bg-raised" title="Open invoice"><ExternalLink class="h-3.5 w-3.5" /></a><button class="rounded-lg p-1.5 text-muted hover:bg-raised" title="Email invoice" @click="sendInvoice(invoice.id)"><Mail class="h-3.5 w-3.5" /></button><button class="rounded-lg p-1.5 text-muted hover:bg-raised" title="Share invoice on WhatsApp" @click="shareInvoice(invoice)"><MessageCircle class="h-3.5 w-3.5" /></button><button v-if="invoice.status !== 'paid'" class="rounded-lg p-1.5 text-muted hover:bg-raised" title="Payment link" @click="paymentLink(invoice.id)"><Link2 class="h-3.5 w-3.5" /></button><button v-if="invoice.status !== 'paid'" class="rounded-lg p-1.5 text-success hover:bg-success/5" title="Mark paid" @click="markPaid(invoice.id)"><CreditCard class="h-3.5 w-3.5" /></button></div></td>
        </tr>
        <tr v-if="!api.invoices.value.length"><td colspan="5"><BaseEmptyState compact title="No invoices yet" message="Invoice a bulk order or a corporate customer. It gets a number, PDF and payment link." action-label="Create invoice" @action="createOpen = true"><template #icon><FileText class="h-8 w-8" /></template></BaseEmptyState></td></tr>
      </template>
    </BaseTable>

    <BaseTable v-else :loading="api.loading.value">
      <template #head><tr><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Receipt</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Customer</th><th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted">Total</th><th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted">Issued</th><th class="px-4 py-3"></th></tr></template>
      <template #body><tr v-for="receipt in api.receipts.value" :key="receipt.id" class="border-b border-line last:border-0 hover:bg-raised/40"><td class="px-4 py-3 text-xs font-bold">{{ receipt.receiptNumber }}</td><td class="px-4 py-3"><p class="text-xs font-semibold">{{ receipt.customerName }}</p><p class="text-[10px] text-muted">{{ receipt.customerEmail || receipt.customerPhone }}</p></td><td class="px-4 py-3 text-right text-xs font-bold">{{ formatNaira(receipt.totalKobo) }}</td><td class="px-4 py-3 text-[11px] text-muted">{{ formatDate(receipt.issuedAt) }}</td><td class="px-4 py-3 text-right"><a :href="`/receipt/${receipt.publicToken}`" target="_blank" class="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-300">Open <ExternalLink class="h-3 w-3" /></a></td></tr><tr v-if="!api.receipts.value.length"><td colspan="5"><BaseEmptyState compact title="No receipts yet" message="Every completed sale generates a branded receipt automatically."><template #icon><ReceiptText class="h-8 w-8" /></template></BaseEmptyState></td></tr></template>
    </BaseTable>

    <BaseModal v-model:open="createOpen" title="Create an invoice" description="For bulk orders and customers who need paperwork." size="lg">
      <div class="grid gap-3 sm:grid-cols-2"><BaseInput v-model="form.customerName" label="Customer / company" required /><BaseInput v-model="form.customerEmail" label="Email" type="email" /><BaseInput v-model="form.customerPhone" label="Phone" /><BaseInput v-model="form.customerAddress" label="Address" /><BaseDatePicker v-model="form.dueDate" label="Due date" :min="todayInput()" /><BaseInput v-model="form.notes" label="Note" /></div>
      <div class="mt-4"><div class="mb-2 flex items-center justify-between"><p class="text-sm font-bold">Line items</p><button class="text-xs font-bold text-brand-600 dark:text-brand-300" @click="addLine"><Plus class="mr-0.5 inline h-3 w-3" /> Add line</button></div><div class="space-y-2"><div v-for="(line, index) in items" :key="index" class="flex items-center gap-2"><input v-model="line.name" placeholder="Item description" class="input-base flex-1"><input v-model.number="line.quantity" type="number" min="1" class="input-base w-20"><input v-model="line.price" placeholder="₦ price" class="input-base w-28"><button class="text-danger" aria-label="Remove line" @click="items.splice(index, 1)"><Trash2 class="h-4 w-4" /></button></div></div></div>
      <div class="mt-3 grid gap-3 sm:grid-cols-2"><BaseInput v-model="form.discount" label="Discount" prefix="₦" /><BaseInput v-model="form.delivery" label="Delivery" prefix="₦" /></div>
      <div class="mt-3 flex justify-between border-t border-line pt-3 text-sm font-bold"><span>Total</span><span>{{ formatNaira(total) }}</span></div>
      <label class="mt-3 flex items-center gap-2 text-xs"><input v-model="form.sendEmail" type="checkbox" class="rounded"> Email invoice to customer</label>
      <div class="mt-5 flex justify-end gap-2"><BaseButton variant="ghost" @click="createOpen = false">Cancel</BaseButton><BaseButton :loading="api.saving.value" @click="createInvoice">Create invoice</BaseButton></div>
    </BaseModal>
  </div>
</template>
