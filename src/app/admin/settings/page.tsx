import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import {
  getAllOverrides,
  setSiteOverrides,
  type OverridableFields,
} from "@/lib/site-config-server";
import {
  getSiteSetting,
  setSiteSetting,
} from "@/db/site-settings";

export const metadata: Metadata = {
  title: "站点设置",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const allFields = await getAllOverrides();
  const loginRequired = (await getSiteSetting("site_login_required")) === "true";
  // These keys have dedicated admin pages and are filtered out from the
  // generic settings form so they don't appear twice.
  const dedicated = new Set([
    "mascot.allowUserSwitch",
    "mascot.showSwitchButton",
    "mascot.defaultCharacter",
    "music.sourceMode",
    "music.playlistId",
    "music.savedPlaylists",
    "music.lxApiUrl",
    "music.localTracks",
    "effects.playerWidget",
    "effects.clickParticles",
    "effects.textSparkle",
    "effects.particles",
    "effects.glow",
  ]);
  const fields = allFields.filter((f) => !dedicated.has(f.key));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">站点设置</h1>
      </header>

      <p className="text-sm text-muted">
        这里改动的值会覆盖{" "}
        <code className="rounded bg-card px-1.5 py-0.5 text-xs">
          src/lib/site-config.ts
        </code>{" "}
        的对应字段。留空或与默认值一致时恢复默认。
      </p>

      <form
        action={async (formData: FormData) => {
          "use server";
          const entries: { key: OverridableFields; value: string }[] = [];
          for (const f of fields) {
            entries.push({
              key: f.key,
              value: String(formData.get(f.key) ?? ""),
            });
          }
          await setSiteOverrides(entries);
        }}
        className="flex flex-col gap-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <label key={f.key} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{f.key}</span>
              <input
                name={f.key}
                type="text"
                defaultValue={f.value}
                placeholder={f.default}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
              />
              {f.value !== f.default ? (
                <span className="text-[10px] text-primary">
                  已自定义（默认：{f.default}）
                </span>
              ) : (
                <span className="text-[10px] text-muted">
                  默认：{f.default}
                </span>
              )}
            </label>
          ))}
        </div>

        <div>
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            保存设置
          </button>
        </div>
      </form>

      <hr className="border-border" />

      {/* Site-wide login toggle */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">访问控制</h2>
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">全站登录</p>
            <p className="mt-0.5 text-xs text-muted">
              开启后，未登录用户访问任何页面都会跳转到登录页
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              const next = loginRequired ? "false" : "true";
              await setSiteSetting("site_login_required", next);
            }}
          >
            <button
              type="submit"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                loginRequired ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  loginRequired ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </form>
        </div>
        <p className="text-xs text-muted">
          当前状态：{loginRequired ? "已开启 — 未登录用户会被拦截" : "已关闭 — 所有人可自由访问"}
        </p>
      </section>

      <hr className="border-border" />

      <div className="text-xs text-muted">
        <p className="font-medium">说明</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
          <li>这些值在每次请求时从数据库读取（含 1 分钟内存缓存）。</li>
          <li>清空一个字段并保存，该字段恢复为 site-config.ts 的默认值。</li>
          <li>头像路径填本地文件（如 /avatar.jpg）或外部 URL。</li>
          <li>改完后刷新站点即可看到效果，无需 redeploy。</li>
        </ul>
      </div>
    </div>
  );
}
