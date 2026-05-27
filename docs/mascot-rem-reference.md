# 雷姆看板娘重制参考

这次重制改为使用项目内提供的 Spine 三件套资源：`public/mascot/rem/1.skel`、`1.atlas`、`1.png`，前台通过 PixiJS + `@esotericsoftware/spine-pixi-v7` 渲染。

## 网络参考

- Re:Zero 官方角色页：`https://re-zero-anime.jp/tv/character/`
- Rem 角色资料页：`https://rezero.fandom.com/wiki/Rem`
- Princess Connect Re:Dive 角色/图库入口：`https://princess-connect.fandom.com/wiki/Princess_Connect!_Re:Dive`
- Princess Connect Re:Dive 角色图库示例：`https://princess-connect.fandom.com/wiki/Yuki/Gallery`

## 提炼到实现里的要点

- 雷姆识别特征：浅蓝短发、侧分刘海、白色女仆发箍、黑白女仆装、蓝色眼睛、温柔表情。
- 小人比例参考：大头、短身、短四肢、清晰外轮廓，动作以轻微浮动和挥手为主。
- 站点适配：保持透明背景、固定视口盒子和拖拽区域。`1.png` 只作为 Spine texture atlas 使用，不直接作为图片展示。
