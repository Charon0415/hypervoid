export const siteConfig = {
  name: "Hypervoid",
  title: "Hypervoid · Charon 的博客",
  description: "分享技术、记录生活、收集兴趣。Charon 的个人博客。",
  url: "https://hypervoid.top",
  launchedAt: "2026-05-23",
  locale: "zh_CN",
  author: {
    name: "Charon",
    handle: "HyperCharon",
    bio: "The world is big, you have to go and see.",
    avatar: "https://github.com/HyperCharon.png",
    githubUsername: "HyperCharon",
    githubUrl: "https://github.com/HyperCharon",
  },
  socials: [
    { name: "GitHub", url: "https://github.com/HyperCharon", icon: "github" as const },
    { name: "Bilibili", url: "https://space.bilibili.com/405927049", icon: "bilibili" as const },
    { name: "Gitee", url: "https://gitee.com/charon0415", icon: "gitee" as const },
    { name: "Codeberg", url: "https://codeberg.org/Charon0415", icon: "codeberg" as const },
    { name: "Steam", url: "https://steamcommunity.com/id/Charon0415/", icon: "steam" as const },
  ],
  rss: {
    title: "Hypervoid",
    description: "Charon 的个人博客文章订阅",
  },
} as const;
