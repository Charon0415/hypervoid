import type { Metadata } from "next";

export const metadata: Metadata = { title: "项目" };

const SAMPLE = [
  {
    name: "Pluto",
    description: "你正在浏览的这个博客本身——Next.js 16 + MDX 全栈博客。",
    link: "https://github.com/Charon0415/Pluto",
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
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
