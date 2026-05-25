export function VideoEmbed({
  src,
  title,
  aspect = "16/9",
}: {
  src: string;
  title?: string;
  aspect?: string;
}) {
  return (
    <div
      className="video-embed not-prose my-6 overflow-hidden rounded-xl border border-border bg-black"
      style={{ aspectRatio: aspect }}
    >
      <iframe
        src={src}
        title={title ?? "embedded video"}
        loading="lazy"
        allow="encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        className="block h-full w-full border-0"
      />
    </div>
  );
}
