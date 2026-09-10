"use client";

import { useSession } from "next-auth/react";
import useWishlist from "@/store/use-wishlist";
import { useSaveWishlist } from "@/hooks/use-wishlist-sync";
import Chip from "@/components/ui/chip";
import { HeartIcon } from "@/components/ui/icons";

const SaveButton = ({ slug, className }) => {
  const slugs = useWishlist((state) => state.slugs);
  const toggle = useWishlist((state) => state.toggle);
  const { status } = useSession();
  const { mutate: save } = useSaveWishlist();
  const saved = slugs.includes(slug);

  const handleToggle = () => {
    toggle(slug);

    if (status !== "authenticated") return;

    save(saved ? slugs.filter((entry) => entry !== slug) : [...slugs, slug]);
  };

  return (
    <Chip
      selected={saved}
      onClick={handleToggle}
      aria-label={saved ? "Remove from wishlist" : "Save for later"}
      className={className}
    >
      <span className="flex items-center gap-2">
        <HeartIcon className="h-3.5 w-3.5" />
        {saved ? "Saved" : "Save"}
      </span>
    </Chip>
  );
};

export default SaveButton;
