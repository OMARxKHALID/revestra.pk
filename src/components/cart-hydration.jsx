"use client";

import { useEffect } from "react";
import useCart from "@/store/use-cart";
import useWishlist from "@/store/use-wishlist";

const CartHydration = () => {
  useEffect(() => {
    useCart.persist.rehydrate();
    useWishlist.persist.rehydrate();

    const handleStorage = (event) => {
      if (event.key === useCart.persist.getOptions().name)
        useCart.persist.rehydrate();

      if (event.key === useWishlist.persist.getOptions().name)
        useWishlist.persist.rehydrate();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return null;
};

export default CartHydration;
