import type { Metadata } from "next";
import { PlaceholderBanner } from "@/components/PlaceholderBanner";

export const metadata: Metadata = { title: "项目" };

const SAMPLE = [
  {
    name: "Hypervoid",
    description: "你正在浏览的这个博客本身——Next.js 16 + MDX 全栈博客。",
    link: "https://github.com/HyperCharon/hypervoid",
    tags: ["Next.js", "TypeScript", "MDX"],
  },
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">项目</h1>
        <p className="mt-2 text-muted">
          公开发布的开源项目、个人作品与正在进行中的实验。
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {SAMPLE.map((project) => (
          <a
            key={project.name}
            href={project.link}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-md"
          >
            <h3 className="text-lg font-semibold group-hover:text-primary">
              {project.name}
            </h3>
            <p className="text-sm text-muted">{project.description}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
      <PlaceholderBanner hint="编辑 src/app/projects/page.tsx 把占位项目替换成你自己的项目。也可以考虑接 GitHub pinned repos API 自动同步。" />
    </div>
  );
}
