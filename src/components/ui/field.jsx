import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";

const Field = ({ id, label, error, icon, className, registration, ...props }) => (
  <div className={className}>
    <label htmlFor={id} className={cn(META, "text-black/45")}>
      {label}
    </label>

    <div
      className={cn(
        "mt-2 flex items-center gap-2.5 border-b pb-2 transition",
        error
          ? "border-sale focus-within:border-sale"
          : "border-black/20 focus-within:border-blurple"
      )}
    >
      {icon && (
        <span className={cn("shrink-0", error ? "text-sale" : "text-black/30")}>
          {icon}
        </span>
      )}

      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...registration}
        {...props}
        className="w-full bg-transparent font-sans text-sm text-black placeholder:text-black/30 focus:outline-none"
      />
    </div>

    {error && (
      <p id={`${id}-error`} className={cn(NOTICE, "mt-2 text-sale")}>
        {error}
      </p>
    )}
  </div>
);

export default Field;
