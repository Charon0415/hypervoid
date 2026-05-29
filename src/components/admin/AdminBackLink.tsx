import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="hv-action w-fit px-3 py-1 text-xs font-medium">
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Link>
  );
}
