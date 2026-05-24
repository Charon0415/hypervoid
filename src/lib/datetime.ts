export const SITE_TZ = "Asia/Shanghai";

/** Format a Date as `YYYY-MM-DD` in China Standard Time (Asia/Shanghai). */
export function formatDateCN(d: Date): string {
  // sv-SE locale renders YYYY-MM-DD by default (ISO-style)
  return d.toLocaleDateString("sv-SE", { timeZone: SITE_TZ });
}

/** Format a Date as `YYYY-MM-DD HH:mm` in China Standard Time. */
export function formatDateTimeCN(d: Date): string {
  const date = d.toLocaleDateString("sv-SE", { timeZone: SITE_TZ });
  const time = d.toLocaleTimeString("en-GB", {
    timeZone: SITE_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

/** Number of *calendar* days since an `YYYY-MM-DD` date, computed in CST. */
export function daysSinceCN(iso: string): number {
  const start = new Date(`${iso}T00:00:00+08:00`).getTime();
  const today = Date.now();
  return Math.max(0, Math.floor((today - start) / 86_400_000));
}
