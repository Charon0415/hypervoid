import { getPostHeatmap } from "@/lib/stats";

const WEEKS = 18;

function intensity(count: number): string {
  if (count <= 0) return "bg-border/30 dark:bg-border/40";
  if (count === 1) return "bg-primary/35";
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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            发文热力图
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            过去 {WEEKS} 周
          </p>
        </div>
        <div className="flex items-baseline gap-3 text-xs text-muted">
          <span>
            <span className="font-mono text-base font-semibold text-foreground">
              {totalThisPeriod}
            </span>{" "}
            篇
          </span>
          <span>·</span>
          <span>
            <span className="font-mono text-base font-semibold text-foreground">
              {activeDays}
            </span>{" "}
            活跃天
          </span>
          <span>·</span>
          <span>
            峰值{" "}
            <span className="font-mono text-base font-semibold text-foreground">
              {peakDay.count}
            </span>{" "}
            篇/天
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="inline-flex flex-col gap-1.5">
          <div className="flex gap-[3px] pl-[22px]">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="relative h-3 w-4 shrink-0 sm:w-[18px]"
              >
                {label ? (
                  <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium leading-none text-muted">
                    {label}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            <div className="flex shrink-0 flex-col gap-[3px] pr-1.5 text-[10px] leading-none text-muted/70">
              {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                <div
                  key={row}
                  className="flex h-4 items-center justify-end sm:h-[18px]"
                >
                  {DAY_LABELS[row] ?? ""}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date} · ${day.count} 篇`}
                    className={`h-4 w-4 rounded-[3px] transition-transform hover:scale-125 sm:h-[18px] sm:w-[18px] ${intensity(day.count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted">
        <span>少</span>
        <span className="h-2.5 w-2.5 rounded-sm bg-border/30 dark:bg-border/40" />
        <span className="h-2.5 w-2.5 rounded-sm bg-primary/35" />
        <span className="h-2.5 w-2.5 rounded-sm bg-primary/55" />
        <span className="h-2.5 w-2.5 rounded-sm bg-primary/75" />
        <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
        <span>多</span>
      </div>
    </section>
  );
}
