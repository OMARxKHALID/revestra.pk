"use client";

import { useEffect, useRef, useState } from "react";

const callbacks = new WeakMap();
const observers = new Map();

const getObserver = (threshold) => {
  let observer = observers.get(threshold);

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          callbacks.get(entry.target)?.();
          observer.unobserve(entry.target);
          callbacks.delete(entry.target);
        }
      },
      { threshold }
    );
    observers.set(threshold, observer);
  }

  return observer;
};

const useInView = ({ threshold = 0.2 } = {}) => {
  const ref = useRef(null);
  const [state, setState] = useState("initial");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (node.getBoundingClientRect().top < window.innerHeight) {
      setState("shown");
      return;
    }

    setState("hidden");

    const observer = getObserver(threshold);
    callbacks.set(node, () => setState("revealed"));
    observer.observe(node);

    return () => {
      observer.unobserve(node);
      callbacks.delete(node);
    };
  }, [threshold]);

  return [ref, state];
};

export default useInView;
