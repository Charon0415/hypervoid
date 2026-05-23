import type { Metadata } from "next";

export const metadata: Metadata = { title: "关于我" };

export default function AboutPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert mx-auto max-w-3xl">
      <h1>关于</h1>
      <p>
        你好，我是 <strong>Charon</strong>。这里是 Hypervoid，我的个人博客。
      </p>
      <h2>这个博客</h2>
      <ul>
        <li>用 Next.js 16 + MDX 搭建</li>
        <li>部署在 Vercel</li>
        <li>源码在 GitHub: <a href="https://github.com/HyperCharon/hypervoid">HyperCharon/hypervoid</a></li>
      </ul>
      <h2>联系方式</h2>
      <ul>
        <li>GitHub: <a href="https://github.com/HyperCharon">@HyperCharon</a></li>
      </ul>
      <p className="text-muted">
        这是 v0.1 的占位关于页面，会随着博客成长继续完善。
      </p>
    </article>
  );
}
