import Link from "next/link";
import cn from "@/lib/utils/cn";

const TONES = {
  light: "text-white/85 hover:text-white focus-visible:outline-white",
  dark: "text-ink-muted hover:text-ink focus-visible:outline-blurple",
};

const COUNT_TONES = {
  light: "bg-white text-black",
  dark: "bg-blurple text-white",
};

const NavIcon = ({
  href,
  tone = "light",
  label,
  count,
  showLabel = true,
  icon,
  className,
  ...props
}) => (
  <Link
    href={href}
    className={cn(
      "relative flex items-center gap-2 font-sans text-[11px] font-semibold leading-none tracking-[0.2em] transition focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-xs",
      TONES[tone],
      className
    )}
    {...props}
  >
    <span className="relative flex items-center">
      {icon}

      {count > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -right-1.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 font-sans text-[9px] font-semibold leading-none tabular-nums",
            COUNT_TONES[tone]
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>

    {showLabel && <span className="hidden lg:inline">{label}</span>}
  </Link>
);

export default NavIcon;
