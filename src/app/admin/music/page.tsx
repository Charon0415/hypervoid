import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { getSiteOverride, setSiteOverrides } from "@/lib/site-config-server";
import { getPlaylistMeta, ncmCookieConfigured, type NcmPlaylistMeta } from "@/lib/ncm";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = {
  title: "音乐设置",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SavedPlaylist = NcmPlaylistMeta & { addedAt: number };

function parseSaved(raw: string): SavedPlaylist[] {
  if (!raw.trim()) return [];
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is SavedPlaylist =>
      typeof x?.id === "string" && typeof x?.name === "string",
    );
  } catch {
    return [];
  }
}

function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Direct numeric ID
  if (/^\d+$/.test(trimmed)) return trimmed;
  // URL forms — accept `id=XXX` anywhere
  const m = trimmed.match(/[?&]id=(\d+)/);
  if (m) return m[1];
  return null;
}

async function ensureAdmin() {
  const s = await auth();
  if (!s?.user) redirect("/admin/sign-in");
}

async function addPlaylistAction(formData: FormData) {
  "use server";
  await ensureAdmin();
  const input = String(formData.get("input") ?? "");
  const id = extractPlaylistId(input);
  if (!id) {
    redirect("/admin/music?err=invalid");
  }

  // Skip if already saved
  const savedRaw = await getSiteOverride("music.savedPlaylists");
  const saved = parseSaved(savedRaw);
  if (saved.some((p) => p.id === id)) {
    redirect("/admin/music?err=duplicate");
  }

  let meta: NcmPlaylistMeta;
  try {
    meta = await getPlaylistMeta(id);
  } catch {
    redirect("/admin/music?err=fetch");
  }

  const next: SavedPlaylist[] = [...saved, { ...meta, addedAt: Date.now() }];
  await setSiteOverrides([
    { key: "music.savedPlaylists", value: JSON.stringify(next) },
  ]);

  // If it's the first one, also activate it
  const currentActive = await getSiteOverride("music.playlistId");
  if (!currentActive.trim() && next.length === 1) {
    await setSiteOverrides([{ key: "music.playlistId", value: id }]);
  }

  revalidatePath("/admin/music");
  revalidatePath("/music");
  revalidatePath("/");
}

async function setActiveAction(formData: FormData) {
  "use server";
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await setSiteOverrides([{ key: "music.playlistId", value: id }]);
  revalidatePath("/admin/music");
  revalidatePath("/music");
  revalidatePath("/");
}

async function removePlaylistAction(formData: FormData) {
  "use server";
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const savedRaw = await getSiteOverride("music.savedPlaylists");
  const saved = parseSaved(savedRaw);
  const next = saved.filter((p) => p.id !== id);
  await setSiteOverrides([
    { key: "music.savedPlaylists", value: JSON.stringify(next) },
  ]);
  // Clear active if it was the removed one
  const activeId = await getSiteOverride("music.playlistId");
  if (activeId === id) {
    await setSiteOverrides([{ key: "music.playlistId", value: next[0]?.id ?? "" }]);
  }
  revalidatePath("/admin/music");
  revalidatePath("/music");
  revalidatePath("/");
}

async function refreshPlaylistAction(formData: FormData) {
  "use server";
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  let meta: NcmPlaylistMeta;
  try {
    meta = await getPlaylistMeta(id);
  } catch {
    redirect("/admin/music?err=fetch");
  }
  const savedRaw = await getSiteOverride("music.savedPlaylists");
  const saved = parseSaved(savedRaw);
  const next = saved.map((p) =>
    p.id === id ? { ...p, ...meta, addedAt: p.addedAt } : p,
  );
  await setSiteOverrides([
    { key: "music.savedPlaylists", value: JSON.stringify(next) },
  ]);
  revalidatePath("/admin/music");
  revalidatePath("/music");
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "无法从输入里识别出歌单 ID。请贴网易云歌单链接（含 id=…）或纯数字 ID。",
  duplicate: "这个歌单已经在列表里了。",
  fetch: "拉取歌单信息失败。检查 ID 是否正确，或网络是否能访问 music.163.com。",
};

