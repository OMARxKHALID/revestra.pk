import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import Spinner from "@/components/ui/spinner";

const Loader = ({ label = "Loading", size = "lg", className }) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={cn(
      "flex flex-col items-center justify-center gap-4 py-24",
      className
    )}
  >
    <Spinner size={size} className="text-brand" />
    <p className={cn(META, "text-ink-soft")}>{label}</p>
  </div>
);

export default Loader;
