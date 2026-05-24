/** Client-safe date formatting that doesn't import server-only modules. */
export function formatDateCN(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" });
}
