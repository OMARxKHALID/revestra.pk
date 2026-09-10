import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";

const Field = ({
  id,
  label,
  error,
  icon,
  className,
  registration,
  required = false,
  ...props
}) => (
  <div className={className}>
    <label htmlFor={id} className={cn(META, "text-ink-soft")}>
      {label}
    </label>

    <div
      className={cn(
        "mt-2 flex items-center gap-2.5 border-b pb-2 transition",
        error
          ? "border-sale focus-within:border-sale"
          : "border-rule-strong focus-within:border-blurple"
      )}
    >
      {icon && (
        <span className={cn("shrink-0", error ? "text-sale" : "text-ink-faint")}>
          {icon}
        </span>
      )}

      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-required={required || undefined}
        required={required}
        {...props}
        {...registration}
        className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-ink-faint focus:outline-none"
      />
    </div>

    {error && (
      <p role="alert" id={`${id}-error`} className={cn(NOTICE, "mt-2 text-sale")}>
        {error}
      </p>
    )}
  </div>
);

export default Field;
