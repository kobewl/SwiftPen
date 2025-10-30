# 开发指南

## 🛠️ 开发环境设置

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Obsidian (用于测试)
- 代码编辑器（推荐 VS Code）

### 初始化项目

```bash
# 克隆仓库
git clone https://github.com/yourusername/SwiftPen.git
cd SwiftPen

# 安装依赖
npm install

# 开发模式（自动重新编译）
npm run dev
```

## 📁 项目结构

```
SwiftPen/
├── src/                        # 源代码目录
│   ├── main.ts                # 插件主类（入口）
│   ├── settings.ts            # 设置页面和配置管理
│   ├── openai-service.ts      # OpenAI API 服务
│   ├── context-extractor.ts   # 上下文提取逻辑
│   └── input-modal.ts         # 用户输入对话框
├── main.ts                     # 导出入口
├── manifest.json              # Obsidian 插件清单
├── package.json               # npm 配置
├── tsconfig.json              # TypeScript 配置
├── esbuild.config.mjs         # 构建配置
├── version-bump.mjs           # 版本更新脚本
├── versions.json              # 版本历史
├── .gitignore                 # Git 忽略文件
├── .npmrc                     # npm 配置
├── README.md                  # 项目介绍
├── QUICKSTART.md              # 快速开始指南
├── DEVELOPMENT.md             # 开发指南（本文件）
├── CHANGELOG.md               # 更新日志
└── LICENSE                    # 许可证
```

## 🔧 核心模块说明

### 1. main.ts - 插件主类

**职责**：
- 插件生命周期管理（加载、卸载）
- 命令注册（快速写作、取消生成）
- 设置加载和保存
- 协调各个模块的工作

**关键方法**：
- `onload()` - 插件加载时初始化
- `handleQuickWrite()` - 处理快速写作命令
- `generateContent()` - 生成内容的主流程
- `cancelGeneration()` - 取消生成

### 2. settings.ts - 设置管理

**职责**：
- 定义设置接口和默认值
- 创建设置页面 UI
- 处理设置的读取和保存

**设置项**：
```typescript
interface SwiftPenSettings {
  apiKey: string;           // OpenAI API Key
  model: string;            // 模型名称
  maxTokens: number;        // 最大生成长度
  temperature: number;      // 创造性 (0-2)
  contextBefore: number;    // 光标前上下文字符数
  contextAfter: number;     // 光标后上下文字符数
  systemPrompt: string;     // 系统提示词
  baseURL: string;          // API Base URL
}
```

### 3. openai-service.ts - OpenAI API 服务

**职责**：
- 管理 OpenAI 客户端
- 流式生成内容
- 错误处理和重试
- 取消请求

**关键方法**：
- `streamCompletion()` - 流式生成（异步生成器）
- `cancel()` - 取消当前请求
- `updateSettings()` - 更新配置

**特性**：
- ✅ 流式响应（SSE）
- ✅ 指数退避重试
- ✅ 速率限制处理
- ✅ 请求取消支持

### 4. context-extractor.ts - 上下文提取

**职责**：
- 从编辑器提取上下文
- 智能截断文本
- 保持 Markdown 结构完整性

**关键方法**：
- `extract()` - 提取上下文
- `smartTruncateBefore()` - 智能截断光标前文本
- `smartTruncateAfter()` - 智能截断光标后文本
- `formatForDisplay()` - 格式化显示

**截断策略**：
1. 优先在段落边界（`\n\n`）截断
2. 其次在行边界（`\n`）截断
3. 最后在句子边界（`. ` `。` 等）截断
4. 无合适边界则直接截断

### 5. input-modal.ts - 输入对话框

**职责**：
- 显示用户输入对话框
- 展示上下文预览
- 收集用户需求
- 处理键盘事件

**UI 组件**：
- 标题
- 上下文预览区域
- 输入框
- 按钮（提交、取消）

**交互**：
- `Enter` - 提交
- `Esc` - 取消
- 自动聚焦输入框

## 🔄 数据流

```
用户按快捷键
    ↓
main.ts: handleQuickWrite()
    ↓
context-extractor.ts: extract() ← 从编辑器提取上下文
    ↓
input-modal.ts: open() ← 显示对话框
    ↓
用户输入需求并提交
    ↓
main.ts: generateContent()
    ↓
openai-service.ts: streamCompletion() ← 调用 OpenAI API
    ↓
流式接收响应
    ↓
实时插入到编辑器
    ↓
完成或取消
```

## 🧪 调试

