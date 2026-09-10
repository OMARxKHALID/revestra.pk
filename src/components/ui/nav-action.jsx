import Link from "next/link";
import cn from "@/lib/utils/cn";

const BASE =
  "relative inline-block font-sans text-[11px] font-semibold tracking-[0.2em] transition before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] sm:text-xs";

const TONES = {
  light:
    "text-white/85 hover:text-white focus-visible:outline-white",
  dark: "text-ink-muted hover:text-ink focus-visible:outline-blurple",
};

export const navActionClass = (tone = "light", className) =>
  cn(
    BASE,
    TONES[tone],
    "focus-visible:outline-2 focus-visible:outline-offset-4",
    className
  );

const NavAction = ({ href, tone = "light", className, children, ...props }) =>
  href ? (
    <Link href={href} className={navActionClass(tone, className)} {...props}>
      {children}
    </Link>
  ) : (
    <button type="button" className={navActionClass(tone, className)} {...props}>
      {children}
    </button>
  );

export default NavAction;
