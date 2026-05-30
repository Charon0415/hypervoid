import { SocialIcon } from "@/components/SocialIcon";
import { Avatar } from "@/components/Avatar";
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
    <aside className="hv-panel-sci group relative overflow-hidden p-3 text-center">
      {/* Decorative corner lines */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-16 bg-gradient-to-r from-cyan-400/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-16 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-px w-16 bg-gradient-to-l from-cyan-400/40 to-transparent" />

      <div className="relative mx-auto h-16 w-16">
        <div
          aria-hidden
          className="absolute -inset-2 rounded-full bg-cyan-400/20 blur-2xl transition-all duration-500 group-hover:bg-cyan-400/30"
        />
        <div
          aria-hidden
          className="absolute -inset-1 rounded-full border border-cyan-400/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)' }}
        />
        <Avatar
          src={avatar}
          alt={`${name} avatar`}
          name={name}
          className="relative h-16 w-16 rounded-full border-2 border-cyan-400/40 shadow-[0_0_24px_rgba(103,232,249,0.3)]"
        />
      </div>

      <h2 className="mt-2 text-base font-bold tracking-tight text-cyan-50">{name}</h2>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-400/70">@{handle}</p>
      <div className="mx-auto mt-1.5 h-px w-16 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <p className="mt-1.5 line-clamp-2 font-mono text-xs italic leading-snug text-cyan-50/70">{bio}</p>

      <div className="mt-3 flex flex-nowrap items-center justify-center gap-1.5">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            title={s.name}
            aria-label={s.name}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center border border-cyan-100/16 bg-cyan-950/40 text-cyan-100/70 transition hover:border-cyan-400/50 hover:bg-cyan-900/50 hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(103,232,249,0.2)]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
          >
            <SocialIcon name={s.icon} className="h-3 w-3" />
          </a>
        ))}
      </div>
    </aside>
  );
}