### 在 Obsidian 中调试

1. **链接插件到 vault**
```bash
# Windows (PowerShell 管理员)
New-Item -ItemType SymbolicLink -Path "你的Vault\.obsidian\plugins\swiftpen" -Target "D:\wangliang\SwiftPen"
```

2. **启动开发模式**
```bash
npm run dev
```

3. **打开 Obsidian 开发者工具**
- 按 `Ctrl+Shift+I` (Windows/Linux)
- 按 `Cmd+Option+I` (macOS)

4. **查看日志**
- 所有 `console.log` 会显示在控制台
- 错误会显示为红色

### 常用调试技巧

**查看变量**：
```typescript
console.log("上下文:", context);
console.log("用户输入:", userRequest);
```

**断点调试**：
在开发者工具的 Sources 面板中设置断点

**测试 API 调用**：
```typescript
// 在 openai-service.ts 中添加
console.log("正在调用 API...");
console.log("模型:", this.settings.model);
console.log("消息:", messages);
```

**监控流式响应**：
```typescript
// 在 main.ts generateContent 中
for await (const chunk of this.openAIService.streamCompletion(...)) {
    console.log("收到 chunk:", chunk);
    // ...
}
```

## 🏗️ 构建流程

### 开发构建

```bash
npm run dev
```

这会：
1. 运行 TypeScript 类型检查
2. 使用 esbuild 打包代码
3. 生成 `main.js` 和 source map
4. 监听文件变化自动重新编译

### 生产构建

```bash
npm run build
```

这会：
1. 运行 TypeScript 类型检查（`tsc -noEmit`）
2. 使用 esbuild 打包并优化代码
3. 启用 tree-shaking
4. 生成 `main.js`（不含 source map）

## 📦 发布流程

### 1. 更新版本

```bash
# 更新 package.json 中的版本
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

这会自动：
- 更新 `package.json` 版本
- 运行 `version-bump.mjs` 更新 `manifest.json` 和 `versions.json`
- 创建 git commit 和 tag

### 2. 更新文档

- 更新 `CHANGELOG.md`
- 检查 `README.md` 是否需要更新

### 3. 构建生产版本

```bash
npm run build
```

### 4. 测试

在实际 vault 中测试所有功能

### 5. 发布

```bash
git push origin main
git push origin --tags
```

然后在 GitHub 创建 Release，上传以下文件：
- `main.js`
- `manifest.json`
- `styles.css`（如果有）

## 🧩 扩展开发

### 添加新命令

在 `src/main.ts` 的 `onload()` 中：

```typescript
this.addCommand({
    id: "your-command-id",
    name: "你的命令名称",
    editorCallback: (editor: Editor) => {
        // 你的逻辑
    },
    hotkeys: [{
        modifiers: ["Mod"],
        key: "K"
    }]
});
```

### 添加新设置

1. 在 `src/settings.ts` 中更新 `SwiftPenSettings` 接口
2. 更新 `DEFAULT_SETTINGS`
3. 在 `SwiftPenSettingTab.display()` 中添加 UI

### 支持新的 AI 服务

创建新的服务类，实现相同的接口：

```typescript
class YourAIService {
    async *streamCompletion(...) {
        // 实现流式生成
    }
}
```

## 🐛 常见问题

### Q: 修改代码后没有生效

**A**: 
1. 确认 `npm run dev` 正在运行
2. 检查控制台是否有编译错误
3. 在 Obsidian 中重新加载插件（关闭并重新打开）
4. 或重启 Obsidian

### Q: TypeScript 报错

**A**: 
1. 确认安装了所有依赖 `npm install`
2. 检查 `tsconfig.json` 配置
3. 运行 `npm run build` 查看详细错误

### Q: API 调用失败

**A**: 
1. 检查 API Key 是否正确
2. 检查网络连接
3. 查看控制台错误信息
4. 尝试在浏览器中直接调用 OpenAI API 测试

### Q: 如何添加日志

**A**: 
```typescript
console.log("[SwiftPen]", "你的消息", variable);
console.error("[SwiftPen]", "错误信息", error);
```

## 📚 相关资源

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [esbuild 文档](https://esbuild.github.io/)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码风格

- 使用 TypeScript
- 遵循现有代码风格
- 添加必要的注释
- 保持函数简洁，单一职责

### Commit 规范

使用语义化提交信息：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具链更新
```

## 📧 联系

如有问题，欢迎通过 GitHub Issues 联系我们。

---

Happy Coding! 🚀

