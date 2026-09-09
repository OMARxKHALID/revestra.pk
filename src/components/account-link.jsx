"use client";

import { useSession } from "next-auth/react";
import NavIcon from "@/components/ui/nav-icon";
import { UserIcon } from "@/components/ui/icons";

const AccountLink = ({ tone }) => {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <NavIcon
      href={signedIn ? "/account" : "/sign-in"}
      tone={tone}
      label={signedIn ? "ACCOUNT" : "SIGN IN"}
      icon={<UserIcon />}
      aria-label={signedIn ? "Your account" : "Sign in"}
    />
  );
};

export default AccountLink;
