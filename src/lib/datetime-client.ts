/** Client-safe date formatting that doesn't import server-only modules. */
export function formatDateCN(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" });
}

export function formatDateTimeCN(d: Date): string {
  const date = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" });
  const time = d.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}
