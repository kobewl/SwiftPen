import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import SwiftPenPlugin from "./main";

export type AIProvider = "openai" | "gemini" | "custom";

export interface SwiftPenSettings {
	// AI 服务提供商
	provider: AIProvider;
	
	// OpenAI 配置
	openaiApiKey: string;
	openaiModel: string;
	openaiBaseURL: string;
	
	// Gemini 配置
	geminiApiKey: string;
	geminiModel: string;
	geminiBaseURL: string;
	
	// 自定义 API 配置
	customApiKey: string;
	customModel: string;
	customBaseURL: string;
	
	// 通用配置
	maxTokens: number;
	temperature: number;
	contextBefore: number;
	contextAfter: number;
	systemPrompt: string;
	
	// 翻译配置
	translateProvider: AIProvider;
	translateTargetLang: string;
	translateSourceLang: string;
	
	// 性能优化
	enableCache: boolean;
	cacheTimeout: number; // 缓存超时时间（分钟）
	
	// UI 配置
	showGenerationMarkers: boolean; // 是否显示生成标记
	generationStartMarker: string; // 生成开始标记
	generationEndMarker: string; // 生成结束标记
}

export const DEFAULT_SETTINGS: SwiftPenSettings = {
	provider: "openai",
	
	// OpenAI
	openaiApiKey: "",
	openaiModel: "gpt-3.5-turbo",
	openaiBaseURL: "https://api.openai.com/v1",
	
	// Gemini
	geminiApiKey: "",
	geminiModel: "gemini-pro",
	geminiBaseURL: "https://generativelanguage.googleapis.com/v1beta",
	
	// Custom
	customApiKey: "",
	customModel: "",
	customBaseURL: "",
	
	// 通用
	maxTokens: 2000,
	temperature: 0.7,
	contextBefore: 4000,
	contextAfter: 1000,
	systemPrompt: "你是一个专业的写作助手，帮助用户完成他们的写作内容。请根据用户提供的上下文和需求，自然地延续内容，保持风格一致。",
	
	// 翻译
	translateProvider: "openai",
	translateTargetLang: "zh-CN",
	translateSourceLang: "auto",
	
	// 性能
	enableCache: true,
	cacheTimeout: 30,
	
	// UI
	showGenerationMarkers: true,
	generationStartMarker: "\n\n---AI 生成开始---\n\n",
	generationEndMarker: "\n\n---AI 生成结束---\n\n"
};

export class SwiftPenSettingTab extends PluginSettingTab {
	plugin: SwiftPenPlugin;

