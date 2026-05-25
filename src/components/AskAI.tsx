"use client";

import dynamic from "next/dynamic";

const AskAIImpl = dynamic(
  () => import("./AskAIImpl").then((m) => m.AskAIImpl),
  { ssr: false },
);

export function AskAI({ slug }: { slug: string }) {
  return <AskAIImpl slug={slug} />;
}
