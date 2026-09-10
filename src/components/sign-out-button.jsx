"use client";

import { signOut } from "next-auth/react";
import PillButton from "@/components/ui/pill-button";

const SignOutButton = () => {
  const handleSignOut = () => signOut({ callbackUrl: "/" });

  return (
    <PillButton
      onClick={handleSignOut}
      className="border-black/15 text-ink-muted hover:border-black hover:bg-black hover:text-white"
    >
      Sign out
    </PillButton>
  );
};

export default SignOutButton;
