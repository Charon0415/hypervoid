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
  const { socials } = siteConfig;
  return (
    <aside className="rounded-3xl border border-border bg-card p-6 text-center">
      <div className="relative mx-auto h-24 w-24">
        <div
          aria-hidden
          className="absolute -inset-2 rounded-full bg-primary/15 blur-xl"
        />
        <Avatar
          src={avatar}
          alt={`${name} avatar`}
          name={name}
          className="relative h-24 w-24 rounded-full border-2 border-border"
        />
      </div>
      <h2 className="mt-4 text-xl font-bold tracking-tight">{name}</h2>
      <p className="mt-1 text-xs text-muted">@{handle}</p>
      <p className="mt-3 font-mono text-xs italic text-muted">{bio}</p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            title={s.name}
            aria-label={s.name}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted transition hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            <SocialIcon name={s.icon} className="h-4 w-4" />
          </a>
        ))}
      </div>
    </aside>
  );
}
