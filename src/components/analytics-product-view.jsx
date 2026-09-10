"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/track";
import { ANALYTICS_EVENT, productProperties } from "@/lib/analytics";

const AnalyticsProductView = ({ product }) => {
  const seen = useRef(null);

  useEffect(() => {
    if (seen.current === product.slug) return;

    seen.current = product.slug;
    track(ANALYTICS_EVENT.productViewed, productProperties(product));
  }, [product]);

  return null;
};

export default AnalyticsProductView;
