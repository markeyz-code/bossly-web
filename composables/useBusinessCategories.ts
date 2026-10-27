import { businessesApi } from '~/api/factories/businessesApi';

export function useBusinessCategories() {
  return useAsyncData('business-category-options', () => businessesApi.categories(), { default: () => [] });
}
