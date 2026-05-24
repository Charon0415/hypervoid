export const SITE_TZ = "Asia/Shanghai";

/** Format a Date as `YYYY-MM-DD` in China Standard Time (Asia/Shanghai). */
export function formatDateCN(d: Date): string {
  // sv-SE locale renders YYYY-MM-DD by default (ISO-style)
  return d.toLocaleDateString("sv-SE", { timeZone: SITE_TZ });
}

/** Number of *calendar* days since an `YYYY-MM-DD` date, computed in CST. */
export function daysSinceCN(iso: string): number {
  const start = new Date(`${iso}T00:00:00+08:00`).getTime();
  const today = Date.now();
  return Math.max(0, Math.floor((today - start) / 86_400_000));
}
