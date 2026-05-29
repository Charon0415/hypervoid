import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { getAllOverrides } from "@/lib/site-config-server";
import { getSiteSetting } from "@/db/site-settings";
import {
  saveSiteSettingsAction,
  setLoginPolicyAction,
  toggleHomepageLoginRedirectAction,
} from "@/app/admin/settings/actions";

export const metadata: Metadata = {
  title: "站点设置",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const allFields = await getAllOverrides();
  const loginPolicy = (await getSiteSetting("site_login_required")) || "optional";
  const homepageRedirect = (await getSiteSetting("homepage_login_redirect")) === "true";
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
      <header className="hv-panel p-5 sm:p-6 flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="hv-title text-2xl font-black tracking-tight">站点设置</h1>
      </header>

      <p className="text-sm text-cyan-50/55">
        这里改动的值会覆盖{" "}
        <code className="rounded bg-white/[0.045] px-1.5 py-0.5 text-xs">
          src/lib/site-config.ts
        </code>{" "}
        的对应字段。留空或与默认值一致时恢复默认。
      </p>

      <form
        action={saveSiteSettingsAction}
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
                className="w-full rounded-md border border-cyan-100/16 bg-white/[0.035] px-3 py-2 text-sm transition focus:border-cyan-100/45 focus:outline-none"
              />
              {f.value !== f.default ? (
                <span className="text-[10px] text-cyan-100">
                  已自定义（默认：{f.default}）
                </span>
              ) : (
                <span className="text-[10px] text-cyan-50/55">
                  默认：{f.default}
                </span>
              )}
            </label>
          ))}
        </div>

        <div>
          <button
            type="submit"
            className="hv-action px-5 py-2 text-sm font-medium"
          >
            保存设置
          </button>
        </div>
      </form>

      <hr className="border-cyan-100/16" />

      {/* Login policy */}
      <section className="flex flex-col gap-4">
        <h2 className="hv-title text-lg font-semibold tracking-normal">访问控制</h2>
        <form action={setLoginPolicyAction} className="flex flex-col gap-3">
          {[
            {
              value: "optional",
              label: "自由访问",
              desc: "登录页可选，所有访客可自由浏览博客内容",
            },
            {
              value: "required",
              label: "全站登录",
              desc: "未登录用户访问任何页面都会跳转到登录页",
            },
            {
              value: "private_only",
              label: "仅私密空间",
              desc: "博客公开可浏览，但访问 /private 路径时需要登录",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                loginPolicy === opt.value
                  ? "border-cyan-100/45 bg-cyan-100/12"
                  : "border-cyan-100/16 bg-white/[0.035] hover:border-cyan-100/40"
              }`}
            >
              <input
                type="radio"
                name="login_policy"
                value={opt.value}
                defaultChecked={loginPolicy === opt.value}
                className="mt-0.5 accent-cyan-300"
              />
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="mt-0.5 text-xs text-cyan-50/55">{opt.desc}</p>
              </div>
            </label>
          ))}
          <div>
            <button
              type="submit"
              className="hv-action px-5 py-2 text-sm font-medium"
            >
              保存策略
            </button>
          </div>
        </form>
        <p className="text-xs text-cyan-50/55">
          当前策略：
          {loginPolicy === "required"
            ? "全站登录 — 未登录用户会被拦截"
            : loginPolicy === "private_only"
              ? "仅私密空间 — /private 路径需要登录"
              : "自由访问 — 所有人可自由浏览"}
        </p>

        <div className="flex items-center justify-between border border-cyan-100/16 bg-white/[0.045] p-4">
          <div>
            <p className="text-sm font-medium">首页登录拦截</p>
            <p className="mt-0.5 text-xs text-cyan-50/55">
              开启后，未登录用户访问首页会直接跳转到登录揭幕页
            </p>
          </div>
          <form action={toggleHomepageLoginRedirectAction}>
            <button
              type="submit"
              aria-pressed={homepageRedirect}
              aria-label={homepageRedirect ? "关闭首页登录拦截" : "开启首页登录拦截"}
              className={`relative inline-flex h-6 w-11 items-center transition-colors duration-200 ${
                homepageRedirect ? "bg-cyan-100" : "bg-cyan-100/16"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 bg-black shadow transition-transform duration-200 ${
                  homepageRedirect ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </form>
        </div>
        <p className="text-xs text-cyan-50/55">
          当前状态：{homepageRedirect ? "已开启 — 未登录用户进入首页会跳转登录页" : "已关闭 — 首页正常展示"}
        </p>
      </section>

      <hr className="border-cyan-100/16" />

      <div className="text-xs text-cyan-50/55">
        <p className="font-medium">说明</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
          <li>站点文案覆盖值保留 1 分钟内存缓存；全站登录开关会在下一次请求生效。</li>
          <li>清空一个字段并保存，该字段恢复为 site-config.ts 的默认值。</li>
          <li>头像路径填本地文件（如 /avatar.jpg）或外部 URL。</li>
          <li>改完后刷新站点即可看到效果，无需 redeploy。</li>
        </ul>
      </div>
    </div>
  );
}
