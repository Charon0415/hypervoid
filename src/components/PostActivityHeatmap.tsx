import { getPostHeatmap } from "@/lib/stats";

const WEEKS = 20;

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

const DAY_LABELS: Record<number, string> = {
  1: "一",
  3: "三",
  5: "五",
};

export async function PostActivityHeatmap() {
  const days = await getPostHeatmap(WEEKS);

  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const totalThisPeriod = days.reduce((acc, d) => acc + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;
  const peakDay = days.reduce(
    (best, d) => (d.count > best.count ? d : best),
    { date: "", count: 0 },
  );

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
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <div className="shrink-0 md:max-w-[14rem]">
          <h2 className="text-base font-semibold tracking-tight">发文热力图</h2>
          <p className="mt-1 text-xs text-muted">
            过去 {WEEKS} 周的发文密度
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-3">
            <div className="rounded-2xl bg-primary/5 px-3 py-2">
              <p className="font-mono text-xl font-bold leading-tight text-primary">
                {totalThisPeriod}
              </p>
              <p className="text-[11px] leading-tight text-muted">篇文章</p>
            </div>
            <div className="rounded-2xl bg-primary/5 px-3 py-2">
              <p className="font-mono text-xl font-bold leading-tight text-primary">
                {activeDays}
              </p>
              <p className="text-[11px] leading-tight text-muted">活跃天数</p>
            </div>
            <div className="rounded-2xl bg-primary/5 px-3 py-2">
              <p className="font-mono text-xl font-bold leading-tight text-primary">
                {peakDay.count}
              </p>
              <p className="text-[11px] leading-tight text-muted">单日峰值</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted">
            <span>少</span>
            <span className="h-3 w-3 rounded-sm bg-border/40" />
            <span className="h-3 w-3 rounded-sm bg-primary/30" />
            <span className="h-3 w-3 rounded-sm bg-primary/55" />
            <span className="h-3 w-3 rounded-sm bg-primary/75" />
            <span className="h-3 w-3 rounded-sm bg-primary" />
            <span>多</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="inline-flex flex-col gap-1.5">
            <div className="flex gap-1 pl-6">
              {monthLabels.map((label, i) => (
                <div key={i} className="relative h-3 w-3.5 sm:w-4">
                  {label ? (
                    <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] leading-none text-muted">
                      {label}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              <div className="flex flex-col gap-1 pr-1.5 text-[10px] leading-none text-muted">
                {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                  <div
                    key={row}
                    className="flex h-3.5 items-center justify-end sm:h-4"
                  >
                    {DAY_LABELS[row] ?? ""}
                  </div>
                ))}
              </div>

              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date} · ${day.count} 篇`}
                      className={`h-3.5 w-3.5 rounded-sm transition hover:scale-125 sm:h-4 sm:w-4 ${intensity(day.count)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
