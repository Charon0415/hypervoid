"use client";

import dynamic from "next/dynamic";

const PhotoSphereGL = dynamic(
  () => import("@/components/PhotoSphereGL").then((m) => m.PhotoSphereGL),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    ),
  },
);

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

export function PhotoSphereLoader({ photos }: { photos: Photo[] }) {
  return <PhotoSphereGL photos={photos} />;
}
