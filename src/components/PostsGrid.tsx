"use client";

import { type ReactNode } from "react";
import { ColumnToggleButton, useColumnLayout } from "@/components/ColumnLayout";

export function PostsGrid({ children }: { children: ReactNode }) {
  const [twoCol, setLayout] = useColumnLayout("posts-two-col");

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <ColumnToggleButton twoCol={twoCol} onChange={setLayout} />
      </div>
      <div
        className={`grid gap-4 ${twoCol ? "sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {children}
      </div>
    </>
  );
}
