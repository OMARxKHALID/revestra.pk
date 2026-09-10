import cn from "@/lib/utils/cn";
import { EYEBROW, META } from "@/lib/type";

import {
  FULFILLED_ORDER_STATUSES,
  ORDER_STATUS,
} from "@/lib/schemas/order";

const STEPS = FULFILLED_ORDER_STATUSES;

const LABELS = {
  pending_payment: "Awaiting payment",
  received: "Received",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment failed",
};

const OrderStatus = ({ status }) => {
  const index = STEPS.indexOf(status);
  const stalled = index === -1;

  return (
    <div className="mt-8">
      <p
        className={cn(
          EYEBROW,
          stalled && status !== ORDER_STATUS.pendingPayment
            ? "text-sale"
            : "text-blurple"
        )}
      >
        {LABELS[status] ?? status}
      </p>

      {!stalled && (
        <ol className="mt-5 flex gap-2">
          {STEPS.map((step, position) => (
            <li key={step} className="flex-1">
              <div
                className={cn(
                  "h-1 rounded-full",
                  position <= index ? "bg-blurple" : "bg-rule"
                )}
              />
              <p
                className={cn(
                  META,
                  "mt-2 hidden sm:block",
                  position <= index ? "text-ink-muted" : "text-ink-soft"
                )}
              >
                {LABELS[step]}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default OrderStatus;
