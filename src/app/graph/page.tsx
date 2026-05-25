import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="mx-auto flex max-w-5xl flex-col gap-6 py-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">知识图谱</h1>
        <p className="mt-2 text-sm text-muted">
          {graph.nodes.length} 篇文章互相引用 · {graph.edges.length} 条边
          {orphanCount > 0 ? (
            <span className="ml-2 text-xs">
              （另有 {orphanCount} 篇孤立文章未显示）
            </span>
          ) : null}
        </p>
      </header>

      <KnowledgeGraphCanvas nodes={graph.nodes} edges={graph.edges} />

      <p className="text-center text-xs text-muted">
        点击节点跳转到文章。链接通过文章正文里的{" "}
        <code>/posts/&lt;slug&gt;</code> 或 <code>[[slug]]</code> 自动识别。
      </p>

      <nav className="flex justify-center gap-4 border-t border-border pt-4 text-xs text-muted">
        <Link href="/" className="hover:text-primary">
          首页
        </Link>
        <Link href="/posts" className="hover:text-primary">
          全部文章
        </Link>
        <Link href="/tags" className="hover:text-primary">
          标签
        </Link>
      </nav>
    </div>
  );
}
