import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onChange) => {
  const query = window.matchMedia(QUERY);

  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
};

export const useIsMobile = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
