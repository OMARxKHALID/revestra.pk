"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import PillButton from "@/components/ui/pill-button";
import ErrorNotice from "@/components/ui/error-notice";
import { request } from "@/lib/api-client";
import cn from "@/lib/utils/cn";
import { NOTICE } from "@/lib/type";

const CancelOrderButton = ({ reference, token }) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const cancel = useMutation({
    mutationFn: () =>
      request("/api/orders/cancel", { body: { reference, token } }),
    onSuccess: () => router.refresh(),
  });

  const handleAsk = () => setConfirming(true);
  const handleKeep = () => setConfirming(false);
  const handleCancel = () => cancel.mutate();

  return (
    <div className="mt-10 border-t border-rule pt-6">
      {confirming ? (
        <div className="flex flex-col items-start gap-3">
          <p className={cn(NOTICE, "text-ink-soft")}>
            Cancel this order? Every piece on it goes back on sale straight
            away, and one of a kind means someone else may take it.
          </p>

          <div className="flex flex-wrap gap-3">
            <PillButton
              size="sm"
              onClick={handleCancel}
              disabled={cancel.isPending}
            >
              {cancel.isPending ? "Cancelling…" : "Yes, cancel it"}
            </PillButton>

            <PillButton size="sm" onClick={handleKeep}>
              Keep it
            </PillButton>
          </div>
        </div>
      ) : (
        <PillButton size="sm" onClick={handleAsk}>
          Cancel this order
        </PillButton>
      )}

      {cancel.isError && <ErrorNotice error={cancel.error} className="mt-4" />}
    </div>
  );
};

export default CancelOrderButton;
