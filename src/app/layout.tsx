import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "remark-github-blockquote-alert/alert.css";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UmamiScript } from "@/components/UmamiScript";
import { AnnouncementWrapper } from "@/components/AnnouncementWrapper";
import { Backdrop } from "@/components/Backdrop";
import { BannerStrip } from "@/components/BannerStrip";
import { SettingsProvider } from "@/components/SettingsProvider";
import { siteConfig } from "@/lib/site-config";
import { CommandPaletteHost } from "@/components/CommandPaletteHost";
import { CustomThemeStyles, CustomWallpaper } from "@/components/CustomThemeStyles";
import { DeferredClientUI } from "@/components/DeferredClientUI";
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
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const [description, authorName, authorUrl, title, siteName] = await Promise.all([
    getSiteOverride("description"),
    getSiteOverride("author.name"),
    getSiteOverride("author.githubUrl"),
    getSiteOverride("title"),
    getSiteOverride("name"),
  ]);
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s · ${siteName}`,
    },
    description,
    authors: [{ name: authorName, url: authorUrl }],
    creator: authorName,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName,
      type: "website",
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
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
        <link rel="webmention" href="/api/webmention" />
        <CustomThemeStyles />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none"
        >
          跳到内容
        </a>
        <SettingsProvider>
          <Backdrop />
          <CustomWallpaper />
          <Providers>
            <AnnouncementWrapper />
            <SiteHeader />
            <BannerStrip />
            <main id="main-content" tabIndex={-1} className="page-fade mx-auto w-full max-w-6xl flex-1 px-4 py-8">
              {children}
            </main>
            <SiteFooter />
          </Providers>
        </SettingsProvider>
        <UmamiScript />
        <CommandPaletteHost />
        <DeferredClientUI />
      </body>
    </html>
  );
}
