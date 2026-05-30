# Hypervoid 全站视觉重建方案

## 一、核心问题诊断

### 当前设计的矛盾

1. **色彩混乱** -- 同时使用 rose、amber、emerald、blue、violet、pink 六种主色，形成彩虹渐变边框，视觉噪音大，缺乏品牌辨识度
2. **风格不统一** -- 存在两套 header 样式（`hv-panel` 圆角 vs `clip-path` 切角），页面之间视觉语言断裂
3. **装饰过度** -- clip-path 切角、扫描线、脉冲圆点、毛玻璃、粒子场、故障文字同时堆叠，信息层级模糊
4. **赛博感停留在表面** -- monospace 大写标签（"Archive_Index / Public_Transmission"）是终端美学的符号化挪用，增加了阅读负担而非沉浸感
5. **组件膨胀** -- 112+ 组件中大量效果组件功能重叠（SpotlightCard vs BorderGlow vs GradientText）

### 学习目标

| 品牌 | 学什么 |
|------|--------|
| **Apple** | 大留白、单一强调色、超大字重标题、克制的动效、清晰的视觉层级 |
| **Linear** | 深色背景 + 单一 cyan accent、极简边框、subtle glow、流畅的页面过渡 |
| **Vercel** | 黑白为主、一个强调色贯穿全站、卡片无边框用阴影分层 |
| **Raycast** | 赛博朋克但干净、monospace 只用于代码/命令行、glow 效果节制 |
| **React Bits** | MagicBento、SpotlightCard、StaggerReveal 等交互效果作为点缀而非主体 |

---

## 二、新设计语言定义

### 2.1 色彩系统 -- "暗室霓虹"

**原则：黑白灰为骨架，单一 accent 为灵魂**

```
Dark Mode:
  --background:     #09090b     (zinc-950，纯正深灰，去掉蓝紫底色)
  --foreground:     #fafafa     (zinc-50)
  --card:           #18181b     (zinc-900)
  --card-hover:     #27272a     (zinc-800，用于 hover 状态)
  --muted:          #a1a1aa     (zinc-400)
  --muted-soft:     #52525b     (zinc-600，用于次要信息)
  --border:         #27272a     (zinc-800，实色边框代替半透明)
  --accent:         #06b6d4     (cyan-500，唯一的强调色)
  --accent-soft:    #22d3ee     (cyan-400，用于 hover/highlight)
  --accent-glow:    rgba(6, 182, 212, 0.15)  (cyan glow，极克制使用)

Light Mode:
  --background:     #fafafa
  --foreground:     #18181b
  --card:           #ffffff
  --card-hover:     #f4f4f5
  --muted:          #71717a
  --border:         #e4e4e7
  --accent:         #0891b2     (cyan-600)
  --accent-soft:    #06b6d4
  --accent-glow:    rgba(6, 182, 212, 0.08)
```

**去掉的东西：**
- 所有 rose-400、emerald-400、amber-400 的硬编码引用
- 彩虹渐变边框（`hv-rotate-border`）
- 半透明 violet border（`rgba(196, 181, 253, 0.14)`）

**保留的色彩功能：**
- 用户 hue 色相滑块 -- 改为从 cyan 基调偏移，而非从 blue
- 数据库自定义主题 -- 保留，但默认值用新色板
- 标签/分类的颜色区分 -- 改为 cyan 的不同明度 + 少量辅助色（仅用于功能性区分，如 draft=amber, published=emerald）

### 2.2 排版系统

```
标题层级：
  H1 (页面标题):  text-4xl sm:text-5xl  font-bold  tracking-tight
  H2 (区块标题):  text-2xl sm:text-3xl  font-semibold
  H3 (子标题):    text-xl  font-semibold
  Body:           text-[17.5px] leading-relaxed
  Small/Meta:     text-sm   text-muted
  Mono (仅代码):  font-mono text-sm

去掉的排版习惯：
  - hv-kicker（大写 monospace 分类标签）-- 用更自然的小写标签代替
  - hv-title 的全大写 tracking-tight -- 改为正常大小写
  - "Archive_Index / Public_Transmission" 这类命名 -- 用自然语言
```

