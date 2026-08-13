"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionToastState = {
  error?: string | null;
  success?: unknown;
};

export function useActionToast(
  pending: boolean,
  state: ActionToastState,
  {
    successMessage,
    successDescription,
    errorTitle = "حدث خطأ",
  }: {
    successMessage: string;
    successDescription?: string;
    errorTitle?: string;
  },
) {
  const wasPending = useRef(false);

  useEffect(() => {
    const finished = wasPending.current && !pending;
    wasPending.current = pending;
    if (!finished) return;

    if (state.success) {
      toast.success(successMessage, {
        description: successDescription,
      });
      return;
    }

    if (state.error) {
      toast.error(errorTitle, {
        description: state.error,
      });
    }
  }, [
    pending,
    state.error,
    state.success,
    successMessage,
    successDescription,
    errorTitle,
  ]);
}
