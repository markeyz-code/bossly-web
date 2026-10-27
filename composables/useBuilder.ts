import { builderApi } from '~/api/factories/builderApi';
import type { BuilderData, Business } from '~/types';

export function useBuilder() {
  const data = ref<BuilderData | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const publishing = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true; error.value = null;
    try { data.value = await builderApi.getBuilder(); }
    catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function update(payload: Partial<Business>) {
    saving.value = true;
    try {
      const updated = await builderApi.updateBuilder(payload);
      if (data.value) data.value.business = updated;
      return updated;
    } finally { saving.value = false; }
  }
  async function publish() {
    publishing.value = true;
    try { const result = await builderApi.publish(); if (data.value) data.value.business.storefrontPublished = true; return result; }
    finally { publishing.value = false; }
  }
  async function unpublish() {
    publishing.value = true;
    try { await builderApi.unpublish(); if (data.value) data.value.business.storefrontPublished = false; }
    finally { publishing.value = false; }
  }
  return { data, loading, saving, publishing, error, load, update, publish, unpublish };
}
