"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";

const QueryProvider = ({ children }) => (
  <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
);

export default QueryProvider;
