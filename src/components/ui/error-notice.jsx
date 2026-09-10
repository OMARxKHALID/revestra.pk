import cn from "@/lib/utils/cn";
import { NOTICE } from "@/lib/type";
import { AlertIcon } from "@/components/ui/icons";
import { describeError } from "@/lib/errors";

const ErrorNotice = ({ error, message, className, reserveSpace = true }) => {
  const text = message ?? (error ? describeError(error).message : null);

  return (
    <p
      role="alert"
      aria-live="polite"
      className={cn(
        NOTICE,
        "flex items-start gap-2 text-sale",
        !text && reserveSpace && "min-h-5",
        className
      )}
    >
      {text && (
        <>
          <AlertIcon className="mt-px h-4 w-4" />
          <span>{text}</span>
        </>
      )}
    </p>
  );
};

export default ErrorNotice;
