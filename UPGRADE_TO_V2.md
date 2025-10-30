# 升级到 SwiftPen V2 指南

## 🎉 欢迎升级到 V2！

SwiftPen V2 带来了许多激动人心的新功能！本指南将帮助你快速完成升级和配置。

## ✨ V2 新功能概览

1. **多 AI 服务支持** - OpenAI、Gemini、自定义 API
2. **选词翻译功能** - 一键翻译，支持 9 种语言
3. **性能优化** - 智能缓存系统
4. **改进的设置界面** - 更清晰、更易用

详细功能说明：[FEATURES_V2.md](docs/FEATURES_V2.md)

## 📦 升级步骤

### 1. 备份（可选但推荐）

```bash
# 备份你的设置文件
cp .obsidian/plugins/swiftpen/data.json .obsidian/plugins/swiftpen/data.json.backup
```

### 2. 更新插件

```bash
# 拉取最新代码
git pull

# 重新安装依赖（如有新依赖）
npm install

# 重新构建
npm run build

# 重新安装到 Obsidian
./install.ps1 "你的Vault路径"  # Windows
# 或
./install.sh "/path/to/vault"  # Mac/Linux
```

### 3. 重启 Obsidian

关闭并重新打开 Obsidian，确保插件更新生效。

## ⚙️ 迁移配置

### 自动迁移

V2 会自动迁移你的 V1 设置：

```
V1 配置                    →  V2 配置
─────────────────────────────────────────
apiKey                    →  openaiApiKey
model                     →  openaiModel
baseURL                   →  openaiBaseURL
其他设置                   →  保持不变
```

你的所有配置都会被保留，无需手动修改！

### 手动检查（推荐）

升级后，建议检查一下设置：

1. 打开 **设置 → SwiftPen**
2. 确认 "写作服务提供商" 是否正确（默认 OpenAI）
3. 确认 API Key 是否正确迁移
4. 其他设置保持默认即可

## 🆕 配置新功能

### 1. 尝试 Google Gemini（免费）

想尝试免费的 Gemini？很简单：

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 创建 API Key（免费）
3. 在 SwiftPen 设置中：
   - 写作服务提供商：选择 "Google Gemini"
   - 输入 Gemini API Key
   - 选择模型（推荐 gemini-1.5-flash）
4. 完成！

### 2. 配置翻译功能

1. 在设置中找到 "翻译配置"
2. 选择翻译服务提供商（可以和写作服务不同）
3. 选择目标语言（如：简体中文）
4. 选择源语言（推荐：自动检测）

### 3. 启用缓存（推荐）

在 "性能优化" 部分：
- ✅ 启用缓存
- 设置缓存超时：30 分钟（默认）

## 🚀 开始使用新功能

### 快速写作（保持不变）

```
1. 按 Ctrl/Cmd+Shift+L
2. 输入需求
3. AI 生成内容
```

### 选词翻译（新功能）

```
1. 选中要翻译的文本
2. 按 Ctrl/Cmd+Shift+T
3. 自动翻译并替换
```

## 🔧 故障排除

### 问题 1：设置没有迁移

**症状**：升级后 API Key 丢失

**解决**：
1. 检查备份文件（如果有）
2. 重新输入 API Key
3. 查看 Obsidian 控制台是否有错误信息

### 问题 2：插件无法加载

**症状**：升级后插件显示错误

**解决**：
```bash
# 清理并重新构建
rm -rf node_modules main.js
npm install
npm run build
```

然后重新安装到 Obsidian。

### 问题 3：翻译功能不工作

**症状**：按快捷键没反应

**解决**：
1. 确认已选中文本
2. 检查翻译服务是否配置正确
3. 查看 Notice 提示信息
4. 检查 API Key 是否有效

### 问题 4：缓存导致结果不变

**症状**：修改提示词后结果没变

**解决**：
- 暂时禁用缓存
- 或等待缓存超时
- 或重启 Obsidian（清空缓存）

## 💡 使用建议

### 建议 1：混合使用服务

为了在质量和成本间平衡：

```
快速写作（质量重要）  →  OpenAI GPT-4
翻译功能（免费优先）  →  Google Gemini
日常写作（成本优化）  →  GPT-3.5 或 Gemini
```

### 建议 2：合理设置缓存

```
经常重复的写作任务  →  缓存 60 分钟
翻译任务            →  缓存 30 分钟
一次性创作          →  禁用缓存
```

### 建议 3：快捷键使用

新的快捷键：

```
Ctrl/Cmd+Shift+L  →  快速写作（原有功能）
Ctrl/Cmd+Shift+T  →  选词翻译（新功能）
Esc               →  取消操作（支持翻译）
```

## 📚 延伸阅读

- [V2 功能详解](docs/FEATURES_V2.md)
- [README](README.md)
- [使用示例](EXAMPLES.md)
- [开发文档](DEVELOPMENT.md)

## 🎁 V2 独特优势

### 成本优化

```
V1: 只能用 OpenAI（付费）
V2: 可选 Gemini（免费）+ 混合使用
    → 节省 50-90% 成本
```

### 功能增强

```
V1: 仅快速写作
V2: 快速写作 + 翻译 + 更多 AI 服务
    → 功能翻倍
```

### 性能提升

```
V1: 每次都调用 API
V2: 智能缓存 + 优化
    → 速度提升 10x（缓存命中时）
```

## ❓ 常见问题

### Q: V1 的设置会丢失吗？

**A**: 不会！V2 会自动迁移所有 V1 设置。

### Q: 需要重新配置吗？

**A**: 基本不需要。但建议检查一下新功能的设置。

### Q: 可以回退到 V1 吗？

**A**: 可以。使用 git 回退到 V1 标签：
```bash
git checkout v1.0.0
npm install
npm run build
```

### Q: V2 兼容 V1 的所有功能吗？

**A**: 完全兼容！所有 V1 功能在 V2 中都可以正常使用。

### Q: 升级后为什么 Temperature 范围变了？

**A**: V2 将范围从 0-2 调整为更标准的 0-1。如果你之前设置大于 1，会自动调整为 1。

## 🎊 享受 V2！

升级完成！现在你可以：

- ✅ 使用免费的 Gemini 服务
- ✅ 一键翻译任何文本
- ✅ 享受更快的响应速度
- ✅ 使用本地 AI 模型（Ollama）

有任何问题，欢迎提 Issue！

---

**Happy Writing with SwiftPen V2!** ✨

