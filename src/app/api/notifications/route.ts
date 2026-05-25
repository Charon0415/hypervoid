import {
  getAdminNotifications,
  getVisitorNotifications,
} from "@/lib/notifications";
import { getViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const viewer = await getViewer().catch(() => ({
    isAdmin: false,
    login: null,
  }));
  const notifications = viewer.isAdmin
    ? await getAdminNotifications().catch(() => [])
    : await getVisitorNotifications().catch(() => []);
  return Response.json({
    isAdmin: viewer.isAdmin,
    notifications,
  });
}
