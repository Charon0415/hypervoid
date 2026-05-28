import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const ADMIN_GITHUB_LOGIN =
  process.env.ADMIN_GITHUB_LOGIN?.trim() || "HyperCharon";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [GitHub],
  pages: {
    signIn: "/sign-in",
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
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (pathname === "/admin/sign-in") return true;
        const login = (auth?.user as { login?: string } | undefined)?.login;
        return login === ADMIN_GITHUB_LOGIN;
      }
      return true;
    },
  },
  events: {
    // Fires after a successful sign-in. Records the GitHub account so the
    // admin dashboard can list everyone who has ever logged into the blog.
    async signIn({ user, profile }) {
      const login = (profile as { login?: string } | undefined)?.login;
      if (!login) return;
      try {
        const { recordVisitorLogin } = await import("@/db/visitor-logins");
        await recordVisitorLogin({
          githubLogin: login,
          githubName: user.name ?? null,
          avatarUrl: user.image ?? null,
        });
      } catch (e) {
        console.warn("[auth] visitor-login record failed:", e);
      }
    },
  },
});

export const ADMIN_LOGIN = ADMIN_GITHUB_LOGIN;

/**
 * Defense-in-depth gate for server actions and route handlers. Middleware
 * already blocks unauthorized requests to /admin/* and /api/admin/*, but
 * server actions can be invoked from any page in the app, so each one
 * must verify isAdmin itself. Throws — callers don't need to handle.
 */
export async function requireAdmin(): Promise<void> {
  const session = await auth();
  const user = session?.user as
    | { isAdmin?: boolean; login?: string }
    | undefined;
  if (!user?.isAdmin) {
    throw new Error("Not authorized");
  }
}

