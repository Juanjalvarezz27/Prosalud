"use client";

import { toast, type ExternalToast } from "sonner";

// Convención centralizada de notificaciones en español para toda la app
export const notify = {
  success(message: string, options?: ExternalToast) {
    return toast.success(message, options);
  },
  error(message: string, options?: ExternalToast) {
    return toast.error(message, options);
  },
  warning(message: string, options?: ExternalToast) {
    return toast.warning(message, options);
  },
  info(message: string, options?: ExternalToast) {
    return toast.info(message, options);
  },
  loading(message: string, options?: ExternalToast) {
    return toast.loading(message, options);
  },
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) {
    return toast.promise(promise, messages);
  },
};
