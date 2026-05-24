import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0f1a",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 140,
            height: 50,
            border: "3px solid #6366f1",
            borderRadius: 70,
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 140,
            height: 50,
            border: "3px solid #818cf8",
            borderRadius: 70,
            opacity: 0.55,
            transform: "rotate(60deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 140,
            height: 50,
            border: "3px solid #a5b4fc",
            borderRadius: 70,
            opacity: 0.35,
            transform: "rotate(-60deg)",
          }}
        />
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background:
              "radial-gradient(circle at 30% 30%, #ffffff, #818cf8 80%)",
            boxShadow: "0 0 24px rgba(129,140,248,0.7)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
