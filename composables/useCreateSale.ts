import { useSales } from './useSales';
import { useToast } from './useToast';
import type { SalePayload } from '~/api/types';

export function useCreateSale() {
  const sales = useSales();
  const toast = useToast();
  async function submit(payload: SalePayload) {
    const result = await sales.create(payload);
    if ('queued' in result) return result;
    toast.success(`${result.saleNumber} saved. You made ${(result.grossProfitKobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })} gross profit.`, 'Sale in the books');
    return result;
  }
  return { submit, saving: sales.saving };
}
