import { TopicMagicBento } from "@/components/TopicMagicBento";
import { getPublicSeriesList } from "@/lib/series-public";

export async function TopicCollections() {
  const series = (await getPublicSeriesList()).slice(0, 6);
  if (!series.length) return null;

  return <TopicMagicBento series={series} />;
}
