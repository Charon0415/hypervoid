import { SocialIcon } from "@/components/SocialIcon";
import { Avatar } from "@/components/Avatar";
import { BorderGlow } from "@/components/BorderGlow";
import { siteConfig } from "@/lib/site-config";
import { getSiteOverride } from "@/lib/site-config-server";

export async function ProfileCard() {
  const [name, handle, bio, avatar] = await Promise.all([
    getSiteOverride("author.name"),
    getSiteOverride("author.handle"),
    getSiteOverride("author.bio"),
    getSiteOverride("author.avatar"),
  ]);
  const socials = siteConfig.socials.filter(
    (s) => !("hideFromProfile" in s && s.hideFromProfile),
  );
  return (
    <BorderGlow
      colors={["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#ec4899"]}
      glowColor="99 102 241"
      backgroundColor="rgba(8,11,20,0.8)"
      borderRadius={20}
      edgeSensitivity={25}
      glowRadius={40}
    >
      <aside className="group relative overflow-hidden p-6 text-center backdrop-blur-xl sm:p-8" style={{ background: "linear-gradient(145deg, rgba(239,68,68,0.08), rgba(249,115,22,0.06), rgba(234,179,8,0.06), rgba(34,197,94,0.07), rgba(6,182,212,0.09), rgba(59,130,246,0.1), rgba(99,102,241,0.08), rgba(139,92,246,0.07), rgba(217,70,239,0.06), rgba(12,18,36,0.75))", WebkitBackdropFilter: "blur(32px) saturate(1.6)" }}>
        {/* Decorative corner lines — full spectrum */}
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-28" style={{ background: "linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, transparent)" }} />
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-28 w-px" style={{ background: "linear-gradient(180deg, #ef4444, #3b82f6, #8b5cf6, transparent)" }} />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-px w-28" style={{ background: "linear-gradient(270deg, #ec4899, #d946ef, #8b5cf6, #3b82f6, transparent)" }} />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-28 w-px" style={{ background: "linear-gradient(0deg, #ec4899, #8b5cf6, #06b6d4, transparent)" }} />

        {/* Avatar — larger */}
        <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-full blur-3xl transition-all duration-500"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25), rgba(139,92,246,0.15), rgba(236,72,153,0.1), transparent)" }}
          />
          <Avatar
            src={avatar}
            alt={`${name} avatar`}
            name={name}
            className="relative h-28 w-28 rounded-full border-2 border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.35)] sm:h-32 sm:w-32"
          />
        </div>

        {/* Name with gradient text for readability */}
        <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl" style={{ background: "linear-gradient(135deg, #f0f4ff, #e0e8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{name}</h2>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-accent/70 sm:text-sm">@{handle}</p>
        <div className="mx-auto mt-3 h-px w-28" style={{ background: "linear-gradient(90deg, transparent, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #d946ef, transparent)" }} />
        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted sm:text-base" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{bio}</p>

        {/* Social icons — larger */}
        <div className="mt-5 flex flex-nowrap items-center justify-center gap-2.5">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              title={s.name}
              aria-label={s.name}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:shadow-[0_0_20px_var(--rainbow-glow)]"
              style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.12), rgba(139,92,246,0.1), rgba(12,18,36,0.8))", border: "1px solid rgba(255,255,255,0.1)", color: "var(--accent-soft)" }}
            >
              <SocialIcon name={s.icon} className="h-4 w-4" />
            </a>
          ))}
        </div>
      </aside>
    </BorderGlow>
  );
}
