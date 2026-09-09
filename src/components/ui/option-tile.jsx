import cn from "@/lib/utils/cn";
import { EYEBROW, META } from "@/lib/type";

const OptionTile = ({
  label,
  note,
  icon,
  selected = false,
  disabled = false,
  className,
  ...props
}) => (
  <button
    type="button"
    disabled={disabled}
    aria-pressed={selected}
    className={cn(
      "border px-4 py-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple",
      selected
        ? "border-blurple bg-blurple/5"
        : "border-black/20 hover:border-black/60",
      disabled && "cursor-not-allowed opacity-40 hover:border-black/20",
      className
    )}
    {...props}
  >
    <span className={cn(EYEBROW, "flex items-center gap-2 text-black")}>
      {icon}
      {label}
    </span>

    {note && (
      <span className={cn(META, "mt-1.5 block text-black/45", icon && "pl-[26px]")}>
        {note}
      </span>
    )}
  </button>
);

export default OptionTile;
