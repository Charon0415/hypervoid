import { ImageResponse } from "next/og";

export const alt = "Hypervoid — Charon's blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(circle at 30% 30%, #312e81 0%, #0c0a1a 60%, #050308 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "50%",
              background: "#818cf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: 800,
              color: "#0c0a1a",
            }}
          >
            H
          </div>
          <div
            style={{
              fontSize: "92px",
              fontWeight: 800,
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            HYPERVOID
          </div>
        </div>

        <div
          style={{
            fontSize: "40px",
            fontWeight: 500,
            color: "#c7d2fe",
            marginBottom: "20px",
          }}
        >
          Charon&apos;s personal blog
        </div>

        <div
          style={{
            fontSize: "26px",
            color: "#a1a1aa",
            letterSpacing: "2px",
          }}
        >
          notes · code · projects · life
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            fontSize: "20px",
            color: "#71717a",
            letterSpacing: "1px",
          }}
        >
          github.com/HyperCharon
        </div>
      </div>
    ),
    { ...size },
  );
}