### 2.3 间距与布局

```
页面容器：max-w-6xl mx-auto px-4 sm:px-6 lg:px-8（从 88rem 收窄到 72rem）
卡片间距：gap-4 sm:gap-6
区块间距：space-y-10 sm:space-y-16
侧边栏宽度：从 17rem 收到 16rem
留白比例：比现在多 30-50%
```

### 2.4 边框与阴影

```
卡片：
  - 无边框，用 bg-card + shadow-sm 分层
  - hover: shadow-md + bg-card-hover
  - 圆角统一为 rounded-xl（去掉 clip-path 切角）

面板/区块：
  - border border-border（实色，不透明）
  - rounded-2xl

分隔：
  - 用空间距离分隔，少用线条
  - 必要时用 border-b border-border
```

**去掉的装饰：**
- `clip-path: polygon(...)` 切角 -- 全部改为 rounded-xl
- 角落方括号装饰（`hv-panel` 的四角线）
- 脉冲圆点指示器
- 半透明渐变边框

### 2.5 动效策略

**保留但精简：**
| 效果 | 保留? | 调整 |
|------|-------|------|
| StaggerReveal | 保留 | 用在文章列表、项目网格 |
| SpotlightCard | 保留 | 改为更 subtle 的 glow，仅 accent 色 |
| MagneticButton | 保留 | 仅用于 Hero CTA |
| View Transitions | 保留 | 不变 |
| ScrollProgress | 保留 | 改为纯 accent 色，去掉彩虹 |
| pageFade | 保留 | 不变 |
| CountUp | 保留 | 用在统计数字 |

**去掉：**
| 效果 | 原因 |
|------|------|
| GlitchText | 赛博符号化，增加视觉噪音 |
| AuroraBackground | 与新简洁风格冲突 |
| NoiseOverlay | 去掉颗粒感，保持干净 |
| ClickEffect | 分散注意力 |
| SparkleEffect | 同上 |
| Rainbow border rotation | 过于花哨 |
| HeroSection 粒子场 | 用更简洁的 Hero 代替 |
| 扫描线效果 | 赛博符号化 |
| 脉冲圆点 | 同上 |

**新增（从 React Bits / Apple 学习）：**
- **Smooth scroll-linked animations** -- 滚动时元素平滑淡入，代替 StaggerReveal 的突兀感
- **Parallax depth** -- Hero 区域轻微视差，增加空间感
- **Card hover lift** -- translateY(-2px) + shadow 增强，Apple 风格
- **Page section reveal** -- 区块进入视口时平滑上移淡入

---

## 三、页面重建方案

### 3.1 首页 (`/`)

**当前问题：** 信息密度过高，Hero 太重（粒子+聚光灯+故障文字+磁力按钮+跑马灯），侧边栏堆叠 9 个 widget。

**新方案：**

```
┌─────────────────────────────────────────────────┐
│                   HEADER                         │
│   logo    首页  文章  项目  关于    [搜索] [主题]  │
├─────────────────────────────────────────────────┤
│                                                   │
│              Hero 区域（精简版）                    │
│                                                   │
│   "Hypervoid"          ← 大字，无动画，纯文字      │
│   一句话描述             ← muted 色               │
│   [阅读文章] [关于我]    ← 两个简洁按钮            │
│                                                   │
├─────────────────────────────────────────────────┤
│                                                   │
│   最新文章                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│   │  PostCard │ │ PostCard │ │ PostCard │         │
│   └──────────┘ └──────────┘ └──────────┘         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│   │  PostCard │ │ PostCard │ │ PostCard │         │
│   └──────────┘ └──────────┘ └──────────┘         │
│   [查看全部文章 →]                                 │
│                                                   │
├─────────────────────────────────────────────────┤
│                                                   │
│   主题系列（TopicCollections 精简版）               │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│   │    │ │    │ │    │ │    │                     │
│   └────┘ └────┘ └────┘ └────┘                    │
│                                                   │
├─────────────────────────────────────────────────┤
│                                                   │
│   站点统计（单行，横向排列）                        │
│   文章: 128  总阅读: 45k  运行: 365天              │
│                                                   │
├─────────────────────────────────────────────────┤
│                   FOOTER                          │
└─────────────────────────────────────────────────┘
```