export default async function AdminMusicPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; test?: string }>;
}) {
  await ensureAdmin();
  const { err, test } = await searchParams;
  const [savedRaw, activeId] = await Promise.all([
    getSiteOverride("music.savedPlaylists"),
    getSiteOverride("music.playlistId"),
  ]);
  const saved = parseSaved(savedRaw).sort((a, b) => b.addedAt - a.addedAt);
  const cookieSet = ncmCookieConfigured();

  // Run a diagnostic if the admin clicked "测试连接"
  let testResult: { ok: boolean; name?: string; tracks?: number; error?: string } | null = null;
  if (test === "connect" && activeId) {
    try {
      const meta = await getPlaylistMeta(activeId);
      testResult = { ok: true, name: meta.name, tracks: meta.trackCount };
    } catch (e) {
      testResult = { ok: false, error: e instanceof Error ? e.message : "unknown" };
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">音乐设置</h1>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">添加歌单</h2>
        <p className="mt-1 text-xs text-muted">
          粘贴网易云音乐歌单链接（如{" "}
          <code className="rounded bg-background px-1.5 py-0.5">
            https://music.163.com/playlist?id=2829883282
          </code>
          ）或纯数字 ID。
        </p>
        <form
          action={addPlaylistAction}
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input
            name="input"
            type="text"
            required
            placeholder="https://music.163.com/playlist?id=... 或 2829883282"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            添加
          </button>
        </form>
        {err && ERROR_MESSAGES[err] ? (
          <p className="mt-3 rounded-md border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            {ERROR_MESSAGES[err]}
          </p>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-tight">
            已保存歌单
            <span className="ml-2 font-mono text-xs text-muted">
              {saved.length}
            </span>
          </h2>
          {activeId ? (
            <p className="font-mono text-xs text-muted">
              当前 ID: {activeId}
            </p>
          ) : null}
        </div>

        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            还没有保存的歌单。上方添加一个。
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((p) => {
              const isActive = p.id === activeId;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 transition ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted/20">
                      {p.cover ? (
                        <Image
                          src={p.cover}
                          alt={p.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl text-muted/40">
                          ♪
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
                          {p.name}
                        </h3>
                        {isActive ? (
                          <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                            当前
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {p.trackCount} 首
                        {p.creator ? ` · ${p.creator}` : ""}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-muted/70">
                        ID: {p.id}
                      </p>
                    </div>
                  </div>

                  {p.description ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted">
                      {p.description}
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {!isActive ? (
                      <form action={setActiveAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/15"
                        >
                          设为当前
                        </button>
                      </form>
                    ) : null}
                    <form action={refreshPlaylistAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        title="重新拉取封面/名称"
                        className="rounded-md border border-border bg-background px-3 py-1 text-xs text-muted transition hover:border-primary/40 hover:text-primary"
                      >
                        刷新
                      </button>
                    </form>
                    <a
                      href={`https://music.163.com/#/playlist?id=${p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-border bg-background px-3 py-1 text-xs text-muted transition hover:border-primary/40 hover:text-primary"
                    >
                      网易云 ↗
                    </a>
                    <form action={removePlaylistAction} className="ml-auto">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-border bg-background px-3 py-1 text-xs text-muted transition hover:border-red-500/40 hover:text-red-500"
                      >
                        删除
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">NCM Cookie 状态</h2>
        <div className="mt-3 flex items-center gap-3">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${
              cookieSet ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <p className="text-sm">
            {cookieSet ? (
              <>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  已配置
                </span>
                <span className="ml-2 text-muted">
                  歌曲 URL 会带登录态请求（默认排除 Cookie: 前缀、引号、换行）
                </span>
              </>
            ) : (
              <>
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  未配置
                </span>
                <span className="ml-2 text-muted">
                  歌曲 URL 大概率返回 null（VIP / 版权曲无法播放）
                </span>
              </>
            )}
          </p>
        </div>

        {activeId ? (
          <div className="mt-3">
            <a
              href="/admin/music?test=connect"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1 text-xs text-muted transition hover:border-primary/40 hover:text-primary"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              测试：用当前歌单 ID ({activeId}) 直连网易云 API
            </a>
            {testResult ? (
              <div className={`mt-3 rounded-md border px-4 py-3 ${
                testResult.ok
                  ? "border-emerald-400/30 bg-emerald-400/5"
                  : "border-red-400/30 bg-red-400/5"
              }`}>
                {testResult.ok ? (
                  <p className="text-sm">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      连接成功
                    </span>
                    <span className="ml-2 text-muted">
                      歌单「{testResult.name}」· {testResult.tracks} 首
                    </span>
                  </p>
                ) : (
                  <p className="text-sm">
                    <span className="font-medium text-red-700 dark:text-red-400">
                      连接失败
                    </span>
                    <span className="ml-2 break-all font-mono text-xs text-muted">
                      {testResult.error}
                    </span>
                  </p>
                )}
                <p className="mt-1.5 text-[11px] text-muted">
                  {testResult.ok
                    ? "歌单元数据能拉到 → 播放失败的话问题在歌曲 URL 环节（大概率 cookie 过期需要续）。"
                    : "常见原因：NCM_COOKIE 格式错误 / 已过期 / Vercel 没设到 Production / 歌单 ID 不存在。"}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted">
            还没有当前歌单，添加一个后才能测试。
          </p>
        )}

        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted hover:text-foreground">
            常见 Cookie 粘贴问题
          </summary>
          <ul className="mt-2 space-y-1 pl-5 text-xs text-muted">
            <li>如果直接从浏览器 DevTools 的 Headers 面板复制，可能带 <code className="rounded bg-background px-1">Cookie:</code> 前缀 —— 代码会自动去掉。</li>
            <li>Vercel 里填的时候不要加引号（<code>&quot;MUSIC_U=xxx&quot;</code> → <code>MUSIC_U=xxx</code>）。</li>
            <li>改了值以后要重新部署（或至少 Redeploy），环境变量只在构建时读取。</li>
            <li>Cookie 一般 3-6 个月过期。过期后浏览器重新登录再复制一次就行。</li>
            <li>如果 HTTP 返回 200 但代码报 <code>code=301</code>，说明 Cookie 无效或需要刷新。</li>
          </ul>
        </details>

        <p className="mt-3 text-xs text-muted">
          环境变量 <code className="rounded bg-background px-1.5 py-0.5">NCM_COOKIE</code>{" "}
          在 Vercel 项目设置里配置。值是浏览器登录 music.163.com 后任意请求头里的{" "}
          <code className="rounded bg-background px-1.5 py-0.5">Cookie</code> 字段
          （也可只贴 <code className="rounded bg-background px-1.5 py-0.5">MUSIC_U=…</code> 那段）。
        </p>
      </section>

      <div className="text-xs text-muted">
        <p className="font-medium">说明</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
          <li>当前歌单 ID 存储在 <code>music.playlistId</code> override。</li>
          <li>已保存歌单列表存储在 <code>music.savedPlaylists</code> override（JSON）。</li>
          <li>「刷新」会从网易云重新拉取封面和名称（默认 5 分钟内有缓存）。</li>
          <li>切换当前歌单后，前端最长 60 秒内会刷新（受 ISR 缓存影响）。</li>
        </ul>
      </div>
    </div>
  );
}
