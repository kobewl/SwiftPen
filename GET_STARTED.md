# 🚀 SwiftPen - 立即开始

欢迎使用 SwiftPen！这个文档将帮助你在 5 分钟内完成安装和配置。

## ⚡ 快速开始（3 步）

### 1️⃣ 安装依赖并构建

```bash
# 安装依赖
npm install

# 开发构建（推荐）- 自动监听文件变化
npm run dev

# 或生产构建
npm run build
```

### 2️⃣ 安装到 Obsidian

#### Windows 用户

```powershell
# 在 PowerShell 中运行（需要管理员权限）
.\install.ps1 "C:\你的Vault路径"
```

#### Mac/Linux 用户

```bash
# 添加执行权限
chmod +x install.sh

# 运行安装脚本
./install.sh "/path/to/your/vault"
```

#### 手动安装

将以下文件复制到 `你的Vault\.obsidian\plugins\swiftpen\`：
- `main.js`
- `manifest.json`

### 3️⃣ 配置并使用

1. 打开 Obsidian
2. 进入 **设置 → 社区插件**
3. 启用 **SwiftPen**
4. 在 SwiftPen 设置中输入你的 **OpenAI API Key**
5. 在任意笔记中按 `Ctrl+Shift+L` 开始使用！

## 🎯 第一次使用

### 试试这个简单的例子

1. 创建一个新笔记
2. 输入：
   ```markdown
   今天学习了 TypeScript 的基础知识，
   ```
3. 按 `Ctrl+Shift+L`（Mac 用户按 `Cmd+Shift+L`）
4. 在弹出框输入：`继续写这一段，介绍 TypeScript 的优势`
5. 按 `Enter`，看 AI 帮你完成内容！

## 📚 下一步

### 了解更多功能

- 📖 [README.md](README.md) - 完整功能介绍
- ⚡ [QUICKSTART.md](QUICKSTART.md) - 详细使用指南
- 💡 [EXAMPLES.md](EXAMPLES.md) - 实用示例集合

### 开发者文档

- 🛠️ [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南
- 🏗️ [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 项目结构
- 📘 [docs/API.md](docs/API.md) - API 文档

## ⚙️ 推荐设置

### 初学者配置

```
模型: GPT-3.5 Turbo (快速且经济)
最大生成长度: 1000 tokens
创造性: 0.5 (比较保守)
上下文长度: 前 3000 / 后 500
```

### 专业用户配置

```
模型: GPT-4o (最强性能)
最大生成长度: 2000 tokens
创造性: 0.7 (平衡)
上下文长度: 前 6000 / 后 1000
```

### 创意写作配置

```
模型: GPT-4
最大生成长度: 2000 tokens
创造性: 1.2 (更有创造性)
上下文长度: 前 4000 / 后 1000
```

## 🔑 获取 API Key

### 方式 1：OpenAI 官方

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号
3. 进入 [API Keys](https://platform.openai.com/api-keys)
4. 创建新的 API Key
5. 复制 API Key（以 `sk-` 开头）

### 方式 2：使用代理服务（可选）

如果你在中国大陆，可以考虑使用支持 OpenAI API 的代理服务：

- 在设置中将 **Base URL** 改为代理服务的地址
- 输入代理服务提供的 API Key

## ❓ 常见问题

### Q: 构建失败？

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Q: 插件没有出现？

1. 确认文件在正确位置：`.obsidian/plugins/swiftpen/`
2. 重启 Obsidian
3. 在设置中关闭并重新打开"社区插件"

### Q: API 调用失败？

1. 检查 API Key 是否正确（以 `sk-` 开头）
2. 确认账户有余额
3. 检查网络连接
4. 查看 Obsidian 控制台（`Ctrl+Shift+I`）的错误信息

### Q: 生成速度慢？

1. 使用 GPT-3.5 Turbo 模型（更快）
2. 减少上下文长度
3. 检查网络连接
4. 考虑使用代理服务

## 🎓 学习资源

### 视频教程（待添加）

- [ ] 安装和配置
- [ ] 基础使用
- [ ] 高级技巧
- [ ] 实用案例

### 使用场景

1. **写作续写** - 让 AI 帮你继续写文章
2. **内容润色** - 改进文字表达
3. **风格转换** - 改变写作风格
4. **内容总结** - 快速提取要点
5. **大纲生成** - 自动创建文章结构
6. **翻译润色** - 翻译并优化文字

详见 [EXAMPLES.md](EXAMPLES.md) 获取具体示例。

## 🛟 获取帮助

### 遇到问题？

1. 查看 [故障排除](QUICKSTART.md#故障排除)
2. 搜索 [GitHub Issues](https://github.com/yourusername/SwiftPen/issues)
3. 提交新的 Issue
4. 加入社区讨论

### 提交 Issue 时请包含

- 操作系统和版本
- Obsidian 版本
- SwiftPen 版本
- 详细的错误信息
- 复现步骤

## 🌟 特性预览

### 当前功能 (v1.0.0)

- ✅ 快捷键快速调用
- ✅ 流式实时生成
- ✅ 智能上下文提取
- ✅ 多模型支持
- ✅ 可自定义配置
- ✅ 错误处理和重试

### 计划中的功能

- [ ] 更多 AI 服务支持（Claude, Gemini）
- [ ] 提示词模板系统
- [ ] 生成历史记录
- [ ] 批量处理
- [ ] 本地模型支持（Ollama）
- [ ] 快捷短语功能

## 📊 性能指标

### 典型使用场景

| 场景 | 模型 | 响应时间 | Token 消耗 |
|------|------|----------|-----------|
| 短文续写 (100字) | GPT-3.5 | ~2-3秒 | ~300 tokens |
| 长文续写 (500字) | GPT-4 | ~10-15秒 | ~1500 tokens |
| 内容改写 | GPT-3.5 | ~2-4秒 | ~400 tokens |
| 总结提炼 | GPT-3.5 | ~1-2秒 | ~200 tokens |

*注意：实际性能取决于网络状况和 API 负载*

## 💰 成本估算

### OpenAI API 定价参考（2025年）

| 模型 | 输入 | 输出 | 每次调用成本* |
|------|------|------|---------------|
| GPT-3.5 Turbo | $0.0015/1K | $0.002/1K | ~$0.001 |
| GPT-4 | $0.03/1K | $0.06/1K | ~$0.03 |
| GPT-4 Turbo | $0.01/1K | $0.03/1K | ~$0.01 |
| GPT-4o | $0.005/1K | $0.015/1K | ~$0.005 |

*基于平均 500 tokens 输入 + 300 tokens 输出

**每天使用 20 次的月成本**：
- GPT-3.5 Turbo: ~$0.60/月
- GPT-4o: ~$3/月
- GPT-4: ~$18/月

## 🔒 隐私和安全

### ⚠️ 重要提示

1. **API Key 存储**
   - 明文存储在本地 `data.json`
   - 不要分享你的 vault 配置文件
   - 建议使用有限额的 API Key

2. **数据传输**
   - 笔记内容会发送到 OpenAI 服务器
   - 不建议用于极度敏感的内容
   - OpenAI 的数据使用政策：[链接](https://openai.com/policies/usage-policies)

3. **安全建议**
   - 定期更换 API Key
   - 监控 API 使用情况
   - 考虑使用本地代理
   - 为敏感内容使用本地模型（未来功能）

## 🎉 开始使用吧！

现在你已经准备好了！打开 Obsidian，按 `Ctrl+Shift+L`，让 AI 助力你的写作！

有任何问题或反馈，欢迎在 GitHub 上与我们交流。

---

**祝你使用愉快！** ✨

Made with ❤️ by wangliang

