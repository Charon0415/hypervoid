import { siteConfig } from "@/lib/site-config";

function daysSince(iso: string): number {
  const start = new Date(`${iso}T00:00:00Z`).getTime();
  const today = Date.now();
  return Math.max(0, Math.floor((today - start) / 86_400_000));
}

function formatUptime(days: number): string {
  if (days < 1) return "Day 1";
  if (days < 365) return `Running for ${days} day${days === 1 ? "" : "s"}`;
  const years = Math.floor(days / 365);
  const rest = days % 365;
  if (rest === 0) return `Running for ${years} year${years > 1 ? "s" : ""}`;
  return `Running for ${years}y ${rest}d`;
}

export function SiteUptime({ className = "" }: { className?: string }) {
  const days = daysSince(siteConfig.launchedAt);
  const launchDisplay = siteConfig.launchedAt.replace(/-/g, ".");
  return (
    <span className={className} title={`Since ${siteConfig.launchedAt}`}>
      {formatUptime(days)} · Since {launchDisplay}
    </span>
  );
}
