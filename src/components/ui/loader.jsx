import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import BrandMark from "@/components/brand-mark";

const Loader = ({ label = "Loading", className }) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={cn(
      "flex flex-col items-center justify-center gap-4 py-24",
      className
    )}
  >
    <BrandMark
      aria-hidden="true"
      className="h-10 text-brand motion-safe:animate-[spin_2.4s_linear_infinite]"
    />
    <p className={cn(META, "text-ink-soft")}>{label}</p>
  </div>
);

export default Loader;
