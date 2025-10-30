# SwiftPen API 文档

本文档面向想要扩展或修改 SwiftPen 功能的开发者。

## 核心类和接口

### SwiftPenPlugin

主插件类，继承自 `obsidian.Plugin`。

```typescript
class SwiftPenPlugin extends Plugin {
    settings: SwiftPenSettings;
    openAIService: OpenAIService;
    private isGenerating: boolean;

    async onload(): Promise<void>
    onunload(): void
    async loadSettings(): Promise<void>
    async saveSettings(): Promise<void>
    private async handleQuickWrite(editor: Editor): Promise<void>
    private async generateContent(...): Promise<void>
    private cancelGeneration(): void
    private clearNotices(): void
}
```

**关键属性**：
- `settings` - 当前设置
- `openAIService` - OpenAI 服务实例
- `isGenerating` - 生成状态标志

**生命周期**：
1. `onload()` - 插件加载时调用
2. 加载设置
3. 初始化服务
4. 注册命令
5. `onunload()` - 插件卸载时调用

### SwiftPenSettings

设置接口定义。

```typescript
interface SwiftPenSettings {
    apiKey: string;           // OpenAI API Key
    model: string;            // 模型名称 (gpt-3.5-turbo, gpt-4, 等)
    maxTokens: number;        // 最大生成 token 数 (默认 2000)
    temperature: number;      // 温度参数 0-2 (默认 0.7)
    contextBefore: number;    // 光标前上下文字符数 (默认 4000)
    contextAfter: number;     // 光标后上下文字符数 (默认 1000)
    systemPrompt: string;     // 系统提示词
    baseURL: string;          // API Base URL (默认 OpenAI)
}
```

**默认值**：
```typescript
const DEFAULT_SETTINGS: SwiftPenSettings = {
    apiKey: "",
    model: "gpt-3.5-turbo",
    maxTokens: 2000,
    temperature: 0.7,
    contextBefore: 4000,
    contextAfter: 1000,
    systemPrompt: "你是一个专业的写作助手...",
    baseURL: "https://api.openai.com/v1"
}
```

### OpenAIService

OpenAI API 服务类。

```typescript
class OpenAIService {
    constructor(settings: SwiftPenSettings)
    
    updateSettings(settings: SwiftPenSettings): void
    isConfigured(): boolean
    cancel(): void
    
    async *streamCompletion(
        contextBefore: string,
        contextAfter: string,
        userRequest: string,
        onError?: (error: Error) => void
    ): AsyncGenerator<string, void, unknown>
    
    private initializeClient(): void
    private buildPrompt(...): string
    private parseError(error: any): string
}
```

**使用示例**：
```typescript
const service = new OpenAIService(settings);

// 检查是否配置
if (!service.isConfigured()) {
    console.error("未配置 API Key");
    return;
}

// 流式生成
try {
    for await (const chunk of service.streamCompletion(
        "光标前的内容",
        "光标后的内容",
        "用户需求"
    )) {
        console.log("收到:", chunk);
        // 处理生成的内容
    }
} catch (error) {
    console.error("生成失败:", error);
}

// 取消生成
service.cancel();
```

**重试策略**：
- 最大重试次数：3
- 重试延迟：1s, 2s, 4s (指数退避)
- 可重试错误：429 (速率限制), 5xx (服务器错误)
- 不可重试错误：401, 403, 404, 其他客户端错误

### ContextExtractor

上下文提取工具类。

```typescript
interface EditorContext {
    textBefore: string;     // 光标前的文本
    textAfter: string;      // 光标后的文本
    cursorPosition: number; // 光标位置 (字符偏移)
    selectedText: string;   // 选中的文本
    fullText: string;       // 完整文本
}

class ContextExtractor {
    static extract(
        editor: Editor,
        maxCharsBefore: number,
        maxCharsAfter: number
    ): EditorContext
    
    static formatForDisplay(
        context: EditorContext,
        maxLength?: number
    ): string
    
    private static smartTruncateBefore(
        text: string,
        maxChars: number
    ): string
    
    private static smartTruncateAfter(
        text: string,
        maxChars: number
    ): string
}
```

**使用示例**：
```typescript
const context = ContextExtractor.extract(
    editor,
    4000,  // 光标前最多 4000 字符
    1000   // 光标后最多 1000 字符
);

console.log("光标前:", context.textBefore);
console.log("光标后:", context.textAfter);
console.log("选中:", context.selectedText);

// 格式化显示
const preview = ContextExtractor.formatForDisplay(context, 100);
console.log("预览:", preview);
```

