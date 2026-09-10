"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import Field from "@/components/ui/field";
import { TagIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import { request } from "@/lib/api-client";
import { track } from "@/lib/track";
import { ANALYTICS_EVENT, majorUnits } from "@/lib/analytics";

const PromoField = ({ subtotalCents, rateId, promo, onApply, onClear }) => {
  const [code, setCode] = useState("");
  const [emptyError, setEmptyError] = useState(null);

  const apply = useMutation({
    mutationFn: () =>
      request("/api/promo", { body: { code, subtotalCents, rateId } }),
    onSuccess: (body) => {
      onApply(body.promo, body.totals);
      setCode("");
      track(ANALYTICS_EVENT.couponApplied, {
        coupon_id: body.promo.code,
        coupon_name: body.promo.kind,
        discount: majorUnits(body.totals.discountCents),
      });
    },
    onError: (error) =>
      track(ANALYTICS_EVENT.couponDenied, {
        coupon_id: code.trim().toUpperCase(),
        reason: error.message,
      }),
  });

  const error =
    emptyError ?? (apply.isError ? apply.error.message : null);

  const handleChange = (event) => {
    setCode(event.target.value);
    setEmptyError(null);
    apply.reset();
  };

  const handleApply = () => {
    if (!code.trim()) {
      setEmptyError("Enter a code");
      return;
    }

    setEmptyError(null);
    apply.mutate();
  };

  const handleClear = () => {
    onClear();
    setEmptyError(null);
    apply.reset();
  };

  if (promo)
    return (
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-rule pt-5">
        <p className={cn(META, "text-blurple")}>{promo.code} applied</p>

        <PillButton size="sm" onClick={handleClear}>
          Remove
        </PillButton>
      </div>
    );

  return (
    <div className="mt-8 border-t border-rule pt-5">
      <div className="flex items-end gap-3">
        <Field
          id="promo"
          label="Discount code"
          icon={<TagIcon className="h-4 w-4" />}
          value={code}
          onChange={handleChange}
          autoComplete="off"
          spellCheck="false"
          placeholder="WELCOME10"
          className="flex-1"
          error={error}
        />

        <PillButton
          size="sm"
          onClick={handleApply}
          disabled={apply.isPending}
          className="mb-1 shrink-0"
        >
          {apply.isPending ? "Checking" : "Apply"}
        </PillButton>
      </div>
    </div>
  );
};

export default PromoField;
