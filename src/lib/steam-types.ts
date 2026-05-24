export type SteamGame = {
  appId: number;
  name: string;
  cover: string;
  iconUrl: string;
  playtimeForeverMin: number;
  playtimeRecentMin: number;
  hasCommunityVisibleStats: boolean;
};

export function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  if (hours < 100) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
}
