import { affiliatesApi } from '~/api/factories/affiliatesApi';
import type { AffiliateOverview, AffiliatePayoutDetails } from '~/types';

export function useAffiliate() {
  const data = ref<AffiliateOverview | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true; error.value = null;
    try { data.value = await affiliatesApi.overview(); return data.value; }
    catch (err) { error.value = (err as Error).message; throw err; }
    finally { loading.value = false; }
  }

  async function updateDetails(payload: AffiliatePayoutDetails) {
    saving.value = true;
    try {
      const details = await affiliatesApi.updateDetails(payload);
      if (data.value) data.value.payoutDetails = details;
      return details;
    } finally { saving.value = false; }
  }

  async function requestPayout(payload: AffiliatePayoutDetails & { amountKobo: number }) {
    saving.value = true;
    try {
      const result = await affiliatesApi.requestPayout(payload);
      await load();
      return result;
    } finally { saving.value = false; }
  }

  const hasDetails = computed(() => Boolean(data.value?.payoutDetails.bankName && data.value?.payoutDetails.accountName && data.value?.payoutDetails.accountNumber));

  return { data, loading, saving, error, hasDetails, load, updateDetails, requestPayout };
}
