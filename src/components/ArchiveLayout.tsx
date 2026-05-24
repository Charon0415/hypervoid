"use client";

import { type ReactNode } from "react";
import { ColumnToggleButton, useColumnLayout } from "@/components/ColumnLayout";

export function ArchiveLayout({ children }: { children: ReactNode }) {
  const [twoCol, setLayout] = useColumnLayout("archive-two-col", false);

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <ColumnToggleButton twoCol={twoCol} onChange={setLayout} />
      </div>
      <div
        className={
          twoCol
            ? "grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2"
            : "flex flex-col gap-8"
        }
      >
        {children}
      </div>
    </>
  );
}
