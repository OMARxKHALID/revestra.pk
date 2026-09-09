import { redirect } from "next/navigation";
import { auth } from "@/auth";

const AccountLayout = async ({ children }) => {
  const session = await auth();

  if (!session?.user) redirect("/sign-in?callbackUrl=/account");

  return children;
};

export default AccountLayout;
