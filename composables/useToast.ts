export interface ToastItem {
  id: string;
  tone: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
}

export function useToast() {
  const toasts = useState<ToastItem[]>('bossly-toasts', () => []);

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function push(tone: ToastItem['tone'], message: string, title?: string, duration = 4200) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    toasts.value = [...toasts.value.slice(-3), { id, tone, message, title }];
    if (import.meta.client) window.setTimeout(() => dismiss(id), duration);
    return id;
  }

  return {
    toasts,
    dismiss,
    success: (message: string, title?: string) => push('success', message, title),
    error: (message: string, title?: string) => push('error', message, title, 6000),
    info: (message: string, title?: string) => push('info', message, title),
    warning: (message: string, title?: string) => push('warning', message, title, 5500),
  };
}
