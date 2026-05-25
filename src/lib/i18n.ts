export const LOCALES = ["zh-CN", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh-CN";

export const LOCALE_LABEL: Record<Locale, string> = {
  "zh-CN": "中",
  en: "EN",
};

export type Messages = {
  nav: {
    home: string;
    posts: string;
    anime: string;
    games: string;
    books: string;
    movies: string;
    music: string;
    projects: string;
    skills: string;
    timeline: string;
    albums: string;
    diary: string;
    guestbook: string;
    friends: string;
    about: string;
    archive: string;
    groupCreate: string;
    groupLife: string;
    groupInteract: string;
    groupFeatured: string;
    groupLinks: string;
  };
  common: {
    search: string;
    searchPlaceholder: string;
    toggleTheme: string;
    toggleLocale: string;
    readAll: string;
    backToPosts: string;
    backHome: string;
    loading: string;
    empty: string;
    subscribe: string;
    submit: string;
    cancel: string;
    delete: string;
    save: string;
  };
  post: {
    views: string;
    like: string;
    unlike: string;
    comments: string;
    summary: string;
    askAi: string;
    askAiHint: string;
    askAiPlaceholder: string;
    aiThinking: string;
    aiAnswer: string;
  };
  home: {
    latest: string;
    seeAll: string;
  };
  subscribe: {
    title: string;
    description: string;
    success: string;
  };
};

export const MESSAGES: Record<Locale, Messages> = {
  "zh-CN": {
    nav: {
      home: "首页",
      posts: "文章",
      anime: "番剧",
      games: "游戏",
      books: "书籍",
      movies: "影视",
      music: "音乐",
      projects: "项目",
      skills: "技能",
      timeline: "时间线",
      albums: "相册",
      diary: "日记",
      guestbook: "留言",
      friends: "友链",
      about: "关于",
      archive: "归档",
      groupCreate: "创作",
      groupLife: "生活",
      groupInteract: "交互",
      groupFeatured: "精选",
      groupLinks: "链接",
    },
    common: {
      search: "搜索",
      searchPlaceholder: "搜索文章…",
      toggleTheme: "切换主题",
      toggleLocale: "切换语言",
      readAll: "全部",
      backToPosts: "← 返回文章列表",
      backHome: "← 首页",
      loading: "加载中…",
      empty: "还没有内容。",
      subscribe: "订阅",
      submit: "提交",
      cancel: "取消",
      delete: "删除",
      save: "保存",
    },
    post: {
      views: "次浏览",
      like: "点赞",
      unlike: "取消点赞",
      comments: "评论",
      summary: "AI 摘要",
      askAi: "问问 AI ✦",
      askAiHint:
        "Claude Haiku 会基于这篇文章的内容回答你的问题。回答仅供参考，可能与作者本人观点不同。",
      askAiPlaceholder:
        "比如：这套技术栈的成本怎样？为什么选 Postgres 而不是 SQLite？",
      aiThinking: "思考中…",
      aiAnswer: "AI 回答",
    },
    home: { latest: "最新文章", seeAll: "全部" },
    subscribe: {
      title: "订阅更新",
      description: "新文章发布时通过邮件通知你，不发别的。随时退订。",
      success: "✓ 验证邮件已发到你的邮箱，点击邮件里的确认链接即可。",
    },
  },
  en: {
    nav: {
      home: "Home",
      posts: "Posts",
      anime: "Anime",
      games: "Games",
      books: "Books",
      movies: "Films",
      music: "Music",
      projects: "Projects",
      skills: "Skills",
      timeline: "Timeline",
      albums: "Gallery",
      diary: "Diary",
      guestbook: "Guestbook",
      friends: "Friends",
      about: "About",
      archive: "Archive",
      groupCreate: "Create",
      groupLife: "Life",
      groupInteract: "Connect",
      groupFeatured: "Picks",
      groupLinks: "Links",
    },
    common: {
      search: "Search",
      searchPlaceholder: "Search posts…",
      toggleTheme: "Toggle theme",
      toggleLocale: "Switch language",
      readAll: "See all",
      backToPosts: "← Back to posts",
      backHome: "← Home",
      loading: "Loading…",
      empty: "Nothing here yet.",
      subscribe: "Subscribe",
      submit: "Submit",
      cancel: "Cancel",
      delete: "Delete",
      save: "Save",
    },
    post: {
      views: "views",
      like: "Like",
      unlike: "Unlike",
      comments: "Comments",
      summary: "AI summary",
      askAi: "Ask the AI ✦",
      askAiHint:
        "Claude Haiku will answer based on this post's content. Answers are for reference only and may differ from the author's view.",
      askAiPlaceholder:
        "e.g. What's the cost of this stack? Why Postgres over SQLite?",
      aiThinking: "Thinking…",
      aiAnswer: "AI answer",
    },
    home: { latest: "Latest posts", seeAll: "See all" },
    subscribe: {
      title: "Subscribe",
      description:
        "Get notified by email when a new post is published. Nothing else.",
      success: "✓ A confirmation email was sent. Click the link to confirm.",
    },
  },
};
