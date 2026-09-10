import { redirect } from "next/navigation";
import { UserCircleIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import AccountForms from "@/components/admin/account-forms";
import { auth } from "@/auth";
import { findUserById } from "@/lib/api/users";
import { title } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Your account"),
  robots: { index: false, follow: false },
};

const AccountPage = async () => {
  const session = await auth();
  const user = await findUserById(session?.user?.id);

  if (!user) redirect("/sign-in?callbackUrl=/admin/account");

  return (
    <PageLayout>
      <PageHeader
        title="Your account"
        description="Change your name, the address you sign in with, and your password."
        icon={UserCircleIcon}
      />

      <AccountForms account={{ name: user.name, email: user.email }} />
    </PageLayout>
  );
};

export default AccountPage;
