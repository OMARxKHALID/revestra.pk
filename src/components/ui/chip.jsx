import cn from "@/lib/utils/cn";
import { EYEBROW } from "@/lib/type";

const Chip = ({ selected = false, className, children, ...props }) => (
  <button
    type="button"
    aria-pressed={selected}
    className={cn(
      EYEBROW,
      "rounded-full border px-4 py-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple disabled:cursor-not-allowed",
      selected
        ? "border-blurple bg-blurple text-white"
        : "border-black/20 text-black/70 hover:border-black/60 hover:text-black",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export default Chip;
