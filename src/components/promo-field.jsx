"use client";

import { useState } from "react";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import Field from "@/components/ui/field";
import { TagIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";

const PromoField = ({ subtotalCents, rateId, promo, onApply, onClear }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const handleChange = (event) => {
    setCode(event.target.value);
    setError(null);
  };

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Enter a code");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotalCents, rateId }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(body.error ?? "That code did not work");
        return;
      }

      onApply(body.promo, body.totals);
      setCode("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  };

  const handleClear = () => {
    onClear();
    setError(null);
  };

  if (promo)
    return (
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/10 pt-5">
        <p className={cn(META, "text-blurple")}>{promo.code} applied</p>

        <PillButton size="sm" onClick={handleClear}>
          Remove
        </PillButton>
      </div>
    );

  return (
    <div className="mt-8 border-t border-black/10 pt-5">
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
          disabled={pending}
          className="mb-1 shrink-0"
        >
          {pending ? "Checking" : "Apply"}
        </PillButton>
      </div>
    </div>
  );
};

export default PromoField;
