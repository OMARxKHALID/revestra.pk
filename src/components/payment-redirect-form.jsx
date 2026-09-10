"use client";

import { useEffect, useRef } from "react";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import PillButton from "@/components/ui/pill-button";

const PaymentRedirectForm = ({ action, fields, label }) => {
  const form = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => form.current?.submit(), 400);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <form ref={form} method="post" action={action} className="text-center">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}

      <PillButton type="submit">Continue to {label}</PillButton>

      <p className={cn(META, "mt-4 text-ink-soft")}>
        Taking you to {label}. If nothing happens, use the button above.
      </p>
    </form>
  );
};

export default PaymentRedirectForm;
