## v2.8.1 — 文件读取接口参数精确对齐（按你的错误信息修正）

你发回的错误信息给出了两个接口的**精确参数要求**：

- `workspaceFiles/read`（文本行）：**`range` 必填**（行窗口 offset/limit）——之前漏发导致 strict 校验拒绝
- `workspaceFiles/readBytes`（字节）：参数名是 **`options`**，且**不接受** `workspaceFileScope` / `range`——之前多发/错发导致拒绝

两个接口的参数现已按 strict 校验逐字段对齐；废弃的 `readAll` 调用全部移除（该端点在 Host 端不存在）。

**这次和之前不同**：错误信息里 Host 直接告诉了每个接口「缺什么字段/多了什么字段」——按它说的改，不再有猜测空间。如果还有失败，新的错误信息会同样精确地指出剩余问题。
