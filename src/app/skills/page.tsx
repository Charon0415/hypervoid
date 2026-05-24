import type { Metadata } from "next";
import { PlaceholderBanner } from "@/components/PlaceholderBanner";

export const metadata: Metadata = { title: "技能" };

const SKILLS = [
  {
    group: "语言",
    items: ["TypeScript", "JavaScript", "Python"],
  },
  {
    group: "前端",
    items: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    group: "工具",
    items: ["Git", "Linux", "VS Code"],
  },
];

export default function SkillsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">技能</h1>
        <p className="mt-2 text-muted">技术栈与正在学习的方向。</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((group) => (
          <div
            key={group.group}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-lg font-semibold">{group.group}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-border px-2 py-1 text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <PlaceholderBanner hint="编辑 src/app/skills/page.tsx 更新你的技能树。" />
    </div>
  );
}
