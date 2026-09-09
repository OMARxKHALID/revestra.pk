import Link from "next/link";
import InteriorPage from "@/components/interior-page";
import PillButton from "@/components/ui/pill-button";
import SignOutButton from "@/components/sign-out-button";
import cn from "@/lib/utils/cn";
import { META, NOTICE, TITLE } from "@/lib/type";
import { title } from "@/lib/brand";
import { auth } from "@/auth";

export const metadata = {
  title: title("Account"),
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/account/orders", label: "Orders", note: "Everything you have bought" },
  { href: "/wishlist", label: "Wishlist", note: "Saved for later" },
  { href: "/track", label: "Track an order", note: "By reference and email" },
];

const AccountPage = async () => {
  const session = await auth();

  return (
    <InteriorPage heading={session.user.name ?? "Your account"}>
      <p className={cn(NOTICE, "mt-4 text-black/45")}>{session.user.email}</p>

      <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
        {LINKS.map(({ href, label, note }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-baseline justify-between gap-6 py-5 transition hover:text-blurple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple"
            >
              <span className={TITLE}>{label}</span>
              <span className={cn(META, "text-black/45")}>{note}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <PillButton href="/products">Keep shopping</PillButton>
        <SignOutButton />
      </div>
    </InteriorPage>
  );
};

export default AccountPage;
