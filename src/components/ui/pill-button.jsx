import Link from "next/link";
import cn from "@/lib/utils/cn";
import { EYEBROW, TITLE } from "@/lib/type";

const PILL =
  "inline-block rounded-full border border-brand text-center text-brand transition hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-not-allowed disabled:border-rule disabled:text-ink-faint disabled:hover:bg-transparent disabled:hover:text-ink-faint";

const SIZES = {
  base: cn(TITLE, "px-12 py-3"),
  sm: cn(EYEBROW, "px-5 py-2.5 pointer-coarse:py-3.5"),
};

const PillButton = ({ href, size = "base", className, children, ...props }) =>
  href ? (
    <Link href={href} className={cn(PILL, SIZES[size], className)} {...props}>
      {children}
    </Link>
  ) : (
    <button
      type="button"
      className={cn(PILL, SIZES[size], className)}
      {...props}
    >
      {children}
    </button>
  );

export default PillButton;
