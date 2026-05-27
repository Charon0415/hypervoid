# 雷姆看板娘重制参考

这次重制严格使用项目内提供的 `public/mascot/rem/1.skel`、`1.atlas` 与 `1.png`，并通过 `SpineSkeletonDataConverter` 生成 `public/mascot/rem/1.json`。前台使用项目内 vendored 的官方 Spine `3.6` widget 渲染转换后的 JSON，不再维护手写 `.skel` 二进制 parser；`1.png` 只作为 texture atlas，不直接整图展示。

## 网络参考

- Re:Zero 官方角色页：`https://re-zero-anime.jp/tv/character/`
- Rem 角色资料页：`https://rezero.fandom.com/wiki/Rem`
- Princess Connect Re:Dive 角色/图库入口：`https://princess-connect.fandom.com/wiki/Princess_Connect!_Re:Dive`
- Princess Connect Re:Dive 角色图库示例：`https://princess-connect.fandom.com/wiki/Yuki/Gallery`

## 提炼到实现里的要点

- 雷姆识别特征：浅蓝短发、侧分刘海、白色女仆发箍、黑白女仆装、蓝色眼睛、温柔表情。
- 小人比例参考：大头、短身、短四肢、清晰外轮廓，动作以轻微浮动和挥手为主。
- 站点适配：保持透明背景、固定视口盒子和拖拽区域。渲染顺序、部件位置和动画都交给官方 Spine runtime；周围空白通过 `applySpineWidgetFocus` 调整相机视口裁切。
- 详细流程：见 `docs/mascot-spine36-workflow.md`。
