const ADMIN_PREFIX = "/admin";

const authConfig = {
  pages: { signIn: "/sign-in" },
  providers: [],
  callbacks: {
    authorized: ({ auth, request }) => {
      const user = auth?.user;

      if (!user) return false;
      if (!request.nextUrl.pathname.startsWith(ADMIN_PREFIX)) return true;

      return user.role === "admin";
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.role = user.role ?? "customer";
      }

      return token;
    },
    session: ({ session, token }) => {
      if (token?.uid) session.user.id = token.uid;

      session.user.role = token?.role ?? "customer";

      return session;
    },
  },
};

export default authConfig;
