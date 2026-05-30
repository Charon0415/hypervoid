import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const alt = "Hypervoid article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function pickTitleSize(title: string): number {
  const len = title.length;
  if (len <= 18) return 88;
  if (len <= 30) return 72;
  if (len <= 50) return 56;
  return 44;
}

type Params = { slug: string };

export default async function PostOgImage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.frontmatter.title ?? "Hypervoid";
  const date = post?.frontmatter.date ?? "";
  const tags = (post?.frontmatter.tags ?? []).slice(0, 3);
  const readingMinutes = post?.frontmatter.readingMinutes ?? 0;
  const isPrivate = post?.frontmatter.visibility === "private";
  const titleSize = pickTitleSize(title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(circle at 22% 28%, #312e81 0%, #0c0a1a 55%, #050308 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#0b0f1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "40px",
                height: "14px",
                border: "2px solid #6366f1",
                borderRadius: "20px",
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "40px",
                height: "14px",
                border: "2px solid #818cf8",
                borderRadius: "20px",
                opacity: 0.55,
                transform: "rotate(60deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "40px",
                height: "14px",
                border: "2px solid #a5b4fc",
                borderRadius: "20px",
                opacity: 0.35,
                transform: "rotate(-60deg)",
              }}
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "5px",
                background:
                  "radial-gradient(circle at 30% 30%, #ffffff, #818cf8 80%)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            Hypervoid
            <span
              style={{
                fontSize: "24px",
                fontWeight: 400,
                color: "#8b88c1",
                letterSpacing: "1px",
              }}
            >
              · 高维空间
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {isPrivate ? (
            <div
              style={{
                fontSize: "20px",
                color: "#fbbf24",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              🔒 Private
            </div>
          ) : null}
          <div
            style={{
              fontSize: `${titleSize}px`,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-2px",
              color: "white",
              maxWidth: "1040px",
            }}
          >
            {title}
          </div>
          {tags.length || date || readingMinutes ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                fontSize: "22px",
                color: "#a5b4fc",
              }}
            >
              {date ? <span>📅 {date}</span> : null}
              {readingMinutes ? (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>⏱ {readingMinutes} min read</span>
                </>
              ) : null}
              {tags.length ? (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ display: "flex", gap: "10px" }}>
                    {tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: "4px 14px",
                          borderRadius: "999px",
                          border: "1px solid rgba(165,180,252,0.4)",
                          background: "rgba(99,102,241,0.15)",
                          fontSize: "20px",
                          color: "#c7d2fe",
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "20px",
            color: "#71717a",
            letterSpacing: "1px",
          }}
        >
          <span>{siteConfig.url.replace(/^https?:\/\//, "")}</span>
          <span>@{siteConfig.author.handle}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
