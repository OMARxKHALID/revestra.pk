const authConfig = {
  pages: { signIn: "/sign-in" },
  providers: [],
  callbacks: {
    authorized: ({ auth }) => Boolean(auth?.user),
    jwt: ({ token, user }) => {
      if (user) token.uid = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (token?.uid) session.user.id = token.uid;
      return session;
    },
  },
};

export default authConfig;