**具体改动：**
- HeroSection: 去掉粒子场、聚光灯、故障文字、磁力按钮。改为大字标题 + 副标题 + 两个按钮，背景用一个极淡的 radial gradient（accent 色，opacity 0.03）
- 去掉 DailyPick（信息冗余）
- TopicCollections 保留但简化卡片样式
- 去掉 PostActivityHeatmap（数据展示过重，移到关于页面）
- 文章列表改为 3 列网格（lg:grid-cols-3），卡片无边框、有 hover lift
- 侧边栏移到关于页面或完全去掉，首页保持单栏

### 3.2 文章列表 (`/posts`)

```
┌─────────────────────────────────────────┐
│  文章                                    │
│  共 128 篇文章                           │
│                                         │
│  [全部] [技术] [生活] [笔记]  [搜索...]   │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ 置顶文章（Featured，大卡片）         ││
│  │ 封面图 + 标题 + 摘要 + 元信息       ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ PostCard │ │ PostCard │ │ PostCard ││
│  └──────────┘ └──────────┘ └──────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ PostCard │ │ PostCard │ │ PostCard ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│  [加载更多]                              │
└─────────────────────────────────────────┘
```

**改动：**
- Header: 去掉 clip-path 和 kicker，改为简洁的标题 + 计数
- PostCard: 去掉 SpotlightCard 光效，改为 hover lift（translateY + shadow）
- 保留 1/2 列切换
- 分类筛选改为 tab 式横向按钮组

### 3.3 文章详情 (`/posts/[slug]`)

**改动最小的页面，因为阅读体验本身就是好的。**

- 文章头部：去掉 hv-panel，改为纯文字标题 + 元信息行
- 目录侧边栏：保留，去掉装饰边框
- prose 样式：保持，微调 accent 色到 cyan
- 评论区：保留 Giscus
- 反应栏：保留，简化样式

### 3.4 关于页面 (`/about`)

- 改为 Apple 风格的大图 + 文字布局
- 顶部一个全宽的个人介绍区（大字 + 头像）
- 下面是技能/技术栈展示（可用标签云样式）
- 联系方式用简洁的 icon + 链接列表

### 3.5 其他页面

| 页面 | 改动重点 |
|------|---------|
| `/projects` | 卡片改为 Apple 风格的产品展示卡，大图 + 标题 + 简介 |
| `/friends` | 头像网格，去掉 hv-card 边框，hover 时名字出现 |
| `/guestbook` | 保留功能，简化消息卡片样式 |
| `/tags` | 标签云改为更干净的 pill 列表，去掉 clip-path |
| `/series` | 保留封面图卡片，去掉扫描线效果 |
| `/search` | 保留功能，搜索结果卡片简化 |
| `/archive` | 时间线改为简洁的列表布局 |
| `/donate` | 保留，简化样式 |
| `/bookmarks` | 保留，简化 |
| `/timeline` | 保留，去掉过度装饰 |

### 3.6 Admin 页面

**原则：Admin 是工作界面，效率优先，保持简洁但不需要品牌风格。**

- 保留当前布局结构（grid 导航 + 独立页面）
- 统一使用新的色板
- 去掉 clip-path 切角
- 保留所有功能不变

---

## 四、组件重建计划

### 4.1 需要重写的组件

