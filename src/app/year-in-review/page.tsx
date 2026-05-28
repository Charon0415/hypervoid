import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "年度回顾 — Hypervoid",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default function YearInReviewIndex() {
  const year = new Date().getFullYear();
  redirect(`/year-in-review/${year}`);
}
