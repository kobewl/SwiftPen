# SwiftPen - AI 快速写作助手

一个强大的 Obsidian 插件，让你使用 AI 快速完成内容编写。

## ✨ 特性

- 🚀 **快捷键触发**：写到一半按 `Ctrl/Cmd+Shift+L` 即可调用 AI
- 💬 **灵活需求输入**：告诉 AI 你想写什么风格和内容
- 📝 **智能上下文理解**：自动提取光标前后内容，保持文章连贯性
- 🌊 **流式实时生成**：边生成边显示，无需等待
- 🎯 **Markdown 友好**：智能识别并保持 Markdown 结构
- ⚙️ **高度可配置**：自定义模型、温度、上下文长度等参数
- 🔒 **本地存储**：API Key 仅存储在本地设备

## 📦 安装

### 手动安装

1. 下载最新的 Release 文件
2. 解压到你的 Obsidian vault 的 `.obsidian/plugins/swiftpen/` 目录
3. 在 Obsidian 设置中启用 SwiftPen 插件
4. 配置你的 OpenAI API Key

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/yourusername/SwiftPen.git
cd SwiftPen

# 安装依赖
npm install

# 构建插件
npm run build

# 或开发模式（自动重新编译）
npm run dev
```

## 🚀 使用方法

### 快速开始

1. **配置 API Key**
   - 打开 Obsidian 设置
   - 找到 SwiftPen 设置页面
   - 输入你的 OpenAI API Key

2. **开始写作**
   - 在编辑器中写一些内容
   - 将光标放在想要继续写的位置
   - 按 `Ctrl/Cmd+Shift+L` 或使用命令面板搜索 "SwiftPen: 快速写作"
   - 在弹出的对话框中输入你的需求
   - 按 Enter 或点击"生成"按钮

3. **取消生成**
   - 如果想中断生成，按 `Esc` 键即可

### 使用示例

**示例 1：继续写作**
```markdown
今天我学习了 TypeScript 的高级特型...
[光标位置]
```
输入需求：`继续写这一段，介绍泛型的用途`

**示例 2：改写内容**
```markdown
这个功能很好用。
[光标位置]
```
输入需求：`用更专业的语气改写上面的句子`

**示例 3：生成列表**
```markdown
学习前端开发的步骤：
[光标位置]
```
输入需求：`生成一个学习前端的详细步骤列表`

## ⚙️ 设置选项

### 基础设置

- **OpenAI API Key**：你的 OpenAI API 密钥（必填）
- **API Base URL**：自定义 API 地址，支持代理或本地服务
- **模型**：选择使用的 GPT 模型
  - GPT-3.5 Turbo：快速且经济
  - GPT-4：更强大的推理能力
  - GPT-4 Turbo：平衡速度和质量
  - GPT-4o：最新最强

### 生成参数

- **最大生成长度**：控制 AI 生成的最大 token 数（默认 2000）
- **创造性**：0-2 之间，越高越有创造性（默认 0.7）

### 上下文设置

- **光标前上下文字符数**：提取光标前多少字符（推荐 2000-6000）
- **光标后上下文字符数**：提取光标后多少字符（推荐 500-1000）

### 高级设置

- **系统提示词**：自定义 AI 的角色和行为方式

## 🔒 安全性说明

⚠️ **重要提示**：
- API Key 以明文形式存储在本地的 `data.json` 文件中
- 请确保你的设备安全，不要与他人共享你的 vault 配置文件
- 建议使用有使用限额的 API Key
- 可以通过设置 Base URL 使用代理服务以提高安全性

## 🛠️ 技术架构

- **插件框架**：Obsidian Plugin API
- **语言**：TypeScript
- **AI 服务**：OpenAI API (官方 JS SDK)
- **通信方式**：Server-Sent Events (SSE) 流式响应
- **构建工具**：esbuild

### 核心模块

- `main.ts`：插件主类，命令注册和协调
- `settings.ts`：设置页面和配置管理
- `openai-service.ts`：OpenAI API 调用，流式响应处理
- `context-extractor.ts`：智能上下文提取和截断
- `input-modal.ts`：用户输入对话框

## 🎯 特性亮点

### 智能上下文提取

- 自动在段落、句子边界截断，保持结构完整
- 优先保留 Markdown 格式标记
- 可配置上下文长度，避免超出 token 限制

### 流式生成体验

- 使用 SSE 流式传输
- 实时显示生成进度
- 可随时取消生成
- 已生成的内容会被保留

### 智能重试机制

- 429 速率限制自动重试
- 指数退避策略（1s, 2s, 4s）
- 5xx 服务器错误自动重试
- 友好的错误提示

## 📝 开发

### 项目结构

```
SwiftPen/
├── src/
│   ├── main.ts              # 插件主类
│   ├── settings.ts          # 设置管理
│   ├── openai-service.ts    # OpenAI API 服务
│   ├── context-extractor.ts # 上下文提取
│   └── input-modal.ts       # 输入对话框
├── main.ts                  # 入口文件
├── manifest.json            # 插件清单
├── package.json             # 依赖配置
├── tsconfig.json            # TypeScript 配置
└── esbuild.config.mjs       # 构建配置
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（自动重新编译）
npm run dev

# 生产构建
npm run build

# 类型检查
npm run build  # 会先运行 tsc -noEmit
```

### 调试

1. 在开发模式下运行 `npm run dev`
2. 将插件文件夹链接到 Obsidian vault 的 `.obsidian/plugins/` 目录
3. 在 Obsidian 中启用插件
4. 打开开发者控制台（Ctrl+Shift+I）查看日志

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Obsidian](https://obsidian.md/) - 强大的笔记应用
- [OpenAI](https://openai.com/) - 提供 AI 能力
- Obsidian 社区的各位开发者

## 📮 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。

---

**享受 AI 辅助写作的乐趣吧！** ✨

