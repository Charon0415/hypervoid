import { SocialIcon } from "@/components/SocialIcon";
import { Avatar } from "@/components/Avatar";
import { siteConfig } from "@/lib/site-config";

export function ProfileCard() {
  const { author, socials } = siteConfig;
  return (
    <aside className="rounded-2xl border border-border bg-card p-4 text-center sm:p-5">
      <div className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20">
        <div
          aria-hidden
          className="absolute -inset-1.5 rounded-full bg-primary/15 blur-lg"
        />
        <Avatar
          src={author.avatar}
          alt={`${author.name} avatar`}
          name={author.name}
          className="relative h-16 w-16 rounded-full border-2 border-border sm:h-20 sm:w-20"
        />
      </div>
      <h2 className="mt-3 text-base font-bold tracking-tight sm:text-lg">{author.name}</h2>
      <p className="mt-0.5 text-[11px] text-muted">@{author.handle}</p>
      <p className="mt-2 font-mono text-[11px] italic text-muted">{author.bio}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            title={s.name}
            aria-label={s.name}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted transition hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            <SocialIcon name={s.icon} className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </aside>
  );
}
