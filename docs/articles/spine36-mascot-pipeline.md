---
title: 用 Spine 3.6.39 修复博客看板娘：从 skel 转 JSON 到视口裁剪
description: 记录一次把雷姆、拉姆 Spine 二进制资源接入 Next.js 博客的完整过程，包括转换器、官方 runtime、atlas 路径归一和模型空白裁剪。
tags: [Next.js, Spine, 看板娘, 前端]
category: 技术
---

这次看板娘修复一开始绕了弯路：资源是 Spine `3.6.39` 的 `.skel` 二进制文件，我先尝试手写解析 setup pose，再按 atlas 把部件绘制到 canvas。这个方向能看到一点结果，但骨骼、slot、attachment、权重、动画时间线这些细节很容易偏，最终表现就是“能显示，但骨架依然错位”。

后面把方向收回来：不要私自改二进制解析，尽量回到官方 runtime。关键问题只剩一个，官方 Spine 3.6 的 web runtime 更适合吃 JSON，而当前资源是 `.skel`。于是引入了 `wang606/SpineSkeletonDataConverter`，把 `.skel` 转成 `.json`，再交给官方 Spine 3.6 widget 渲染。

## 资源转换

本次使用的转换器来自：

```text
https://github.com/wang606/SpineSkeletonDataConverter
```

我把工具编译成 Linux 可执行文件后，执行了两次转换：

```bash
/tmp/ssc/SpineSkeletonDataConverter public/mascot/rem/1.skel public/mascot/rem/1.json
/tmp/ssc/SpineSkeletonDataConverter public/mascot/ram/ram.skel public/mascot/ram/ram.json
```

转换后再用官方 Spine 3.6 runtime 解析 JSON，确认两个模型都是 `3.6.39`，动画数量正常，并且 `24_idle` 存在。这样前端就不用猜二进制结构，也不用维护一套脆弱的私有 parser。

为了后续复用，转换器也被打包进资源库：

```text
public/resources/tools/spine-skeleton-data-converter-v3.7-hypervoid.zip
```

对应公开下载路径是：

```text
/resources/tools/spine-skeleton-data-converter-v3.7-hypervoid.zip
```

## 接入官方 Spine 3.6 runtime

前台现在加载的是项目内 vendored 的官方 3.6 widget：

```text
public/vendor/spine-3.6/spine-widget.js
```

组件里读取转换后的 JSON 和 atlas 文本，再把 atlas 第一行贴图名归一成 public URL。比如雷姆是 `/mascot/rem/1.png`，拉姆是 `/mascot/ram/ram.png`。

创建 widget 的核心配置很薄：

```ts
new spine.SpineWidget(host, {
  jsonContent,
  atlasContent: normalizeAtlasPage(atlasText),
  atlasPages: [pngUrl],
  animation,
  loop: true,
  fitToCanvas: true,
  alpha: true,
  backgroundColor: "#00000000",
  premultipliedAlpha: false,
});
```

这个阶段解决了“骨架错位”的根因：渲染顺序、骨骼变换和动画都交回给 Spine 自己处理。

## 为什么模型看起来很小

接入官方 runtime 后，拉姆可以显示，但角色很小。原因不在 DOM 尺寸，而在 Spine widget 默认的 `fitToCanvas`。

它会用 skeleton setup pose 的整体 bounds 适配 canvas，而这批模型的 bounds 周围有大量透明/空白区域。简单把外层框从 `240x300` 改到 `300x380`，只会把“角色 + 空白”一起放大，占屏更大但主体仍然不够理想。

最后的修复是裁剪相机，而不是继续放大外框。

新增的 helper 是：

```text
src/lib/spine-widget-focus.ts
```

它覆盖官方 widget 的 `resize()`，保留 WebGL canvas 的 DPR 适配，同时自己设置 `mvp.ortho2d`。这样可以把视野集中在角色主体上，周围空白自然减少。

当前雷姆和拉姆的参数是：

```ts
const REM_FOCUS = { centerX: 44, centerY: 198, width: 440, height: 550, padding: 1.02 };
const RAM_FOCUS = { centerX: -25, centerY: 165, width: 470, height: 590, padding: 1.02 };
```

调参时记住一条就够了：`width/height` 越小，角色越大；`centerX/centerY` 控制主体在框里的位置；`padding` 给动画边缘留保险。

## 后续新增角色怎么做

以后如果再加入同格式角色，流程已经固定：

1. 把 `.skel`、`.atlas`、`.png` 放到 `public/mascot/<character>/`。
2. 用转换器生成 `.json`。
3. 用官方 Spine 3.6 runtime 验证版本、动画和 atlas page。
4. 复制一个现有组件，替换 JSON、atlas、png 路径。
5. 在路由、后台看板娘设置、站点设置里注册角色 key。
6. 先确认能显示，再用 `applySpineWidgetFocus` 裁掉空白。
7. 角色切换不要刷新页面，写入 `hypervoid:mascot-char` 后派发 `hypervoid:mascot-character-changed` 事件即可。
8. 聊天历史按 `hypervoid:mascot-chat:<character>` 分开存，避免角色之间串对话。
9. 最后跑 `pnpm lint` 和 `pnpm build`。

这次最大的经验是：Spine 资源不要靠猜。格式版本、转换链路、官方 runtime、atlas 路径和相机视口要一层一层拆开验证。这样后面新增角色时，问题会落在明确的几个环节里，而不是在“骨架为什么又歪了”里反复试错。
