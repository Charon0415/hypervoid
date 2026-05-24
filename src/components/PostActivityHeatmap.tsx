import { getPostHeatmap } from "@/lib/stats";

const WEEKS = 18;

/* GitHub-style green palette: 0 posts → 4+ posts */
function cellColor(count: number): string {
  if (count <= 0) return "bg-zinc-100 dark:bg-zinc-800";
  if (count === 1) return "bg-emerald-200 dark:bg-emerald-900";
  if (count === 2) return "bg-emerald-300 dark:bg-emerald-700";
  if (count === 3) return "bg-emerald-400 dark:bg-emerald-500";
  return "bg-emerald-500 dark:bg-emerald-400";
}

const MONTHS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const DAY_ABBR: Record<number, string> = {
  1: "一",
  3: "三",
  5: "五",
};

function getMonth(d: Date): number {
  return new Date(d.getTime() + 8 * 3600_000).getUTCMonth();
}

export async function PostActivityHeatmap() {
  const days = await getPostHeatmap(WEEKS);

  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const totalPosts = days.reduce((acc, d) => acc + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;

  /* Month labels — place at the first week whose *first day* falls in a new
     month, or if that month starts mid-week, in the week that contains its 1st.
     GitHub anchors months to the position of each month's first cell. */
  const monthLabels = weeks.map((week, wi) => {
    const firstDay = week[0];
    if (!firstDay) return null;
    const m = getMonth(new Date(firstDay.date + "T00:00:00Z"));
    if (wi === 0) return m;
    const prev = weeks[wi - 1]?.[0];
    if (!prev) return null;
    const prevM = getMonth(new Date(prev.date + "T00:00:00Z"));
    return m !== prevM ? m : null;
  });

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-baseline gap-2 text-sm">
        <span className="font-semibold tracking-tight">
          {totalPosts} 篇
        </span>
        <span className="text-xs text-muted">
          过去 {WEEKS} 周 · {activeDays} 个活跃日
        </span>
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        <div className="inline-flex flex-col gap-[2px]">
          {/* Month labels */}
          <div className="mb-[2px] flex gap-[2px] pl-7">
            {monthLabels.map((m, i) => {
              if (m === null) return <div key={i} className="h-3 w-[10px]" />;
              return (
                <div key={i} className="relative h-3 w-[10px]">
                  <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] leading-none text-muted">
                    {MONTHS[m]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="mr-1 flex shrink-0 flex-col gap-[2px] text-[9px] leading-none text-muted/60">
              {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                <div key={row} className="flex h-[10px] items-center justify-end">
                  {DAY_ABBR[row] ?? ""}
                </div>
              ))}
            </div>

            {/* Cells */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date} · ${day.count} 篇文章`}
                    className={`h-[10px] w-[10px] rounded-sm ${cellColor(day.count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-[2px] text-[10px] text-muted/70">
        <span className="mr-0.5">少</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-[10px] w-[10px] rounded-sm ${cellColor(n)}`}
          />
        ))}
        <span className="ml-0.5">多</span>
      </div>
    </section>
  );
}
