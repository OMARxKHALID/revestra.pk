import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import cn from "@/lib/utils/cn";

const SIZES = {
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
};

const Spinner = ({ size = "md", className }) => (
  <HugeiconsIcon
    icon={Loading03Icon}
    strokeWidth={2}
    aria-hidden="true"
    className={cn("motion-safe:animate-spin", SIZES[size], className)}
  />
);

export default Spinner;
