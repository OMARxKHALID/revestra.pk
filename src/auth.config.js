import { ROLE } from "@/lib/roles";
import { authSecret } from "@/lib/secrets";

const ADMIN_PREFIX = "/admin";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

const SESSION_UPDATE_AGE_SECONDS = 60 * 15;

const authConfig = {
  pages: { signIn: "/sign-in" },
  secret: authSecret(),
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized: ({ auth, request }) => {
      const user = auth?.user;

      if (!user) return false;
      if (!request.nextUrl.pathname.startsWith(ADMIN_PREFIX)) return true;

      return user.role === ROLE.admin;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.role = user.role ?? ROLE.customer;
        token.roleCheckedAt = Date.now();
        token.signedInAt = Date.now();
      }

      return token;
    },
    session: ({ session, token }) => {
      if (token?.uid) session.user.id = token.uid;

      session.user.role = token?.role ?? ROLE.customer;

      return session;
    },
  },
};

export default authConfig;
