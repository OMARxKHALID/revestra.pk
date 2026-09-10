"use client";

import { useEffect, useState } from "react";

const useDebounced = (value, delay = 250) => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setSettled(value), delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return settled;
};

export default useDebounced;
