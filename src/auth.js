import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { signInSchema } from "@/lib/schemas/user";
import { authIsAvailable, verifyCredentials } from "@/lib/api/users";
import { createRateLimiter } from "@/lib/rate-limit";
import { authSecret } from "@/lib/secrets";
import requestIp from "@/lib/utils/request-ip";

const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  trustHost: true,
  secret: authSecret(),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        if (!authIsAvailable()) return null;

        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip = request ? requestIp(request) : "unknown";

        if (!limiter.check(`${email.toLowerCase()}|${ip}`).ok) return null;
        if (!limiter.check(ip).ok) return null;

        return verifyCredentials(email, password);
      },
    }),
  ],
});
