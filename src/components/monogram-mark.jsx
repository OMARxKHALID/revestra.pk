import Image from "next/image";
import { BRAND } from "@/lib/brand";
import cn from "@/lib/utils/cn";

const MonogramMark = ({ className, priority = false }) => (
  <Image
    src="/brand/revestra-monogram.png"
    alt={BRAND.name}
    width={571}
    height={256}
    preload={priority}
    className={cn("h-10 w-auto sm:h-14", className)}
  />
);

export default MonogramMark;
