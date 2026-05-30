import { getMonthCalendar } from "@/lib/stats";
import { formatDateCN } from "@/lib/datetime";

const DAY_HEADER = ["日", "一", "二", "三", "四", "五", "六"];

export async function MiniCalendar() {
  const todayStr = formatDateCN(new Date());
  const [year, month] = todayStr.split("-").map(Number);
  const cal = await getMonthCalendar(year, month - 1);

  return (
    <aside className="hv-panel-sci group relative overflow-hidden p-3">
      {/* Corner indicators */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-px w-12 bg-gradient-to-l from-cyan-400/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-12 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />

      <div className="flex items-baseline justify-between">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-100/80">
          {cal.year}_{String(cal.month + 1).padStart(2, '0')}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-cyan-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400/70">
            {cal.totalPosts} Posts
          </span>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-7 gap-1 text-center font-mono text-[9px] uppercase tracking-wider text-cyan-50/50">
        {DAY_HEADER.map((d, i) => (
          <div
            key={d}
            className={
              i === 0 || i === 6
                ? "py-0.5 text-cyan-400/60"
                : "py-0.5"
            }
          >
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1">
        {cal.weeks.flat().map((cell) => {
          let cls =
            "relative grid aspect-square place-items-center font-mono text-[11px] transition border";
          if (!cell.isInMonth) {
            cls += " border-transparent text-cyan-50/20";
          } else if (cell.isToday) {
            cls += " border-cyan-400 bg-cyan-400/20 text-cyan-100 font-bold shadow-[0_0_12px_rgba(103,232,249,0.3)]";
          } else if (cell.hasPost) {
            cls += " border-cyan-400/30 bg-cyan-950/40 text-cyan-200 font-semibold hover:border-cyan-400/50 hover:bg-cyan-900/40";
          } else {
            cls += " border-cyan-100/8 text-cyan-50/60 hover:border-cyan-100/20";
          }
          return (
            <div
              key={cell.date}
              title={cell.date}
              className={cls}
              style={{ clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)' }}
            >
              {cell.day}
              {cell.hasPost && !cell.isToday ? (
                <span
                  aria-hidden
                  className="absolute bottom-0.5 h-0.5 w-0.5 rounded-full bg-cyan-400"
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-cyan-100/8 pt-2 font-mono text-[9px] uppercase tracking-wider text-cyan-50/50">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 border border-cyan-400/40 bg-cyan-950/40" style={{ clipPath: 'polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 0 100%)' }} />
          Post
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 border border-cyan-400 bg-cyan-400/20" style={{ clipPath: 'polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 0 100%)' }} />
          Today
        </span>
      </div>
    </aside>
  );
}
