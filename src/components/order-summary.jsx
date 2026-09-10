import cn from "@/lib/utils/cn";
import { ITEM, META, TITLE } from "@/lib/type";
import { formatPrice } from "@/lib/utils/price";

const Row = ({ label, value, tone = "text-ink-muted" }) => (
  <p className={cn(META, "flex items-baseline justify-between gap-6 py-1.5")}>
    <span className={tone}>{label}</span>
    <span className={cn("tabular-nums", tone)}>{value}</span>
  </p>
);

const OrderSummary = ({ items, totals, promo }) => (
  <>
    <ul className="divide-y divide-rule">
      {items.map((item) => (
        <li
          key={item.slug}
          className="flex items-baseline justify-between gap-6 py-4"
        >
          <div>
            <p className={cn(ITEM, "text-ink")}>{item.name}</p>
            <p className={cn(META, "mt-1 text-ink-soft")}>
              {[item.size, item.condition].filter(Boolean).join(" · ")}
            </p>
          </div>
          <p className={cn(ITEM, "shrink-0 tabular-nums text-ink")}>
            {formatPrice(item.unitCents)}
          </p>
        </li>
      ))}
    </ul>

    <div className="border-t border-rule pt-4">
      <Row label="Subtotal" value={formatPrice(totals.subtotalCents)} />

      {totals.discountCents > 0 && (
        <Row
          label={promo ? `Discount (${promo.code})` : "Discount"}
          value={`− ${formatPrice(totals.discountCents)}`}
          tone="text-sale"
        />
      )}

      <Row
        label="Shipping"
        value={
          totals.shippingCents === 0 ? "Free" : formatPrice(totals.shippingCents)
        }
      />

      {totals.taxCents > 0 && (
        <Row label="Tax" value={formatPrice(totals.taxCents)} />
      )}
    </div>

    <p className={cn(TITLE, "flex items-baseline justify-between gap-6 border-t border-rule pt-5 text-ink")}>
      <span>Total</span>
      <span className="tabular-nums">{formatPrice(totals.totalCents)}</span>
    </p>
  </>
);

export default OrderSummary;
