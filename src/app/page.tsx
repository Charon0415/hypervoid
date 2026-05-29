import { auth } from "@/auth";
import { isEmailConfigured } from "@/lib/email";
import { VoidEntryLogin } from "@/components/VoidEntryLogin";

export default async function Home() {
  const session = await auth();
  const user = session?.user as
    | { name?: string | null; email?: string | null; image?: string | null; login?: string | null; isAdmin?: boolean }
    | undefined;

  return (
    <VoidEntryLogin
      emailEnabled={isEmailConfigured()}
      currentUser={
        user
          ? {
              name: user.name ?? null,
              email: user.email ?? null,
              image: user.image ?? null,
              login: user.login ?? null,
              isAdmin: Boolean(user.isAdmin),
            }
          : null
      }
    />
  );
}
