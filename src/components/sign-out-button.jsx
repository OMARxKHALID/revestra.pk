"use client";

import { signOut } from "next-auth/react";
import PillButton from "@/components/ui/pill-button";

const SignOutButton = () => {
  const handleSignOut = () => signOut({ callbackUrl: "/" });

  return (
    <PillButton size="sm" onClick={handleSignOut}>
      Sign out
    </PillButton>
  );
};

export default SignOutButton;
