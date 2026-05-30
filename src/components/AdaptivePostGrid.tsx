import type { ReactNode } from "react";

export function AdaptivePostGrid({ children }: { children: ReactNode[] }) {
  if (children.length === 0) return null;

  return (
    <section>
      <div className="grid gap-3 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}
