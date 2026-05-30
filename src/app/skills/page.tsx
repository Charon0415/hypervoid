import type { Metadata } from "next";
import { SkillsBrowser } from "@/components/SkillsBrowser";
import { skillsData } from "@/lib/skills";

export const metadata: Metadata = {
  title: "技能",
  description: "技术栈与正在学习的方向。",
};

const CATEGORY_LABEL: Record<string, string> = {
  frontend: "前端",
  backend: "后端",
  database: "数据库",
  tools: "工具",
  other: "其他",
};

export default function SkillsPage() {
  const byCategory = new Map<string, number>();
  for (const s of skillsData) {
    byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + 1);
  }
  const summary = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="hv-panel relative overflow-hidden p-5 text-center sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <div aria-hidden className="absolute left-0 top-0 h-8 w-8 border-l border-t border-cyan-400/40" />
        <div aria-hidden className="absolute right-0 top-0 h-2 w-2 rounded-full bg-cyan-400/60 animate-pulse" />
        <p className="hv-kicker justify-center">Skills / Tech_Stack</p>
        <h1 className="hv-title mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
          正在学习的技术
        </h1>
        <p className="mt-3 text-sm text-cyan-50/68">技艺不精，欢迎讨论交流。</p>
        <p className="mt-4 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-cyan-50/58">
          <span>
            共 <span className="font-mono text-cyan-100">{skillsData.length}</span> 项
          </span>
          {summary.map(([cat, count]) => (
            <span key={cat}>
              · {CATEGORY_LABEL[cat] ?? cat}{" "}
              <span className="font-mono text-cyan-100">{count}</span>
            </span>
          ))}
        </p>
      </header>

      <SkillsBrowser skills={skillsData} />

      <p className="hv-panel border-dashed p-4 text-center text-xs text-cyan-50/68">
        想加 / 改 / 删？编辑{" "}
        <code className="border border-cyan-100/14 bg-white/[0.055] px-1.5 py-0.5 font-mono text-[11px] text-cyan-100">
          src/lib/skills.ts
        </code>{" "}
        即可。图标用{" "}
        <a
          href="https://icon-sets.iconify.design/"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-100 hover:underline"
        >
          Iconify
        </a>{" "}
        集合名（如 <code className="text-cyan-100">logos:typescript-icon</code>）。
      </p>
    </div>
  );
}
