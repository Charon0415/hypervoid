import type { Metadata } from "next";
import { SkillsBrowser } from "@/components/SkillsBrowser";
import { skillsData, type Skill } from "@/lib/skills";

export const metadata: Metadata = {
  title: "技能",
  description: "技术栈与正在学习的方向——按分类、等级、经验排列。",
};

function summarize(skills: Skill[]) {
  const byCat: Record<string, number> = {};
  let totalMonths = 0;
  let expertCount = 0;
  for (const s of skills) {
    byCat[s.category] = (byCat[s.category] ?? 0) + 1;
    totalMonths += s.experience.years * 12 + s.experience.months;
    if (s.level === "expert" || s.level === "advanced") expertCount++;
  }
  return { byCat, totalMonths, expertCount, total: skills.length };
}

export default function SkillsPage() {
  const summary = summarize(skillsData);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-primary">
          ✦ Skills · 技能
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          手上的工具箱
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          这里列的不只是"用过"，而是写过项目、解决过具体问题的技术。
          点筛选条可以按分类、等级、经验排序。
        </p>
      </header>

      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Stat label="技能总数" value={summary.total} />
        <Stat
          label="进阶以上"
          value={summary.expertCount}
          accent="text-primary"
        />
        <Stat
          label="累计月数"
          value={summary.totalMonths}
          suffix="月"
        />
        <Stat
          label="主要分类"
          value={Object.keys(summary.byCat).length}
        />
      </section>

      <SkillsBrowser skills={skillsData} />

      <p className="rounded-xl border border-dashed border-border p-4 text-xs text-muted">
        想加 / 改 / 删？编辑{" "}
        <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[11px]">
          src/lib/skills.ts
        </code>{" "}
        即可——重新构建后自动生效。图标用{" "}
        <a
          href="https://icon-sets.iconify.design/"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          Iconify
        </a>{" "}
        集合名（如 <code>logos:typescript-icon</code>）。
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-2xl font-bold leading-tight sm:text-3xl ${accent ?? ""}`}
      >
        {value.toLocaleString("en-US")}
        {suffix ? (
          <span className="ml-1 text-base font-normal text-muted">
            {suffix}
          </span>
        ) : null}
      </p>
    </div>
  );
}
