import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { getSiteOverride } from "@/lib/site-config-server";
import { getDb, schema } from "@/db/client";

export const metadata: Metadata = {
  title: "看板娘设置",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type MascotId = "kanna" | "rem";

const MASCOTS: {
  id: MascotId;
  name: string;
  nameJa: string;
  source: string;
  desc: string;
  avatar: string;
  tech: string;
}[] = [
  {
    id: "kanna",
    name: "康娜·卡姆依",
    nameJa: "カンナ・カムイ",
    source: "小林家的龙女仆",
    desc: "活了几千年的小龙女，看起来 7-8 岁。安静、慢热、偶尔毒舌。喜欢零食和鱼。",
    avatar: "/live2d/kobayaxi/Kobayaxi.2048/texture_00.png",
    tech: "Live2D (PixiJS + Cubism2)",
  },
  {
    id: "rem",
    name: "雷姆",
    nameJa: "レム",
    source: "Re:Zero 从零开始的异世界生活",
    desc: "鬼族少女，蓝发女仆。温柔、忠诚、勤劳，偶尔自卑。对主人非常尊敬和依赖。",
    avatar: "/mascot/rem/1.webp",
    tech: "WebP 动图（透明背景）",
  },
];

export default async function AdminMascotPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const current = await getSiteOverride("mascot.character");
  const activeId: MascotId = current === "rem" ? "rem" : "kanna";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">看板娘设置</h1>
      </header>

      <p className="text-sm text-muted">
        选择在页面右下角显示的看板娘角色。切换后刷新前端即可生效。
        未来会加入更多角色。
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {MASCOTS.map((m) => {
          const isActive = m.id === activeId;
          return (
            <form key={m.id} action={async () => {
              "use server";
              const s = await auth();
              if (!s?.user) redirect("/admin/sign-in");
              const db = getDb();
              const now = new Date();
              await db
                .insert(schema.siteOverrides)
                .values({ key: "mascot.character", value: m.id, updatedAt: now })
                .onConflictDoUpdate({
                  target: schema.siteOverrides.key,
                  set: { value: m.id, updatedAt: now },
                });
              // Invalidate cache
              const { revalidatePath } = await import("next/cache");
              revalidatePath("/admin/mascot");
            }}>
              <button
                type="submit"
                className={`group flex h-full w-full flex-col gap-4 rounded-2xl border p-5 text-left transition ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted/20">
                    <Image
                      src={m.avatar}
                      alt={m.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold tracking-tight">
                        {m.name}
                      </h2>
                      {isActive ? (
                        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                          当前
                        </span>
                      ) : null}
                    </div>
                    <p className="font-mono text-xs text-muted">
                      {m.nameJa} · {m.source}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {m.desc}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-muted/80">
                      渲染: {m.tech}
                    </p>
                  </div>
                </div>
                {!isActive ? (
                  <span className="mt-auto w-full rounded-lg border border-border bg-background px-3 py-1.5 text-center text-sm font-medium transition group-hover:border-primary group-hover:text-primary">
                    切换为 {m.name}
                  </span>
                ) : null}
              </button>
            </form>
          );
        })}
      </div>

      <div className="text-xs text-muted">
        <p className="font-medium">说明</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
          <li>角色设置保存在数据库的 site_overrides 表中。</li>
          <li>切换角色后，前端需要刷新页面才能看到新的看板娘。</li>
          <li>看板娘在移动端和管理后台页面默认隐藏。</li>
          <li>访客可在站点设置面板中开关看板娘、切换角色。</li>
        </ul>
      </div>
    </div>
  );
}
