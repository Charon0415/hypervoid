# ACG 壁纸目录

把横向 16:9 或 21:9 高质量图扔进这个目录，然后到 `src/lib/site-config.ts` 的 `acgWallpapers` 数组里登记路径。

例：
```
public/wallpapers/01.jpg
public/wallpapers/02.jpg
```

```ts
acgWallpapers: ["/wallpapers/01.jpg", "/wallpapers/02.jpg"]
```

切到「ACG 轮播」背景后会每 9 秒淡入淡出循环。
