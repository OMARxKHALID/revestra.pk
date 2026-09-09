"use client";

import { SessionProvider } from "next-auth/react";

const AuthProvider = ({ children }) => (
  <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
);

export default AuthProvider;
