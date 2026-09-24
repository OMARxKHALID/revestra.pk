import cn from "@/lib/utils/cn";
import { EYEBROW } from "@/lib/type";

const Chip = ({ selected = false, className, children, ...props }) => (
  <button
    type="button"
    aria-pressed={selected}
    className={cn(
      EYEBROW,
      "rounded-full border px-4 py-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed",
      selected
        ? "border-brand bg-brand text-white"
        : "border-rule-strong text-ink-muted hover:border-ink-muted hover:text-ink",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export default Chip;
