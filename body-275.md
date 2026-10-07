## v2.7.5 — 修复 markdown 链接 404（方括号进了路径）

「读取失败 HTTP 404: not found」的根因：agent 输出的链接是 markdown 格式 `[panel-shot-4.png](.capture/panel-shot-4.png)`，点击处理却把**显示文字**（连同方括号 `[panel-shot-4.png`）当成了路径去读——服务端自然 404。

修复：

- **优先按 markdown 链接解析**：点击 `[显示名](路径)` 时，打开的是**括号里的真实路径**（`.capture/panel-shot-4.png`）——正是文件所在
- 独立文件名的识别排除方括号装饰符，路径清理同步剥除 `[ ] * _` 等 markdown 字符
- 长按菜单里「打开文件」的目标同样修正
