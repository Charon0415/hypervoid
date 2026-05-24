import { getMonthCalendar } from "@/lib/stats";

const DAY_HEADER = ["日", "一", "二", "三", "四", "五", "六"];

export async function MiniCalendar() {
  const now = new Date();
  const cal = await getMonthCalendar(
    now.getUTCFullYear(),
    now.getUTCMonth(),
  );

  return (
    <aside className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-foreground/80">
          {cal.year} 年 {cal.month + 1} 月
        </h3>
        <span className="font-mono text-[11px] text-muted">
          {cal.totalPosts} 篇
        </span>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-muted">
        {DAY_HEADER.map((d, i) => (
          <div
            key={d}
            className={
              i === 0 || i === 6
                ? "py-0.5 text-primary/60"
                : "py-0.5"
            }
          >
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cal.weeks.flat().map((cell) => {
          let cls =
            "relative grid aspect-square place-items-center rounded-full text-[11px] font-mono transition";
          if (!cell.isInMonth) {
            cls += " text-muted/30";
          } else if (cell.isToday) {
            cls += " bg-primary text-primary-foreground font-bold shadow-sm";
          } else if (cell.hasPost) {
            cls += " bg-primary/15 text-primary font-semibold hover:bg-primary/25";
          } else {
            cls += " text-foreground/60";
          }
          return (
            <div key={cell.date} title={cell.date} className={cls}>
              {cell.day}
              {cell.hasPost && !cell.isToday ? (
                <span
                  aria-hidden
                  className="absolute bottom-0.5 h-0.5 w-0.5 rounded-full bg-primary"
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary/30" />
          发文
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary" />
          今天
        </span>
      </div>
    </aside>
  );
}
