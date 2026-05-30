import { getMonthCalendar } from "@/lib/stats";
import { formatDateCN } from "@/lib/datetime";

const DAY_HEADER = ["日", "一", "二", "三", "四", "五", "六"];

export async function MiniCalendar() {
  const todayStr = formatDateCN(new Date());
  const [year, month] = todayStr.split("-").map(Number);
  const cal = await getMonthCalendar(year, month - 1);

  return (
    <div className="hv-card p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          {cal.year}_{String(cal.month + 1).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-muted-soft">{cal.totalPosts} posts</span>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-soft">
        {DAY_HEADER.map((d, i) => (
          <div key={d} className={i === 0 || i === 6 ? "py-0.5 text-accent/60" : "py-0.5"}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {cal.weeks.flat().map((cell) => {
          let cls = "grid aspect-square place-items-center rounded text-[11px] transition ";
          if (!cell.isInMonth) {
            cls += "text-muted-soft/20";
          } else if (cell.isToday) {
            cls += "bg-accent text-white font-bold";
          } else if (cell.hasPost) {
            cls += "bg-accent/15 text-accent font-medium";
          } else {
            cls += "text-muted hover:bg-card-hover";
          }
          return (
            <div key={cell.date} title={cell.date} className={cls}>
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
