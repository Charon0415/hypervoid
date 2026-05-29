"use client";

export function SignInVisual() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-black" aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      >
        <source src="/sign-in/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_44%,transparent_0%,rgba(0,0,0,.20)_38%,rgba(0,0,0,.92)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.78)_0%,rgba(0,0,0,.16)_48%,rgba(0,0,0,.72)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
    </div>
  );
}
