import type { Metadata } from "next";
import { notFound, redirect as nextRedirect } from "next/navigation";
import { resolveAndHit } from "@/db/redirects";

export const metadata: Metadata = {
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ShortLink(props: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await props.params;
  const target = await resolveAndHit(code).catch(() => null);
  if (!target) notFound();
  nextRedirect(target);
}
