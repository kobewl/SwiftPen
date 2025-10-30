# 更新日志

所有重要的更改都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2025-10-30

### 新增
- ✨ 初始版本发布
- 🚀 支持通过快捷键快速调用 AI 写作
- 💬 用户输入对话框，支持自定义写作需求
- 🌊 流式实时生成，边生成边显示
- 📝 智能上下文提取，自动识别并保留 Markdown 结构
- ⚙️ 完整的设置页面
  - OpenAI API Key 配置
  - 模型选择（GPT-3.5/GPT-4/GPT-4 Turbo/GPT-4o）
  - 自定义生成参数（温度、最大长度）
  - 可配置上下文长度
  - 自定义系统提示词
  - Base URL 配置（支持代理）
- 🔄 智能重试机制
  - 速率限制自动重试
  - 指数退避策略
  - 服务器错误处理
- ⌨️ 快捷键支持
  - `Ctrl/Cmd+Shift+L` - 快速写作
  - `Esc` - 取消生成
  - `Enter` - 提交需求
- 📖 完整的文档
  - README.md - 详细介绍
  - QUICKSTART.md - 快速开始指南
  - 代码注释

### 技术特性
- TypeScript 实现，类型安全
- 使用 OpenAI 官方 JS SDK
- esbuild 快速构建
- 模块化设计，易于维护和扩展

### 已知限制
- API Key 以明文存储在本地
- 生成内容需要发送到 OpenAI 服务器
- 需要网络连接

[1.0.0]: https://github.com/yourusername/SwiftPen/releases/tag/v1.0.0

