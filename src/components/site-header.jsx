import Link from "next/link";
import MonogramMark from "@/components/monogram-mark";
import NavAction from "@/components/ui/nav-action";
import CartButton from "@/components/cart-button";
import AccountLink from "@/components/account-link";
import WishlistButton from "@/components/wishlist-button";
import cn from "@/lib/utils/cn";
import { BRAND } from "@/lib/brand";

const SiteHeader = ({ overlay = false }) => {
  const tone = overlay ? "light" : "dark";

  return (
    <header
      className={cn(
        "grid h-header grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-10",
        overlay
          ? "absolute inset-x-0 top-0 z-30"
          : "sticky top-0 z-40 border-b border-rule bg-white"
      )}
    >
      <nav
        aria-label="Shop"
        className="flex items-center justify-self-start"
      >
        <NavAction href="/products" tone={tone}>
          SHOP
        </NavAction>
      </nav>

      <div className="flex items-center justify-self-center">
        {!overlay && (
          <Link
            href="/"
            aria-label={`${BRAND.name} — home`}
            className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple"
          >
            <MonogramMark priority className="h-6 w-auto sm:h-7" />
          </Link>
        )}
      </div>

      <nav
        aria-label="Account and cart"
        className="flex items-center gap-4 justify-self-end sm:gap-7"
      >
        <WishlistButton tone={tone} />
        <AccountLink tone={tone} />
        <CartButton tone={tone} />
      </nav>
    </header>
  );
};

export default SiteHeader;
