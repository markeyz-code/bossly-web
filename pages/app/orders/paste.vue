<script setup lang="ts">
import { AlertTriangle, ArrowLeft, Check, MessageCircle, Sparkles, Trash2, WandSparkles } from 'lucide-vue-next';
import { formatNaira } from '~/utils/money';
import { addDaysInput } from '~/utils/date';
definePageMeta({ layout: 'app' });
useSeoMeta({ title: 'Paste a WhatsApp chat' });
const router = useRouter();
const toast = useToast();
const whatsapp = useWhatsApp();
interface DraftItem { productId: string; variantId: string; name: string; variantName: string; quantity: number; unitPriceKobo: number; confidence?: number; rawPhrase?: string }
interface Parsed {
  customerName: string | null; customerPhone: string | null; deliveryAddress: string | null;
  items: DraftItem[]; unmatched: { phrase: string; quantity: number; reason: string }[];
  warnings: string[]; parserUsed: string; confidence: number;
  totals: { subtotalKobo: number; discountKobo: number; deliveryFeeKobo: number; totalKobo: number };
  amountOwedKobo: number | null; amountPaidKobo: number | null; dueDate: string;
}
const text = ref('');
const parsing = ref(false);
const parsed = ref<Parsed | null>(null);
const creating = ref(false);
const customerName = ref('');
const customerPhone = ref('');
const address = ref('');
const dueDate = ref(addDaysInput(7));
const lines = ref<DraftItem[]>([]);
const sample = `Hi Tola! I want 2 black hoodies and 1 cap.
My name is Tola Bakare, phone 08122334455.
Please deliver to 12 Adisa Street, Yaba. I'll pay 20,000 now and owe the rest.`;
const examples = [
  'I need 1 vintage cap. Name: Amaka, 09033445566. Deliver to Akoka.',
  'Good evening, 2 hoodies and 1 tee please. I am Chidi, 08055556666. Yaba.',
];
const total = computed(() => lines.value.reduce((s, l) => s + l.unitPriceKobo * l.quantity, 0) + (parsed.value?.totals.deliveryFeeKobo || 0));
async function parse() {
  if (text.value.trim().length < 5) { toast.error('Paste the customer conversation first.'); return; }
  parsing.value = true; parsed.value = null;
  try {
    const result = await whatsapp.parseChat(text.value) as unknown as Parsed;
    parsed.value = result;
    lines.value = result.items.map((i) => ({ ...i }));
    customerName.value = result.customerName || '';
    customerPhone.value = result.customerPhone || '';
    address.value = result.deliveryAddress || '';
    dueDate.value = result.dueDate || addDaysInput(7);
    toast.success(`${result.items.length} item${result.items.length === 1 ? '' : 's'} matched.`);
  } catch (error) { toast.error((error as Error).message); }
  finally { parsing.value = false; }
}
function useExample(value: string) { text.value = value; }
async function createOrder() {
  if (!parsed.value) return;
  if (!customerName.value.trim()) { toast.error('Add the customer’s name.'); return; }
  if (!customerPhone.value.trim()) { toast.error('Add the customer’s phone number.'); return; }
  if (!lines.value.length) { toast.error('Add at least one item.'); return; }
  creating.value = true;
  try {
    const result = await whatsapp.confirmChat({
      customerName: customerName.value, customerPhone: customerPhone.value,
      deliveryAddress: address.value, items: lines.value.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity, unitPriceKobo: l.unitPriceKobo })),
      amountPaidKobo: 0, dueDate: dueDate.value, createDebtNow: true, notes: `From pasted WhatsApp chat (${parsed.value.parserUsed} parser)`, source: 'paste_chat',
    }) as { id: string; orderNumber: string };
    toast.success(`${result.orderNumber} created. Confirm it to save the sale.`);
    await router.push(`/app/orders/${result.id}`);
  } catch (error) { toast.error((error as Error).message); }
  finally { creating.value = false; }
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-5">
    <div class="flex items-center gap-3"><NuxtLink to="/app/orders" class="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:bg-raised" aria-label="Back"><ArrowLeft class="h-4 w-4" /></NuxtLink><div><p class="eyebrow">No retyping</p><h1 class="font-display text-3xl font-bold tracking-tight">Paste a WhatsApp chat</h1></div></div>

    <div class="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <BaseCard>
        <div class="flex items-center gap-2"><div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C4A]"><MessageCircle class="h-5 w-5" /></div><div><h2 class="font-display text-lg font-bold">The conversation</h2><p class="text-[11px] text-muted">Copy the customer's message exactly as they sent it.</p></div></div>
        <textarea v-model="text" rows="12" data-tour="paste-input" class="input-base mt-4 resize-y font-mono text-xs leading-relaxed" placeholder="Paste the WhatsApp conversation here…"></textarea>
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" class="rounded-full border border-line px-3 py-1.5 text-[10px] font-semibold hover:border-ink" @click="useExample(sample)">Use sample order</button>
          <button v-for="(ex, i) in examples" :key="i" type="button" class="rounded-full border border-line px-3 py-1.5 text-[10px] font-semibold hover:border-ink" @click="useExample(ex)">Example {{ i + 1 }}</button>
        </div>
        <BaseButton block size="lg" class="mt-4" :loading="parsing" @click="parse"><WandSparkles class="h-5 w-5" /> Extract the order</BaseButton>
        <p class="mt-2 text-center text-[10px] text-muted">Names, phone, items, quantities, prices and delivery are matched against your catalog.</p>
      </BaseCard>

      <div class="space-y-4">
        <BaseCard v-if="!parsed" class="flex min-h-[300px] flex-col items-center justify-center text-center">
          <Sparkles class="h-9 w-9 text-brand-500" />
          <p class="mt-3 font-display text-lg font-bold">Your draft appears here</p>
          <p class="mt-1 max-w-xs text-xs leading-relaxed text-muted">We'll flag anything that doesn't match a product so you can fix it before saving.</p>
        </BaseCard>
        <template v-else>
          <BaseCard>
            <div class="flex items-center justify-between"><h2 class="font-display text-lg font-bold">Draft order</h2><BaseBadge :variant="parsed.parserUsed === 'llm' ? 'brand' : 'success'">{{ parsed.parserUsed === 'llm' ? 'AI-assisted' : 'Matched' }}</BaseBadge></div>
            <div v-if="parsed.unmatched.length" class="mt-3 rounded-xl border border-warning/30 bg-warning/10 p-3">
              <p class="flex items-center gap-1.5 text-xs font-bold text-warning"><AlertTriangle class="h-4 w-4" /> {{ parsed.unmatched.length }} unmatched item{{ parsed.unmatched.length === 1 ? '' : 's' }}</p>
              <p v-for="u in parsed.unmatched" :key="u.phrase" class="mt-1 text-[11px] text-muted">{{ u.quantity }} × {{ u.phrase }} — not in your catalog</p>
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <BaseInput v-model="customerName" label="Customer name" :error="!customerName ? 'Needed for the order' : ''" />
              <BaseInput v-model="customerPhone" label="Phone number" inputmode="tel" :error="!customerPhone ? 'Needed for WhatsApp' : ''" />
            </div>
            <div class="mt-3"><BaseInput v-model="address" label="Delivery address" /></div>
            <div class="mt-3"><BaseDatePicker v-model="dueDate" label="Balance due" /></div>
            <div class="mt-4 divide-y divide-line">
              <div v-for="line in lines" :key="line.variantId" class="flex items-center gap-2 py-2">
                <div class="min-w-0 flex-1"><p class="truncate text-xs font-bold">{{ line.name }}</p><p class="text-[10px] text-muted">{{ line.variantName }}</p></div>
                <div class="flex items-center gap-1 rounded-lg border border-line"><button class="flex h-7 w-7 items-center justify-center" @click="line.quantity = Math.max(1, line.quantity - 1)">−</button><span class="w-5 text-center text-xs font-bold">{{ line.quantity }}</span><button class="flex h-7 w-7 items-center justify-center" @click="line.quantity++">+</button></div>
                <span class="w-20 text-right text-xs font-bold">{{ formatNaira(line.unitPriceKobo * line.quantity) }}</span>
                <button class="text-muted hover:text-danger" @click="lines = lines.filter((l) => l.variantId !== line.variantId)"><Trash2 class="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div class="mt-3 flex items-baseline justify-between border-t border-line pt-3"><span class="text-sm font-bold">Estimated total</span><span class="font-display text-xl font-bold">{{ formatNaira(total) }}</span></div>
            <p v-if="parsed.amountOwedKobo" class="mt-1 text-[11px] text-warning">Chat says customer owes {{ formatNaira(parsed.amountOwedKobo) }}.</p>
            <BaseButton block size="lg" class="mt-4" :loading="creating" :disabled="!lines.length || Boolean(parsed.unmatched.length)" @click="createOrder"><Check class="h-5 w-5" /> Create draft order</BaseButton>
            <p v-if="parsed.unmatched.length" class="mt-2 text-center text-[10px] font-semibold text-warning">Resolve unmatched items first so stock stays accurate.</p>
          </BaseCard>
          <div v-if="parsed.warnings.length" class="rounded-2xl border border-line bg-raised/50 p-3 text-[11px] text-muted"><p v-for="w in parsed.warnings" :key="w">• {{ w }}</p></div>
        </template>
      </div>
    </div>
  </div>
</template>