| 组件 | 改动 |
|------|------|
| `SiteHeader` | 简化：去掉 HeaderDock 的放大效果，保留图标栏；导航改为简洁的文字链接 + dropdown |
| `SiteFooter` | 简化：去掉 monospace 标签，保留链接和版权 |
| `HeroSection` | 完全重写：去掉粒子、聚光灯、故障文字，改为大字 + 按钮的 Apple 风格 Hero |
| `PostCard` | 重写样式：去掉 SpotlightCard 包装，改为 hover lift + shadow |
| `FeaturedPostCard` | 重写：去掉彩虹旋转边框，改为大图 + accent 色标签 |
| `ScrollProgress` | 改为纯 accent 色条 |
| `StaggerReveal` | 保留逻辑，调整动画参数（更平滑） |
| `StatsCarousel` | 改为简洁的数字展示 |
| `TopicCollections` | 简化卡片样式 |

### 4.2 需要删除的组件

| 组件 | 原因 |
|------|------|
| `GlitchText` | 赛博符号化 |
| `AuroraBackground` | 与新风格冲突 |
| `NoiseOverlay` | 去掉颗粒感 |
| `ClickEffect` | 分散注意力 |
| `SparkleEffect` | 同上 |
| `BorderGlow` | 过度装饰 |
| `WaveDivider` | 不符合新风格 |
| `MagneticButton` | 保留功能但去掉磁力效果，改为普通 hover |

### 4.3 CSS 类名系统重建

```
去掉的类：
  hv-panel（带装饰的面板）
  hv-panel-sci
  hv-kicker
  hv-title
  hv-chip-sci
  hv-action

新的类：
  .hv-container     → max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
  .hv-section        → space-y-6 (区块间距)
  .hv-card           → bg-card rounded-xl border border-border hover:shadow-md transition
  .hv-card-featured  → 大尺寸卡片变体
  .hv-heading        → text-4xl sm:text-5xl font-bold tracking-tight
  .hv-subheading     → text-xl text-muted
  .hv-badge          → inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
  .hv-btn            → rounded-lg px-4 py-2 font-medium transition
  .hv-btn-accent     → bg-accent text-white hover:bg-accent-soft
  .hv-btn-ghost      → hover:bg-card-hover
  .hv-link           → text-accent hover:text-accent-soft underline-offset-4
  .hv-divider        → border-b border-border
```

---

## 五、实施计划

### Phase 1: 基础层 ✅
1. ✅ 重写 `globals.css` -- 新色板、新 CSS 变量、新工具类
2. ✅ 更新 `tailwind` 主题配置（通过 CSS `@theme inline`）
3. ✅ 重写 `SiteHeader` -- 简洁导航
4. ✅ 重写 `SiteFooter` -- 简洁页脚
5. ✅ 更新 `layout.tsx` -- 去掉 AuroraBackground、NoiseOverlay

### Phase 2: 核心组件 ✅
6. ✅ 重写 `PostCard` + `FeaturedPostCard`
7. ✅ 重写 `HeroSection`
8. ✅ 更新 `ScrollProgress`
9. ✅ 更新 `SettingsProvider` -- 默认色相改为 187 (cyan)
10. ✅ 更新 `CustomThemeShared` -- 添加 accent 主题键

### Phase 3: 页面更新 ✅
11. ✅ 首页重写
12. ✅ 文章列表页更新
13. ✅ 文章详情页微调
14. ✅ 关于页面重写
15. ✅ 其他页面逐一更新

### Phase 4: Admin ✅
16. ✅ Admin 页面统一新色板
17. ✅ Admin 主题编辑器更新

### Phase 5: 细节打磨
18. 响应式测试
19. 深色/浅色模式测试
20. 动效调优
21. 性能检查（去掉的组件是否影响功能）

---

## 六、不动的东西

- 所有数据获取逻辑（API、数据库查询、ISR 配置）
- 所有功能组件（评论、搜索、订阅、认证、设置面板）
- MDX 渲染链（remark/rehype 插件）
- i18n 系统
- PWA 配置
- Service Worker
- 分析脚本（Umami）
- 数据库 schema
- Admin 功能逻辑
- 用户设置系统（hue、font、background、display mode）-- 只改默认值
