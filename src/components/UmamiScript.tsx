import Script from "next/script";

export function UmamiScript() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  const scriptUrl =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim() ||
    "https://cloud.umami.is/script.js";

  if (!websiteId) return null;

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
      defer
    />
  );
}
