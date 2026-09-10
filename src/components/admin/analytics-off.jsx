"use client";

import { useEffect } from "react";
import { stopRecording } from "@/lib/track";

const AnalyticsOff = () => {
  useEffect(() => {
    stopRecording();
  }, []);

  return null;
};

export default AnalyticsOff;
