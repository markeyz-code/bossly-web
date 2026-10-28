import { reportsApi } from '~/api/factories/reportsApi';
import type { DashboardData } from '~/types';
import { downloadBlob } from '~/utils/download';

export function useDashboard() {
  const data = ref<DashboardData | null>(null);
  const loading = ref(false);
  const exporting = ref(false);
  const error = ref<string | null>(null);
  const range = ref('month');
  const customFrom = ref('');
  const customTo = ref('');

  async function load(preset = range.value) {
    range.value = preset;
    loading.value = true; error.value = null;
    try {
      data.value = await reportsApi.dashboard({ range: preset, ...(preset === 'custom' ? { from: customFrom.value, to: customTo.value } : {}) });
    } catch (err) { error.value = (err as Error).message; }
    finally { loading.value = false; }
  }
  async function exportCsv() {
    exporting.value = true;
    try {
      const blob = await reportsApi.downloadCsv({ range: range.value, ...(range.value === 'custom' ? { from: customFrom.value, to: customTo.value } : {}) });
      downloadBlob(blob, `ojaly-report-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally { exporting.value = false; }
  }
  async function exportPdf() {
    exporting.value = true;
    try {
      const blob = await reportsApi.downloadPdf({ range: range.value, ...(range.value === 'custom' ? { from: customFrom.value, to: customTo.value } : {}) });
      downloadBlob(blob, `ojaly-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally { exporting.value = false; }
  }
  return { data, loading, exporting, error, range, customFrom, customTo, load, exportCsv, exportPdf };
}
