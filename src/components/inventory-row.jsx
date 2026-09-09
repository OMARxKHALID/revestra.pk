"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import cn from "@/lib/utils/cn";
import { META, NOTICE, TITLE } from "@/lib/type";
import { formatPrice } from "@/lib/utils/price";
import ConditionBadge from "@/components/ui/condition-badge";
import PillButton from "@/components/ui/pill-button";

const NEXT_STATUS = {
  available: { to: "sold", label: "Mark sold" },
  reserved: { to: "available", label: "Release hold" },
  sold: { to: "available", label: "Relist" },
};

const STATUS_TONE = {
  available: "text-blurple",
  reserved: "text-black/45",
  sold: "text-sale",
};

const InventoryRow = ({ product }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const price = product.salePriceCents ?? product.priceCents;
  const margin = price - (product.costCents ?? 0);
  const next = NEXT_STATUS[product.status];

  const handleStatus = async () => {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.to }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Could not update that piece.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className={cn(META, "text-black/45")}>
          {product.sku} · {product.brand} · {product.sizeLabel}
          {product.lot ? ` · ${product.lot}` : ""}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className={cn(
            TITLE,
            "mt-1 block text-black transition hover:text-blurple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple"
          )}
        >
          {product.name}
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <ConditionBadge condition={product.condition} />

          <span className={cn(META, STATUS_TONE[product.status])}>
            {product.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className={cn(TITLE, "tabular-nums text-black")}>
            {formatPrice(price)}
          </p>

          <p className={cn(META, "mt-1 text-black/45")}>
            cost {formatPrice(product.costCents ?? 0)} ·{" "}
            <span className={margin >= 0 ? "text-blurple" : "text-sale"}>
              {formatPrice(margin)}
            </span>
          </p>
        </div>

        <PillButton size="sm" onClick={handleStatus} disabled={pending}>
          {pending ? "…" : next.label}
        </PillButton>
      </div>

      {error && <p className={cn(NOTICE, "text-sale")}>{error}</p>}
    </li>
  );
};

export default InventoryRow;
