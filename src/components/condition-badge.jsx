import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

const TONES = {
  Excellent: "border-brand/40 bg-brand/5 text-brand",
  Good: "border-rule-strong text-ink-muted",
  Fair: "border-rule-strong text-ink-muted",
  Worn: "border-sale/40 bg-sale/5 text-sale",
};

const ConditionBadge = ({ condition, className }) => (
  <span
    className={cn(
      META,
      "inline-flex items-center rounded-full border px-2.5 py-1",
      TONES[condition] ?? TONES.Good,
      className
    )}
  >
    {condition}
  </span>
);

export default ConditionBadge;
