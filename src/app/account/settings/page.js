import { redirect } from "next/navigation";
import InteriorPage from "@/components/interior-page";
import AccountSettings from "@/components/account-settings";
import { auth } from "@/auth";
import { getAccount } from "@/lib/api/users";
import { isSubscribed } from "@/lib/api/subscribers";
import { title } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Account settings"),
  robots: { index: false, follow: false },
};

const AccountSettingsPage = async () => {
  const session = await auth();

  if (!session?.user) redirect("/sign-in?callbackUrl=/account/settings");

  const account = await getAccount(session.user.id);

  if (!account) redirect("/account");

  return (
    <InteriorPage
      eyebrow="Account"
      heading="Settings"
      intro="Your details, password, delivery address and newsletter."
    >
      <AccountSettings
        account={{ ...account, subscribed: await isSubscribed(account.email) }}
      />
    </InteriorPage>
  );
};

export default AccountSettingsPage;
