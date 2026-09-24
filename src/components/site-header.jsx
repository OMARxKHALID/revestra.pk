import Link from "next/link";
import BrandMark from "@/components/brand-mark";
import NavAction from "@/components/ui/nav-action";
import CartButton from "@/components/cart-button";
import AccountLink from "@/components/account-link";
import WishlistButton from "@/components/wishlist-button";
import { BRAND } from "@/lib/brand";

const tone = "dark";

const SiteHeader = () => (
  <header className="sticky top-0 z-40 grid h-header grid-cols-[1fr_auto_1fr] items-center border-b border-rule bg-white px-5 sm:px-10">
    <nav
      aria-label="Shop"
      className="flex items-center justify-self-start"
    >
      <NavAction href="/products" tone={tone}>
        SHOP
      </NavAction>
    </nav>

    <div className="flex items-center justify-self-center">
      <Link
        href="/"
        aria-label={`${BRAND.name} — home`}
        className="flex items-center text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <BrandMark className="h-8 sm:h-9" />
      </Link>
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

export default SiteHeader;
