"use client";

import { useSession } from "next-auth/react";
import NavIcon from "@/components/ui/nav-icon";
import { UserIcon } from "@/components/ui/icons";
import { ROLE } from "@/lib/roles";

const AccountLink = ({ tone }) => {
  const { data, status } = useSession();
  const signedIn = status === "authenticated";
  const admin = signedIn && data?.user?.role === ROLE.admin;

  const link = admin
    ? { href: "/admin", label: "ADMIN", aria: "Back office" }
    : signedIn
      ? { href: "/account", label: "ACCOUNT", aria: "Your account" }
      : { href: "/sign-in", label: "SIGN IN", aria: "Sign in" };

  return (
    <NavIcon
      href={link.href}
      tone={tone}
      label={link.label}
      icon={<UserIcon />}
      aria-label={link.aria}
    />
  );
};

export default AccountLink;
