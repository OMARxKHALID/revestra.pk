"use client";

import useWishlist, { selectWishlistCount } from "@/store/use-wishlist";
import NavIcon from "@/components/ui/nav-icon";
import { HeartIcon } from "@/components/ui/icons";

const WishlistButton = ({ tone, className }) => {
  const count = useWishlist(selectWishlistCount);

  return (
    <NavIcon
      href="/wishlist"
      tone={tone}
      label="SAVED"
      count={count}
      icon={<HeartIcon />}
      className={className}
      aria-label={`Wishlist, ${count} ${count === 1 ? "item" : "items"}`}
    />
  );
};

export default WishlistButton;
