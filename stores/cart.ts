import { defineStore } from 'pinia';
import type { CartItem } from '~/types';

const KEY = 'bossly.cart.v1';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const slug = ref('');
  const businessName = ref('');
  const hydrated = ref(false);

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0));
  const subtotalKobo = computed(() => items.value.reduce((s, i) => s + i.priceKobo * i.quantity, 0));
  const isEmpty = computed(() => items.value.length === 0);

  function persist() {
    if (!import.meta.client) return;
    localStorage.setItem(KEY, JSON.stringify({ items: items.value, slug: slug.value, businessName: businessName.value }));
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: CartItem[]; slug?: string; businessName?: string };
        items.value = Array.isArray(parsed.items) ? parsed.items : [];
        slug.value = parsed.slug || '';
        businessName.value = parsed.businessName || '';
      }
    } catch { /* ignore corrupt cart */ }
    hydrated.value = true;
  }

  function init(storeSlug: string, name: string) {
    if (slug.value && slug.value !== storeSlug) clear();
    slug.value = storeSlug;
    businessName.value = name;
    persist();
  }

  function add(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    const existing = items.value.find((i) => i.variantId === item.variantId);
    if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
    else items.value.push({ ...item, quantity: Math.min(99, quantity) });
    persist();
  }

  function setQuantity(variantId: string, quantity: number) {
    const item = items.value.find((i) => i.variantId === variantId);
    if (!item) return;
    if (quantity <= 0) remove(variantId);
    else item.quantity = Math.min(99, quantity);
    persist();
  }

  function remove(variantId: string) {
    items.value = items.value.filter((i) => i.variantId !== variantId);
    persist();
  }

  function clear() {
    items.value = [];
    slug.value = '';
    businessName.value = '';
    if (import.meta.client) localStorage.removeItem(KEY);
  }

  return { items, slug, businessName, hydrated, count, subtotalKobo, isEmpty, hydrate, init, add, setQuantity, remove, clear };
});
