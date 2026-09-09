"use client";

import useCart, { selectCount } from "@/store/use-cart";
import NavIcon from "@/components/ui/nav-icon";
import { BagIcon } from "@/components/ui/icons";

const CartButton = ({ tone }) => {
  const count = useCart(selectCount);

  return (
    <NavIcon
      href="/cart"
      tone={tone}
      label="CART"
      count={count}
      icon={<BagIcon />}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
    />
  );
};

export default CartButton;
