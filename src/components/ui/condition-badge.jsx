import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

const TONES = {
  Excellent: "border-blurple/40 bg-blurple/5 text-blurple",
  Good: "border-black/20 text-black/70",
  Fair: "border-black/20 text-black/70",
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
