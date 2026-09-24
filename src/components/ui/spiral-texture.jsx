import cn from "@/lib/utils/cn";

const SpiralTexture = ({ className }) => (
  <span
    aria-hidden="true"
    className={cn(
      "pointer-events-none absolute -z-10 aspect-square bg-current mask-[url(/brand/spiral-texture.svg)] mask-contain mask-center mask-no-repeat",
      className
    )}
  />
);

export default SpiralTexture;
