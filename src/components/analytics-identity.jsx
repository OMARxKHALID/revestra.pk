"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { forgetViewer, identifyViewer } from "@/lib/track";

const AnalyticsIdentity = () => {
  const { data: session, status } = useSession();
  const identified = useRef(null);

  useEffect(() => {
    if (status === "loading") return;

    const id = session?.user?.id ?? null;

    if (id && identified.current !== id) {
      identifyViewer(id, { role: session.user.role });
      identified.current = id;
      return;
    }

    if (!id && identified.current) {
      forgetViewer();
      identified.current = null;
    }
  }, [session, status]);

  return null;
};

export default AnalyticsIdentity;
