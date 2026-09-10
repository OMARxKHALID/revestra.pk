import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { signInSchema } from "@/lib/schemas/user";
import { authIsAvailable, getUserRole, verifyCredentials } from "@/lib/api/users";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { ROLE } from "@/lib/roles";
import { authSecret } from "@/lib/secrets";
import errorMessage from "@/lib/utils/error-message";
import requestIp from "@/lib/utils/request-ip";

const limiter = createLimiter(RATE_LIMITS.signIn);

const ROLE_TTL_MS = 5 * 60 * 1000;

const withFreshRole = async (token) => {
  if (!token?.uid) return token;
  if (!authIsAvailable()) return token;
  if (Date.now() - (token.roleCheckedAt ?? 0) < ROLE_TTL_MS) return token;

  try {
    const { reachable, role } = await getUserRole(token.uid);

    if (!reachable) return token;

    return { ...token, role: role ?? ROLE.customer, roleCheckedAt: Date.now() };
  } catch (error) {
    console.warn(`[auth] could not refresh the role: ${errorMessage(error)}`);

    return token;
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { ...authConfig.session, strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    jwt: async (params) =>
      withFreshRole(await authConfig.callbacks.jwt(params)),
  },
  trustHost: true,
  secret: authSecret(),
  logger: {
    error: (error) => {
      if (error?.name === "CredentialsSignin") {
        console.info("[auth] a sign-in attempt failed");
        return;
      }

      console.error(`[auth] ${error?.message ?? error}`);
    },
    warn: (code) => console.warn(`[auth] ${code}`),
    debug: () => {},
  },
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

        const byAccount = await limiter.check(`signin|${email.toLowerCase()}|${ip}`);

        if (!byAccount.ok) return null;

        const byAddress = await limiter.check(`signin|${ip}`);

        if (!byAddress.ok) return null;

        return verifyCredentials(email, password);
      },
    }),
  ],
});
