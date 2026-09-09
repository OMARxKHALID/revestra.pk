"use client";

import { useSession } from "next-auth/react";
import useWishlist from "@/store/use-wishlist";
import Chip from "@/components/ui/chip";
import { HeartIcon } from "@/components/ui/icons";

const SaveButton = ({ slug, className }) => {
  const slugs = useWishlist((state) => state.slugs);
  const toggle = useWishlist((state) => state.toggle);
  const { status } = useSession();
  const saved = slugs.includes(slug);

  const handleToggle = () => {
    toggle(slug);

    if (status !== "authenticated") return;

    fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slugs: saved ? slugs.filter((entry) => entry !== slug) : [...slugs, slug],
      }),
    }).catch(() => {});
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
