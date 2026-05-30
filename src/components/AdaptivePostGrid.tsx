import type { ReactNode } from "react";

export function AdaptivePostGrid({ children }: { children: ReactNode[] }) {
  if (children.length === 0) return null;

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child, i) => (
          <div
            key={i}
            className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
          >
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}
