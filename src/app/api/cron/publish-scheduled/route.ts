import { and, eq, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await getDb()
    .update(schema.posts)
    .set({ status: "published", updatedAt: new Date() })
    .where(
      and(
        eq(schema.posts.status, "scheduled"),
        lte(schema.posts.publishAt, sql`NOW()`),
      ),
    )
    .returning({ slug: schema.posts.slug });

  if (rows.length > 0) {
    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/tags");
    for (const r of rows) revalidatePath(`/posts/${r.slug}`);
  }

  return Response.json({
    publishedCount: rows.length,
    publishedSlugs: rows.map((r) => r.slug),
  });
}
