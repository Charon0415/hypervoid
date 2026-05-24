import { getPostHeatmap } from "@/lib/stats";

const WEEKS = 16;

function intensity(count: number): string {
  if (count <= 0) return "bg-border/40";
  if (count === 1) return "bg-primary/30";
  if (count === 2) return "bg-primary/55";
  if (count === 3) return "bg-primary/75";
  return "bg-primary";
}

const MONTH_LABEL_ZH = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export async function PostActivityHeatmap() {
  const days = await getPostHeatmap(WEEKS);

  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const totalThisPeriod = days.reduce((acc, d) => acc + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;

  let lastMonth = -1;
  const monthLabels = weeks.map((week) => {
    const firstDay = week[0];
    if (!firstDay) return null;
    const month = new Date(firstDay.date + "T00:00:00Z").getUTCMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      return MONTH_LABEL_ZH[month];
    }
    return null;
  });

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">发文热力图</h2>
        <p className="text-xs text-muted">
          近 {WEEKS} 周共 {totalThisPeriod} 篇 · 活跃 {activeDays} 天
        </p>
      </header>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1.5">
          <div className="flex gap-1 pl-7">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="w-3 text-[10px] leading-none text-muted sm:w-3.5"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col justify-between py-0.5 pr-1 text-[10px] leading-none text-muted">
              <span>一</span>
              <span>三</span>
              <span>五</span>
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date} · ${day.count} 篇`}
                    className={`h-3 w-3 rounded-sm sm:h-3.5 sm:w-3.5 ${intensity(day.count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-4 flex items-center justify-end gap-1.5 text-[11px] text-muted">
        <span>少</span>
        <span className="h-3 w-3 rounded-sm bg-border/40" />
        <span className="h-3 w-3 rounded-sm bg-primary/30" />
        <span className="h-3 w-3 rounded-sm bg-primary/55" />
        <span className="h-3 w-3 rounded-sm bg-primary/75" />
        <span className="h-3 w-3 rounded-sm bg-primary" />
        <span>多</span>
      </footer>
    </section>
  );
}
