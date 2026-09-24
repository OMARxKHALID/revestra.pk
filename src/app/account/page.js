import Link from "next/link";
import InteriorPage from "@/components/interior-page";
import PillButton from "@/components/ui/pill-button";
import SignOutButton from "@/components/sign-out-button";
import { ArrowIcon } from "@/components/ui/icons";
import cn from "@/lib/utils/cn";
import { META, TITLE } from "@/lib/type";
import { title } from "@/lib/brand";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLE } from "@/lib/roles";

export const metadata = {
  title: title("Account"),
  robots: { index: false, follow: false },
};

const LINKS = [
  {
    href: "/account/orders",
    label: "Orders",
    note: "Everything you have bought",
  },
  { href: "/wishlist", label: "Wishlist", note: "Saved for later" },
  {
    href: "/account/reviews",
    label: "Your reviews",
    note: "What you wrote about the shop",
  },
  {
    href: "/account/settings",
    label: "Settings",
    note: "Details, password, address, newsletter",
  },
  { href: "/track", label: "Track an order", note: "By reference and email" },
];

const AccountPage = async () => {
  const session = await auth();

  if (!session?.user) redirect("/sign-in?callbackUrl=/account");
  if (session.user.role === ROLE.admin) redirect("/admin");

  return (
    <InteriorPage
      eyebrow="Account"
      heading={session.user.name ?? "Your account"}
      intro={session.user.email}
    >
      <ul className="mt-12 divide-y divide-rule border-y border-rule">
        {LINKS.map(({ href, label, note }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-6 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="flex items-center gap-3">
                <span className={TITLE}>{label}</span>

                <ArrowIcon className="h-4 w-4 text-brand opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </span>

              <span
                className={cn(
                  META,
                  "text-ink-soft transition-colors group-hover:text-brand"
                )}
              >
                {note}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <PillButton href="/products">Keep shopping</PillButton>
        <SignOutButton />
      </div>
    </InteriorPage>
  );
};

export default AccountPage;
