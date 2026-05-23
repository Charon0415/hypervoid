import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const ADMIN_GITHUB_LOGIN =
  process.env.ADMIN_GITHUB_LOGIN?.trim() || "HyperCharon";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: "/admin/sign-in",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        if (token?.login) {
          (session.user as { login?: string }).login = token.login as string;
        }
        (session.user as { isAdmin?: boolean }).isAdmin =
          token?.login === ADMIN_GITHUB_LOGIN;
      }
      return session;
    },
    async jwt({ token, profile }) {
      const login = (profile as { login?: string } | undefined)?.login;
      if (login) token.login = login;
      return token;
    },
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin")) {
        if (pathname === "/admin/sign-in") return true;
        const login = (auth?.user as { login?: string } | undefined)?.login;
        return login === ADMIN_GITHUB_LOGIN;
      }
      return true;
    },
  },
});

export const ADMIN_LOGIN = ADMIN_GITHUB_LOGIN;

