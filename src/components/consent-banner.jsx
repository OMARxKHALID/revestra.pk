"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import PillButton from "@/components/ui/pill-button";
import { consentStatus, denyConsent, grantConsent } from "@/lib/track";
import cn from "@/lib/utils/cn";
import { NOTICE } from "@/lib/type";

const subscribe = () => () => {};

const isPending = () => consentStatus() === "pending";

const onServer = () => false;

const ConsentBanner = () => {
  const pending = useSyncExternalStore(subscribe, isPending, onServer);
  const [answered, setAnswered] = useState(false);

  if (answered || !pending) return null;

  const handleAccept = () => {
    grantConsent();
    setAnswered(true);
  };

  const handleDecline = () => {
    denyConsent();
    setAnswered(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-white px-5 py-4 sm:px-10"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn(NOTICE, "text-ink-soft")}>
          We measure how the shop is used so we can fix what is broken. Decline
          and we count you without cookies.{" "}
          <Link href="/policies#privacy" className="text-brand hover:underline">
            How we handle your data
          </Link>
          .
        </p>

        <div className="flex shrink-0 gap-3">
          <PillButton size="sm" onClick={handleDecline}>
            Decline
          </PillButton>

          <PillButton
            size="sm"
            onClick={handleAccept}
            className="bg-brand text-white hover:bg-ink hover:text-white"
          >
            Accept
          </PillButton>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
