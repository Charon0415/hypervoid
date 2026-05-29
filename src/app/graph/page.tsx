import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";
import { getKnowledgeGraph } from "@/lib/posts";
import { getViewer } from "@/lib/viewer";
import { KnowledgeGraphCanvas } from "@/components/KnowledgeGraphCanvas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "知识图谱",
  description: "文章之间的互相引用关系",
};

export default async function GraphPage() {
  const viewer = await getViewer();
  const { graph, orphanCount } = await getKnowledgeGraph({
    isAdmin: viewer.isAdmin,
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="hv-panel relative overflow-hidden p-5 text-center sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <p className="hv-kicker justify-center">Knowledge graph / linked archive</p>
        <h1 className="hv-title mt-2 flex items-center justify-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
          <Network className="h-8 w-8 text-cyan-100/70 sm:h-10 sm:w-10" aria-hidden />
          知识图谱
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="hv-chip hv-chip-strong">{graph.nodes.length} nodes</span>
          <span className="hv-chip">{graph.edges.length} edges</span>
          {orphanCount > 0 ? <span className="hv-chip">{orphanCount} hidden orphans</span> : null}
        </div>
      </header>

      <KnowledgeGraphCanvas nodes={graph.nodes} edges={graph.edges} />

      <p className="hv-panel border-dashed p-4 text-center text-xs text-cyan-50/58">
        点击节点跳转到文章。链接通过文章正文里的 <code>/posts/&lt;slug&gt;</code> 或 <code>[[slug]]</code> 自动识别。
      </p>

      <nav className="flex flex-wrap justify-center gap-3 border-t border-cyan-100/12 pt-4 text-xs">
        <Link href="/posts" className="hv-action min-h-8 px-3">
          全部文章 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <Link href="/tags" className="hv-action min-h-8 px-3">
          标签 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </nav>
    </div>
  );
}
