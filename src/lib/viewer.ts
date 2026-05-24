import "server-only";
import { auth } from "@/auth";

export type Viewer = {
  isAdmin: boolean;
  login: string | null;
};

export async function getViewer(): Promise<Viewer> {
  const session = await auth();
  const user = session?.user as
    | { isAdmin?: boolean; login?: string }
    | undefined;
  return {
    isAdmin: user?.isAdmin === true,
    login: user?.login ?? null,
  };
}
