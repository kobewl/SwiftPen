# SwiftPen 项目结构说明

## 📋 概述

SwiftPen 是一个 Obsidian 插件，使用 TypeScript 开发，通过调用 OpenAI API 实现 AI 辅助写作功能。

## 🎯 核心功能流程

### 1. 触发写作助手
```
用户按 Ctrl+Shift+L
    ↓
注册的命令被触发
    ↓
main.ts: handleQuickWrite()
```

### 2. 提取上下文
```
ContextExtractor.extract(editor)
    ↓
获取光标位置
    ↓
提取光标前后文本
    ↓
智能截断（保持结构完整）
    ↓
返回 EditorContext 对象
```

### 3. 收集用户需求
```
创建 InputModal
    ↓
显示上下文预览
    ↓
用户输入需求
    ↓
用户按 Enter 提交
```

### 4. 调用 AI 生成
```
OpenAIService.streamCompletion()
    ↓
构建提示词（系统提示 + 上下文 + 需求）
    ↓
调用 OpenAI API (流式)
    ↓
yield 每个 chunk
```

### 5. 实时插入内容
```
for await (chunk of stream)
    ↓
累积生成的文本
    ↓
计算新增部分
    ↓
插入到编辑器光标位置
    ↓
更新光标位置
```

## 🗂️ 文件详解

### 核心代码文件

#### `src/main.ts` (约 150 行)
**主插件类**

关键成员：
```typescript
class SwiftPenPlugin extends Plugin {
    settings: SwiftPenSettings;
    openAIService: OpenAIService;
    isGenerating: boolean;
    
    onload()           // 插件加载
    onunload()         // 插件卸载
    loadSettings()     // 加载设置
    saveSettings()     // 保存设置
    handleQuickWrite() // 处理快速写作命令
    generateContent()  // 生成内容主流程
    cancelGeneration() // 取消生成
}
```

#### `src/settings.ts` (约 180 行)
**设置管理**

主要内容：
- `SwiftPenSettings` 接口定义
- `DEFAULT_SETTINGS` 默认配置
- `SwiftPenSettingTab` 设置页面 UI

设置项：
```typescript
{
    apiKey: string;        // ✅ 必需
    model: string;         // GPT 模型
    maxTokens: number;     // 生成长度
    temperature: number;   // 创造性
    contextBefore: number; // 上下文（前）
    contextAfter: number;  // 上下文（后）
    systemPrompt: string;  // 系统提示
    baseURL: string;       // API 地址
}
```

#### `src/openai-service.ts` (约 140 行)
**OpenAI API 服务**

核心功能：
- 管理 OpenAI 客户端实例
- 流式生成（AsyncGenerator）
- 错误处理和重试
- 请求取消

重试策略：
```
尝试 1: 立即
尝试 2: 等待 1 秒
尝试 3: 等待 2 秒
尝试 4: 等待 4 秒
失败: 抛出错误
```

支持的错误码：
- `429` - 速率限制 → 重试
- `5xx` - 服务器错误 → 重试
- `401` - API Key 无效 → 立即失败
- `403` - 访问被拒 → 立即失败
- `404` - 模型不存在 → 立即失败

#### `src/context-extractor.ts` (约 130 行)
**上下文提取器**

返回结构：
```typescript
interface EditorContext {
    textBefore: string;    // 光标前文本
    textAfter: string;     // 光标后文本
    cursorPosition: number;// 光标位置
    selectedText: string;  // 选中文本
    fullText: string;      // 全文
}
```

智能截断算法：
1. 在段落边界截断（`\n\n`）- 最佳
2. 在行边界截断（`\n`）- 次佳
3. 在句子边界截断（`. ` `。`等）- 可接受
4. 直接截断 - 最后手段

#### `src/input-modal.ts` (约 180 行)
**输入对话框**

UI 结构：
```
┌─────────────────────────────────┐
│ SwiftPen - AI 写作助手          │
├─────────────────────────────────┤
│ 当前位置：                       │
│ [上下文预览区域]                 │
├─────────────────────────────────┤
│ 写作需求                         │
│ [输入框]                         │
├─────────────────────────────────┤
│          [取消]  [生成]         │
└─────────────────────────────────┘
```

事件处理：
- `Enter` → 提交
- `Esc` → 取消
- 自动聚焦输入框
- 输入验证

### 配置文件

#### `manifest.json`
Obsidian 插件清单
```json
{
    "id": "swiftpen",
    "name": "SwiftPen",
    "version": "1.0.0",
    "minAppVersion": "0.15.0",
    "description": "...",
    "author": "wangliang"
}
```