**截断优先级**：
1. 段落边界 (`\n\n`)
2. 行边界 (`\n`)
3. 句子边界 (`. ` `。` `! ` `！` `? ` `？`)
4. 直接截断

### InputModal

用户输入对话框。

```typescript
class InputModal extends Modal {
    constructor(
        app: App,
        contextPreview: string,
        onSubmit: (input: string) => void,
        onCancel: () => void
    )
    
    onOpen(): void
    onClose(): void
    private submit(): void
    private cancel(): void
    private updateSubmitButton(): void
    private addStyles(): void
}
```

**使用示例**：
```typescript
const modal = new InputModal(
    this.app,
    "...光标前的内容... [光标] 光标后的内容...",
    (userInput) => {
        console.log("用户输入:", userInput);
        // 处理用户输入
    },
    () => {
        console.log("用户取消");
        // 处理取消
    }
);

modal.open();
```

**事件**：
- `Enter` - 提交（需要有输入内容）
- `Esc` - 取消
- `关闭窗口` - 等同于取消

## 扩展示例

### 添加新的 AI 服务提供商

```typescript
// 1. 创建新的服务类
class CustomAIService {
    constructor(private settings: CustomSettings) {}
    
    async *streamCompletion(
        contextBefore: string,
        contextAfter: string,
        userRequest: string
    ): AsyncGenerator<string, void, unknown> {
        // 实现你的 API 调用
        const response = await fetch("https://your-api.com", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.settings.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: this.buildPrompt(contextBefore, contextAfter, userRequest),
                stream: true
            })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            yield chunk;
        }
    }
    
    private buildPrompt(...): string {
        // 构建提示词
    }
}

// 2. 在主插件中使用
export default class SwiftPenPlugin extends Plugin {
    async onload() {
        // 根据设置选择服务
        if (this.settings.provider === "openai") {
            this.aiService = new OpenAIService(this.settings);
        } else if (this.settings.provider === "custom") {
            this.aiService = new CustomAIService(this.settings);
        }
    }
}
```

### 添加自定义命令

```typescript
export default class SwiftPenPlugin extends Plugin {
    async onload() {
        // 现有代码...
        
        // 添加新命令
        this.addCommand({
            id: "swiftpen-improve-writing",
            name: "改进写作",
            icon: "wand",
            editorCallback: async (editor: Editor) => {
                // 获取选中文本
                const selectedText = editor.getSelection();
                
                if (!selectedText) {
                    new Notice("请先选中要改进的文本");
                    return;
                }
                
                // 直接调用 AI，不需要用户输入
                const context = ContextExtractor.extract(
                    editor,
                    this.settings.contextBefore,
                    this.settings.contextAfter
                );
                
                await this.generateContent(
                    editor,
                    context.textBefore,
                    context.textAfter,
                    "改进选中的文本，使其更清晰、更有说服力"
                );
            }
        });
    }
}
```

### 自定义提示词模板

```typescript
interface PromptTemplate {
    name: string;
    description: string;
    template: (context: EditorContext) => string;
}

const templates: PromptTemplate[] = [
    {
        name: "总结",
        description: "总结上文内容",
        template: (context) => 
            `用 3-5 句话总结以下内容：\n\n${context.textBefore}`
    },
    {
        name: "扩展",
        description: "扩展为详细段落",
        template: (context) => 
            `将以下内容扩展为一个详细的段落：\n\n${context.textBefore}`
    },
    {
        name: "列表",
        description: "转换为列表",
        template: (context) => 
            `将以下内容转换为带要点的列表：\n\n${context.textBefore}`
    }
];

// 在命令中使用
this.addCommand({
    id: "swiftpen-templates",
    name: "使用模板",
    editorCallback: (editor) => {
        // 显示模板选择器
        const menu = new Menu();
        
        templates.forEach(template => {
            menu.addItem(item => {
                item.setTitle(template.name)
                    .setIcon("file-text")
                    .onClick(async () => {
                        const context = ContextExtractor.extract(
                            editor,
                            this.settings.contextBefore,
                            this.settings.contextAfter
                        );
                        
                        const prompt = template.template(context);
                        await this.generateContent(
                            editor,
                            context.textBefore,
                            context.textAfter,
                            prompt
                        );
                    });
            });
        });
        
        menu.showAtMouseEvent(event);
    }
});
```

