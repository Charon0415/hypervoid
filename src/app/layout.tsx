import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "remark-github-blockquote-alert/alert.css";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UmamiScript } from "@/components/UmamiScript";
import { Backdrop } from "@/components/Backdrop";
import { BannerStrip } from "@/components/BannerStrip";
import { BackToTop } from "@/components/BackToTop";
import { SettingsProvider } from "@/components/SettingsProvider";
import { siteConfig } from "@/lib/site-config";
import { getSiteOverride } from "@/lib/site-config-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const [description, authorName, authorUrl] = await Promise.all([
    getSiteOverride("description"),
    getSiteOverride("author.name"),
    getSiteOverride("author.githubUrl"),
  ]);
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s · ${siteConfig.name}`,
    },
    description,
    authors: [{ name: authorName, url: authorUrl }],
    creator: authorName,
    openGraph: {
      title: siteConfig.title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      type: "website",
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description,
    },
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": [
          { url: "/rss.xml", title: siteConfig.rss.title },
        ],
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://github.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://lain.bgm.tv" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.cloudflare.steamstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://media.steampowered.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          <Backdrop />
          <Providers>
            <SiteHeader />
            <BannerStrip />
            <main className="page-fade mx-auto w-full max-w-6xl flex-1 px-4 py-8">
              {children}
            </main>
            <SiteFooter />
          </Providers>
          <BackToTop />
        </SettingsProvider>
        <UmamiScript />
      </body>
    </html>
  );
}