#### `package.json`
npm 项目配置
- 依赖：`openai`, `obsidian`
- 脚本：`dev`, `build`, `version`
- DevDependencies：TypeScript, esbuild 等

#### `tsconfig.json`
TypeScript 编译配置
- Target: ES6
- Module: ESNext
- StrictNullChecks: true

#### `esbuild.config.mjs`
构建配置
- Entry: `main.ts`
- Bundle: true
- Format: cjs (CommonJS)
- External: obsidian, electron 等

### 文档文件

#### `README.md`
项目主文档
- 功能介绍
- 安装说明
- 使用方法
- 配置选项
- 技术架构

#### `QUICKSTART.md`
快速开始指南
- 安装步骤
- 配置方法
- 使用示例
- 故障排除

#### `DEVELOPMENT.md`
开发指南
- 环境设置
- 项目结构
- 调试技巧
- 发布流程
- 扩展开发

#### `CHANGELOG.md`
更新日志
- 版本历史
- 新增功能
- Bug 修复
- 破坏性变更

## 📊 代码统计

```
总文件数：约 20 个
总代码行数：约 800 行（不含注释和空行）

分布：
- 核心代码：~600 行
- 配置文件：~100 行
- 文档：~5000 行
```

文件大小估算：
```
src/main.ts           : ~5 KB
src/settings.ts       : ~6 KB
src/openai-service.ts : ~5 KB
src/context-extractor.ts : ~4 KB
src/input-modal.ts    : ~6 KB
main.js (编译后)     : ~150 KB (含 OpenAI SDK)
```

## 🔄 依赖关系

```
main.ts
  ├─→ settings.ts
  ├─→ openai-service.ts
  │     └─→ openai (npm package)
  ├─→ context-extractor.ts
  └─→ input-modal.ts

All files
  └─→ obsidian (external)
```

## 🎨 UI/UX 设计

### 颜色方案
使用 Obsidian 的 CSS 变量，自动适配主题：
- `--background-primary`
- `--background-secondary`
- `--text-normal`
- `--text-muted`
- `--interactive-accent`
- `--text-on-accent`

### 交互设计

**快捷键**：
- `Ctrl/Cmd+Shift+L` - 主功能
- `Enter` - 确认
- `Esc` - 取消

**视觉反馈**：
- 流式生成 - 实时显示
- 加载状态 - Notice 提示
- 错误状态 - 红色错误提示
- 成功状态 - 绿色成功提示

**用户体验**：
- 自动聚焦输入框
- 上下文预览
- 按钮禁用状态
- 可中断操作

## 🔐 安全考虑

### API Key 存储
```
位置: .obsidian/plugins/swiftpen/data.json
格式: 明文 JSON
风险: ⚠️ 中等
建议: 用户需要保护好自己的 vault
```

### 数据传输
```
协议: HTTPS
目标: OpenAI API
内容: 用户笔记内容 + 需求
风险: ⚠️ 隐私泄露
建议: 不要用于敏感内容
```

### 错误处理
- ✅ API 错误捕获
- ✅ 网络错误处理
- ✅ 超时处理
- ✅ 用户友好的错误信息

## 🚀 性能优化

### Token 优化
- 智能截断上下文
- 可配置上下文长度
- 只提取必要信息

### 响应优化
- 流式生成（SSE）
- 边收边显示
- 无需等待全部完成

### 网络优化
- 指数退避重试
- 请求取消支持
- 支持代理配置

## 📈 未来扩展方向

### 可能的功能
1. 支持更多 AI 服务（Claude, Gemini 等）
2. 本地模型支持（Ollama）
3. 模板系统
4. 历史记录
5. 快捷短语
6. 批量处理
7. 自定义提示词库
8. 多语言支持

### 技术改进
1. 单元测试
2. E2E 测试
3. 性能监控
4. 错误上报
5. 使用统计

## 🧪 测试策略

### 手动测试清单

**基础功能**：
- [ ] 快捷键触发
- [ ] 输入对话框显示
- [ ] 上下文提取正确
- [ ] 内容生成成功
- [ ] 流式显示正常
- [ ] 取消功能正常

**边界情况**：
- [ ] 空文档
- [ ] 超长文档
- [ ] 特殊字符
- [ ] Markdown 格式
- [ ] 网络错误
- [ ] API 错误

**设置功能**：
- [ ] 保存设置
- [ ] 加载设置
- [ ] 各参数生效

## 📞 支持渠道

- GitHub Issues - Bug 报告和功能请求
- GitHub Discussions - 使用讨论
- README.md - 使用文档
- DEVELOPMENT.md - 开发文档

---

这就是 SwiftPen 的完整结构说明。希望这能帮助你理解项目的设计和实现！

