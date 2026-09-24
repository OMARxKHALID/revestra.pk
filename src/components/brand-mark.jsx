import { BRAND } from "@/lib/brand";
import cn from "@/lib/utils/cn";

const BrandMark = ({ className }) => (
  <span
    role="img"
    aria-label={BRAND.name}
    className={cn(
      "inline-block aspect-[552/530] h-10 bg-current mask-[url(/brand/revestra-spiral.svg)] mask-contain mask-center mask-no-repeat",
      className
    )}
  />
);

export default BrandMark;