### 添加生成历史记录

```typescript
interface GenerationHistory {
    timestamp: number;
    userRequest: string;
    generatedText: string;
    contextBefore: string;
}

export default class SwiftPenPlugin extends Plugin {
    private history: GenerationHistory[] = [];
    
    private async generateContent(...) {
        // 现有生成逻辑...
        
        // 保存到历史
        this.history.push({
            timestamp: Date.now(),
            userRequest,
            generatedText,
            contextBefore
        });
        
        // 限制历史记录数量
        if (this.history.length > 50) {
            this.history.shift();
        }
        
        // 保存到磁盘
        await this.saveData({ history: this.history });
    }
    
    // 添加查看历史的命令
    async onload() {
        this.addCommand({
            id: "swiftpen-show-history",
            name: "查看生成历史",
            callback: () => {
                // 显示历史记录列表
                const modal = new HistoryModal(this.app, this.history);
                modal.open();
            }
        });
    }
}
```

## 事件和钩子

### 插件生命周期

```typescript
class SwiftPenPlugin extends Plugin {
    // 1. 插件加载
    async onload() {
        console.log("SwiftPen 正在加载...");
        // 初始化代码
    }
    
    // 2. 插件卸载
    onunload() {
        console.log("SwiftPen 正在卸载...");
        // 清理代码
        this.cancelGeneration();
    }
}
```

### 编辑器事件

```typescript
// 监听编辑器变化
this.registerEvent(
    this.app.workspace.on('editor-change', (editor: Editor) => {
        console.log("编辑器内容已改变");
    })
);

// 监听文件打开
this.registerEvent(
    this.app.workspace.on('file-open', (file: TFile) => {
        console.log("文件已打开:", file.path);
    })
);
```

## 调试工具

### 日志辅助函数

```typescript
class Logger {
    private static prefix = "[SwiftPen]";
    
    static log(...args: any[]) {
        console.log(this.prefix, ...args);
    }
    
    static error(...args: any[]) {
        console.error(this.prefix, ...args);
    }
    
    static warn(...args: any[]) {
        console.warn(this.prefix, ...args);
    }
    
    static debug(...args: any[]) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.prefix, ...args);
        }
    }
}
```

### 性能监控

```typescript
class PerformanceMonitor {
    private timers: Map<string, number> = new Map();
    
    start(label: string) {
        this.timers.set(label, Date.now());
    }
    
    end(label: string) {
        const start = this.timers.get(label);
        if (start) {
            const duration = Date.now() - start;
            console.log(`[Performance] ${label}: ${duration}ms`);
            this.timers.delete(label);
        }
    }
}

// 使用
const monitor = new PerformanceMonitor();
monitor.start("generation");
// ... 生成代码
monitor.end("generation");
```

## 测试

### 单元测试示例

```typescript
import { ContextExtractor } from './context-extractor';

describe('ContextExtractor', () => {
    test('smartTruncateBefore 在段落边界截断', () => {
        const text = "段落1\n\n段落2\n\n段落3";
        const result = ContextExtractor['smartTruncateBefore'](text, 10);
        expect(result).toContain('段落3');
    });
    
    test('extract 返回正确的上下文', () => {
        const mockEditor = {
            getCursor: () => ({ line: 0, ch: 5 }),
            getValue: () => "Hello World",
            posToOffset: () => 5,
            getSelection: () => ""
        };
        
        const context = ContextExtractor.extract(mockEditor as any, 100, 100);
        expect(context.textBefore).toBe("Hello");
        expect(context.textAfter).toBe(" World");
    });
});
```

## 常见问题

### Q: 如何修改系统提示词？

**A**: 在设置中修改 `systemPrompt`，或在代码中修改 `DEFAULT_SETTINGS.systemPrompt`。

### Q: 如何支持其他语言模型？

**A**: 创建新的服务类实现相同的接口（特别是 `streamCompletion` 方法）。

### Q: 如何添加自定义快捷键？

**A**: 在 `addCommand` 中添加 `hotkeys` 选项。

### Q: 如何访问插件实例？

**A**: 使用 `this.app.plugins.getPlugin('swiftpen')`。

## 参考资源

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/)

---

如有问题或建议，欢迎在 GitHub Issues 中讨论！

