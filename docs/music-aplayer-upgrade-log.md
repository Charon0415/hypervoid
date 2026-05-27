# 音乐播放器与后台整理日志

日期：2026-05-27

## 背景

原先音乐页使用自研播放器，网易云曲目经常出现 `url: null`，导致前台无法获取曲库或无法播放。用户希望升级为 APlayer，并把音源改成后台可切换管理：已部署音源、LX、本地三类。

## 本次处理

1. 安装 `aplayer`，在根布局引入 `aplayer/dist/APlayer.min.css`。
2. 新增 `APlayerMusicPlayer` 客户端组件，负责实例化/销毁 APlayer，并隐藏没有播放地址的曲目。
3. 新增 `src/lib/music-sources.ts` 统一音源层：
   - `deployed`：沿用当前网易云/NCM 歌单和 `/api/music/stream`。
   - `lx`：读取后台配置的 JSON API URL，不执行第三方混淆脚本。
   - `local`：读取后台保存的本地 JSON 曲目。
4. `/api/music/playlist` 改为只返回当前后台选择的音源，避免前台知道多套逻辑。
5. `/admin/music` 增加音源模式选择、LX API URL、本地 JSON、当前音源测试，并保留已部署音源歌单管理。
6. `/admin` 首页按内容生产、互动运营、站点外观、工具系统、其他分组；支持在 `CUSTOM_ADMIN_NAV_GROUPS` 里追加自定义分类。
7. 清理旧的 `MusicPlayer.tsx` 完整页播放器和 About 页残留 TODO/过期 AI 描述。

## 维护约定

- APlayer 只负责 UI，不负责破解音源。
- `latest.js` 这类 LX 混淆脚本不进入生产代码；如果要用 LX，部署成可返回 JSON 的服务，再把 URL 填入后台。
- 本地音源适合稳定少量歌曲，音频文件可放在 `public/music/`，JSON 里写 `/music/xxx.mp3`。
- 首页小播放器仍使用全局 `PlayerProvider`，数据同样来自 `/api/music/playlist`。

## 验证项

- `pnpm lint`
- `pnpm build`
- 后台 `/admin/music` 测试当前音源
- 前台 `/music` APlayer 可见且只列出可播放曲目
