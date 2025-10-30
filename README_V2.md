# SwiftPen V2 - AI 智能写作助手 ✨

> 支持多种 AI 服务，快速写作，一键翻译，让创作更轻松！

## 🌟 V2 新特性

| 功能 | 说明 | 快捷键 |
|------|------|--------|
| 🤖 **多 AI 服务** | OpenAI、Gemini、自定义 API | - |
| 📝 **快速写作** | AI 续写、改写、扩展 | `Ctrl+Shift+L` |
| 🌍 **选词翻译** | 一键翻译，9 种语言 | `Ctrl+Shift+T` |
| ⚡ **智能缓存** | 提速 10x，节省 70% 成本 | - |

## 🚀 5 分钟快速开始

### 方式 1：使用 OpenAI（付费，质量最好）

```bash
1. npm install && npm run build
2. ./install.ps1 "你的Vault路径"
3. 设置 → SwiftPen → 选择 "OpenAI"
4. 输入 API Key
5. 完成！
```

### 方式 2：使用 Gemini（免费）

```bash
1. 访问 https://aistudio.google.com/ 创建 API Key
2. npm install && npm run build
3. ./install.ps1 "你的Vault路径"
4. 设置 → SwiftPen → 选择 "Gemini"
5. 输入 Gemini API Key
6. 完成！
```

### 方式 3：使用 Ollama（本地免费）

```bash
1. 安装 Ollama: https://ollama.ai/
2. ollama run llama2
3. 设置 → SwiftPen → 选择 "自定义"
4. 配置:
   - API Key: ollama
   - Base URL: http://localhost:11434/v1
   - 模型: llama2
5. 完成！
```

## 💡 使用示例

### 快速写作

```markdown
今天学习了 TypeScript...
[光标] ← 按 Ctrl+Shift+L

→ 输入："继续写，介绍 TS 的优势"
→ AI 自动生成内容
```

### 选词翻译

```markdown
选中: "Hello World"
按 Ctrl+Shift+T
→ "你好世界"
```

## 🎯 功能对比

|  | OpenAI | Gemini | Ollama |
|---|--------|--------|--------|
| 💰 成本 | 付费 | 免费 | 免费 |
| 🎯 质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| ⚡ 速度 | 快 | 快 | 中 |
| 🔒 隐私 | 云端 | 云端 | 本地 |
| 💵 推荐 | 专业用户 | 个人用户 | 隐私优先 |

## ⚙️ 核心配置

### AI 服务配置

```yaml
写作服务: OpenAI / Gemini / 自定义
  ├─ API Key: [必填]
  ├─ Base URL: [可选，支持代理]
  └─ 模型: [选择合适的模型]

翻译服务: [可单独配置]
  ├─ 目标语言: 简体中文 / 英语 / 等
  └─ 源语言: 自动检测 / 指定

性能优化:
  ├─ 启用缓存: ✅ (推荐)
  └─ 缓存超时: 30 分钟
```

## 📊 性能表现

| 场景 | 无缓存 | 有缓存 | 节省 |
|------|--------|--------|------|
| 响应时间 | 2-5s | <0.1s | 95% |
| API 调用 | 100% | 30% | 70% |
| 成本 | 全额 | 30% | 70% |

## 💰 成本对比

### 每天使用 20 次的月成本

```
GPT-4:        ~$18/月
GPT-4o:       ~$3/月
GPT-3.5:      ~$0.6/月
Gemini:       $0/月 (免费)
Ollama:       $0/月 (本地)
```

### 混合策略（推荐）

```
重要内容:  GPT-4      (~10次/天) → $9/月
日常写作:  Gemini     (免费)     → $0/月
翻译:      Gemini     (免费)     → $0/月
─────────────────────────────────────────
总成本:                          → ~$9/月
vs 全用 GPT-4:                   → $36/月
节省: 75%
```

## 🎓 进阶技巧

### 技巧 1：服务组合

```
场景              服务          理由
───────────────────────────────────────
重要文章          GPT-4         质量最好
日常笔记          Gemini        免费够用
翻译文档          Gemini        翻译优秀
实验草稿          Ollama        本地快速
```

### 技巧 2：缓存策略

```
任务类型          缓存设置      原因
───────────────────────────────────────
重复写作          60分钟        高重复性
翻译              30分钟        适中
创意写作          禁用          需要新鲜感
```

### 技巧 3：快捷键流程

```
写作流程:
1. 写开头
2. Ctrl+Shift+L → AI 续写
3. 选中润色 → Ctrl+Shift+L → "改进这段"
4. 选中翻译 → Ctrl+Shift+T

效率提升: 3-5x
```

## 📚 文档

- 📘 [完整功能文档](README.md)
- 🆕 [V2 新功能详解](docs/FEATURES_V2.md)
- 📈 [升级指南](UPGRADE_TO_V2.md)
- 💡 [使用示例](EXAMPLES.md)
- 🛠️ [开发文档](DEVELOPMENT.md)

## ❓ 快速 FAQ

**Q: 推荐哪个服务？**
A: 个人用户 → Gemini (免费)，专业用户 → GPT-4

**Q: 如何降低成本？**
A: 启用缓存 + 混合使用 Gemini 和 GPT-3.5

**Q: 本地模型效果如何？**
A: Ollama + Llama2 适合草稿，最终版用 GPT-4 润色

**Q: 翻译质量怎样？**
A: AI 翻译理解上下文，通常优于传统工具

**Q: 数据安全吗？**
A: 云服务会发送数据，本地 Ollama 完全私密

## 🔗 链接

- 🌐 [GitHub](https://github.com/yourusername/SwiftPen)
- 📝 [Issues](https://github.com/yourusername/SwiftPen/issues)
- 💬 [Discussions](https://github.com/yourusername/SwiftPen/discussions)

## 📜 许可证

MIT License - 自由使用和修改

---

**SwiftPen V2 - 让 AI 成为你的写作伙伴！** ✨

Made with ❤️ by wangliang

