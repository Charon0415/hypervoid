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
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">
          Skills · 技能
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          正在学习的技术
        </h1>
        <p className="mt-3 text-sm text-muted">技艺不精，欢迎讨论交流。</p>
        <p className="mt-4 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>
            共 <span className="font-mono text-foreground">{skillsData.length}</span> 项
          </span>
          {summary.map(([cat, count]) => (
            <span key={cat}>
              · {CATEGORY_LABEL[cat] ?? cat}{" "}
              <span className="font-mono text-foreground">{count}</span>
            </span>
          ))}
        </p>
      </header>

      <SkillsBrowser skills={skillsData} />

      <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted">
        想加 / 改 / 删？编辑{" "}
        <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[11px]">
          src/lib/skills.ts
        </code>{" "}
        即可。图标用{" "}
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