	constructor(app: App, plugin: SwiftPenPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "SwiftPen 设置" });

		// 安全警告
		containerEl.createEl("div", {
			text: "⚠️ 安全提示：API Key 将以明文形式存储在本地。请确保您的设备安全。",
			cls: "setting-item-description mod-warning"
		});

		// ===== AI 服务提供商选择 =====
		containerEl.createEl("h3", { text: "AI 服务提供商" });
		
		new Setting(containerEl)
			.setName("写作服务提供商")
			.setDesc("选择用于快速写作的 AI 服务")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("openai", "OpenAI (GPT)")
					.addOption("gemini", "Google Gemini")
					.addOption("custom", "自定义 (兼容 OpenAI 格式)")
					.setValue(this.plugin.settings.provider)
					.onChange(async (value: AIProvider) => {
						this.plugin.settings.provider = value;
						await this.plugin.saveSettings();
						this.display(); // 重新渲染以显示对应的配置
					})
			);

		// ===== OpenAI 配置 =====
		if (this.plugin.settings.provider === "openai") {
			containerEl.createEl("h3", { text: "OpenAI 配置" });
			
			new Setting(containerEl)
				.setName("API Key")
				.setDesc("OpenAI API Key（必填）")
				.addText((text) =>
					text
						.setPlaceholder("sk-...")
						.setValue(this.plugin.settings.openaiApiKey)
						.onChange(async (value) => {
							this.plugin.settings.openaiApiKey = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("Base URL")
				.setDesc("API 基础地址（支持代理）")
				.addText((text) =>
					text
						.setPlaceholder("https://api.openai.com/v1")
						.setValue(this.plugin.settings.openaiBaseURL)
						.onChange(async (value) => {
							this.plugin.settings.openaiBaseURL = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("模型")
				.setDesc("选择 GPT 模型")
				.addDropdown((dropdown) =>
					dropdown
						.addOption("gpt-3.5-turbo", "GPT-3.5 Turbo")
						.addOption("gpt-4", "GPT-4")
						.addOption("gpt-4-turbo", "GPT-4 Turbo")
						.addOption("gpt-4o", "GPT-4o")
						.addOption("gpt-4o-mini", "GPT-4o Mini")
						.setValue(this.plugin.settings.openaiModel)
						.onChange(async (value) => {
							this.plugin.settings.openaiModel = value;
							await this.plugin.saveSettings();
						})
				);
		}

		// ===== Gemini 配置 =====
		if (this.plugin.settings.provider === "gemini") {
			containerEl.createEl("h3", { text: "Google Gemini 配置" });
			
			new Setting(containerEl)
				.setName("API Key")
				.setDesc("Google AI Studio API Key（必填）")
				.addText((text) =>
					text
						.setPlaceholder("AIza...")
						.setValue(this.plugin.settings.geminiApiKey)
						.onChange(async (value) => {
							this.plugin.settings.geminiApiKey = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("Base URL")
				.setDesc("API 基础地址")
				.addText((text) =>
					text
						.setPlaceholder("https://generativelanguage.googleapis.com/v1beta")
						.setValue(this.plugin.settings.geminiBaseURL)
						.onChange(async (value) => {
							this.plugin.settings.geminiBaseURL = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("模型")
				.setDesc("选择 Gemini 模型")
				.addDropdown((dropdown) =>
					dropdown
						.addOption("gemini-pro", "Gemini Pro")
						.addOption("gemini-1.5-pro", "Gemini 1.5 Pro")
						.addOption("gemini-1.5-flash", "Gemini 1.5 Flash")
						.setValue(this.plugin.settings.geminiModel)
						.onChange(async (value) => {
							this.plugin.settings.geminiModel = value;
							await this.plugin.saveSettings();
						})
				);
		}

		// ===== 自定义 API 配置 =====
		if (this.plugin.settings.provider === "custom") {
			containerEl.createEl("h3", { text: "自定义 API 配置" });
			containerEl.createEl("p", {
				text: "适用于 Claude、Ollama 等兼容 OpenAI 格式的 API",
				cls: "setting-item-description"
			});
			
			new Setting(containerEl)
				.setName("API Key")
				.setDesc("自定义 API Key")
				.addText((text) =>
					text
						.setPlaceholder("your-api-key")
						.setValue(this.plugin.settings.customApiKey)
						.onChange(async (value) => {
							this.plugin.settings.customApiKey = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("Base URL")
				.setDesc("API 基础地址")
				.addText((text) =>
					text
						.setPlaceholder("http://localhost:11434/v1")
						.setValue(this.plugin.settings.customBaseURL)
						.onChange(async (value) => {
							this.plugin.settings.customBaseURL = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("模型名称")
				.setDesc("输入模型标识符")
				.addText((text) =>
					text
						.setPlaceholder("llama2, claude-3-opus, etc.")
						.setValue(this.plugin.settings.customModel)
						.onChange(async (value) => {
							this.plugin.settings.customModel = value.trim();
							await this.plugin.saveSettings();
						})
				);
		}

		// ===== 通用配置 =====
		containerEl.createEl("h3", { text: "通用配置" });

		new Setting(containerEl)
			.setName("最大生成长度")
			.setDesc("AI 生成内容的最大 token 数量")
			.addText((text) =>
				text
					.setPlaceholder("2000")
					.setValue(String(this.plugin.settings.maxTokens))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.maxTokens = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("创造性")
			.setDesc("控制输出的随机性（0-1，越高越有创造性）")
			.addSlider((slider) =>
				slider
					.setLimits(0, 1, 0.1)
					.setValue(this.plugin.settings.temperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.temperature = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("光标前上下文字符数")
			.setDesc("提取光标前多少字符作为上下文（2000-6000 推荐）")
			.addText((text) =>
				text
					.setPlaceholder("4000")
					.setValue(String(this.plugin.settings.contextBefore))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.contextBefore = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("光标后上下文字符数")
			.setDesc("提取光标后多少字符作为上下文（500-1000 推荐）")
			.addText((text) =>
				text
					.setPlaceholder("1000")
					.setValue(String(this.plugin.settings.contextAfter))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.contextAfter = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("系统提示词")
			.setDesc("设置 AI 的角色和行为方式")
			.addTextArea((text) =>
				text
					.setPlaceholder("输入系统提示词...")
					.setValue(this.plugin.settings.systemPrompt)
					.onChange(async (value) => {
						this.plugin.settings.systemPrompt = value;
						await this.plugin.saveSettings();
					})
			);

		// ===== 翻译配置 =====
		containerEl.createEl("h3", { text: "翻译配置" });

		new Setting(containerEl)
			.setName("翻译服务提供商")
			.setDesc("选择用于翻译的 AI 服务")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("openai", "OpenAI (GPT)")
					.addOption("gemini", "Google Gemini")
					.addOption("custom", "自定义")
					.setValue(this.plugin.settings.translateProvider)
					.onChange(async (value: AIProvider) => {
						this.plugin.settings.translateProvider = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("目标语言")
			.setDesc("翻译的目标语言")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("zh-CN", "简体中文")
					.addOption("zh-TW", "繁体中文")
					.addOption("en", "英语")
					.addOption("ja", "日语")
					.addOption("ko", "韩语")
					.addOption("fr", "法语")
					.addOption("de", "德语")
					.addOption("es", "西班牙语")
					.addOption("ru", "俄语")
					.setValue(this.plugin.settings.translateTargetLang)
					.onChange(async (value) => {
						this.plugin.settings.translateTargetLang = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("源语言")
			.setDesc("自动检测或指定源语言")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("auto", "自动检测")
					.addOption("zh-CN", "简体中文")
					.addOption("zh-TW", "繁体中文")
					.addOption("en", "英语")
					.addOption("ja", "日语")
					.addOption("ko", "韩语")
					.setValue(this.plugin.settings.translateSourceLang)
					.onChange(async (value) => {
						this.plugin.settings.translateSourceLang = value;
						await this.plugin.saveSettings();
					})
			);

		// ===== 快捷键说明 =====
		containerEl.createEl("h3", { text: "快捷键" });
		
		const hotkeysDesc = containerEl.createDiv({ cls: "setting-item-description" });
		hotkeysDesc.createEl("p", { text: "💡 提示：你可以在 Obsidian 设置 → 快捷键 中搜索 'SwiftPen' 来自定义快捷键" });
		hotkeysDesc.createEl("br");
		hotkeysDesc.createEl("strong", { text: "默认快捷键：" });
		
		const hotkeysList = hotkeysDesc.createEl("ul");
		hotkeysList.createEl("li").innerHTML = "<code>Ctrl/Cmd+Shift+L</code> - 快速写作（AI 续写）";
		hotkeysList.createEl("li").innerHTML = "<code>Ctrl/Cmd+Shift+T</code> - 翻译选中文本";
		hotkeysList.createEl("li").innerHTML = "<code>Esc</code> - 取消当前操作";

		// ===== API 测试 =====
		containerEl.createEl("h3", { text: "API 测试" });

		new Setting(containerEl)
			.setName("测试 AI 连接")
			.setDesc("测试当前配置的 AI 服务是否可以正常连接")
			.addButton((button) => {
				button
					.setButtonText("测试连接")
					.setCta()
					.onClick(async () => {
						button.setDisabled(true);
						button.setButtonText("测试中...");
						try {
							await this.testAIConnection();
						} finally {
							button.setDisabled(false);
							button.setButtonText("测试连接");
						}
					});
				button.buttonEl.addClass("swiftpen-test-button");
			});

		// ===== 性能优化 =====
		containerEl.createEl("h3", { text: "性能优化" });

		new Setting(containerEl)
			.setName("启用缓存")
			.setDesc("缓存 AI 响应以提高性能和减少 API 调用")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableCache)
					.onChange(async (value) => {
						this.plugin.settings.enableCache = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("缓存超时")
			.setDesc("缓存有效期（分钟）")
			.addText((text) =>
				text
					.setPlaceholder("30")
					.setValue(String(this.plugin.settings.cacheTimeout))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.cacheTimeout = num;
							await this.plugin.saveSettings();
						}
					})
			);

		// ===== UI 配置 =====
		containerEl.createEl("h3", { text: "界面配置" });

		new Setting(containerEl)
			.setName("显示生成标记")
			.setDesc("在 AI 生成的内容前后添加标记，便于区分")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showGenerationMarkers)
					.onChange(async (value) => {
						this.plugin.settings.showGenerationMarkers = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("生成开始标记")
			.setDesc("AI 生成内容的开始标记")
			.addText((text) =>
				text
					.setPlaceholder("---AI 生成开始---")
					.setValue(this.plugin.settings.generationStartMarker)
					.onChange(async (value) => {
						this.plugin.settings.generationStartMarker = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("生成结束标记")
			.setDesc("AI 生成内容的结束标记")
			.addText((text) =>
				text
					.setPlaceholder("---AI 生成结束---")
					.setValue(this.plugin.settings.generationEndMarker)
					.onChange(async (value) => {
						this.plugin.settings.generationEndMarker = value;
						await this.plugin.saveSettings();
					})
			);
	}

	/**
	 * 测试 AI 连接
	 */
	private async testAIConnection() {
		try {
			// 获取当前服务
			const service = this.plugin.aiService;
			
			if (!service.isConfigured()) {
				new Notice("❌ 请先配置 AI 服务", 5000);
				return;
			}

			// 测试简单的生成
			let testResult = "";
			let hasContent = false;

			for await (const chunk of service.streamCompletion(
				"这是一个测试",
				"",
				"请回复：连接成功"
			)) {
				testResult += chunk;
				hasContent = true;
				if (testResult.length > 50) break; // 只测试前 50 个字符
			}

			if (hasContent) {
				new Notice("✅ AI 连接测试成功！", 5000);
			} else {
				new Notice("⚠️ 连接成功但未收到响应", 5000);
			}

		} catch (error) {
			console.error("API 测试失败:", error);
			new Notice(`❌ 连接失败: ${error.message}`, 5000);
		}
	}
}

