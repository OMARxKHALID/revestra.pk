import Image from "next/image";
import { BRAND } from "@/lib/brand";
import cn from "@/lib/utils/cn";

const MonogramMark = ({ className, priority = false }) => (
  <Image
    src="/assets/SVG/6499ebd2cb78b6f1ed8520f8_CS - logo 1.svg"
    alt={BRAND.name}
    width={106}
    height={64}
    priority={priority}
    className={cn("h-10 w-auto sm:h-14", className)}
  />
);

export default MonogramMark;
