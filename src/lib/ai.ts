import "server-only";

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and Vercel env vars.",
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const MODEL = "claude-haiku-4-5";

export async function summarizePost(args: {
  title: string;
  content: string;
}): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system:
      "你是一位简明的中文博客文章摘要助手。给定一篇文章，用 2-3 句话提炼核心观点。直接陈述要点，不要用「本文」「文章」「作者」之类的字眼开头。语气与原文保持一致——技术文偏冷峻，随笔可以稍随性。",
    messages: [
      {
        role: "user",
        content: `标题：${args.title}\n\n正文：\n${args.content}\n\n请生成 2-3 句中文摘要：`,
      },
    ],
  });

  for (const block of response.content) {
    if (block.type === "text") {
      return block.text.trim();
    }
  }
  throw new Error("AI 没有返回文本内容");
}

export async function streamAnswer(args: {
  title: string;
  content: string;
  question: string;
}) {
  const client = getClient();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: `你是一位友好的博客文章 AI 助手。基于下面这篇文章回答读者的问题。

规则：
- 如果问题与文章相关，根据文章内容简明回答，可引用关键片段
- 如果问题超出文章范围，礼貌指出，并说明你能基于通用知识给出参考但不代表作者本人观点
- 用中文回答，控制在 2-4 段
- 不要编造文章里没有的事实

文章标题：${args.title}

文章正文：
${args.content}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: args.question }],
  });
}
