import cn from "@/lib/utils/cn";
import { BODY, EYEBROW, HEADING } from "@/lib/type";
import { AlertIcon } from "@/components/ui/icons";
import { describeError } from "@/lib/errors";

const ErrorState = ({
  error,
  title,
  message,
  eyebrow = "Something broke",
  actions,
  className,
}) => {
  const described = describeError(error);

  return (
    <div
      role="alert"
      className={cn(
        "mx-auto flex max-w-[46ch] flex-col items-center border-t border-rule py-16 text-center",
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sale/10 text-sale">
        <AlertIcon className="h-5 w-5" />
      </span>

      <p className={cn(EYEBROW, "mt-6 text-sale")}>{eyebrow}</p>

      <h2 className={cn(HEADING, "mt-3 text-ink")}>
        {title ?? described.title}
      </h2>

      <p className={cn(BODY, "mt-4 text-ink-muted")}>
        {message ?? described.message}
      </p>

      {actions && (
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          {actions}
        </div>
      )}
    </div>
  );
};

export default ErrorState;
