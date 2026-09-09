import cn from "@/lib/utils/cn";
import { EYEBROW, META } from "@/lib/type";

const STEPS = ["received", "processing", "shipped", "delivered"];

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
          stalled && status !== "pending_payment" ? "text-sale" : "text-blurple"
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
                  position <= index ? "bg-blurple" : "bg-black/10"
                )}
              />
              <p
                className={cn(
                  META,
                  "mt-2 hidden sm:block",
                  position <= index ? "text-black/70" : "text-black/45"
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
