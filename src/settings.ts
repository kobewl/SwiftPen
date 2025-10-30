import { App, PluginSettingTab, Setting } from "obsidian";
import SwiftPenPlugin from "./main";

export interface SwiftPenSettings {
	apiKey: string;
	model: string;
	maxTokens: number;
	temperature: number;
	contextBefore: number;
	contextAfter: number;
	systemPrompt: string;
	baseURL: string;
}

export const DEFAULT_SETTINGS: SwiftPenSettings = {
	apiKey: "",
	model: "gpt-3.5-turbo",
	maxTokens: 2000,
	temperature: 0.7,
	contextBefore: 4000,
	contextAfter: 1000,
	systemPrompt: "你是一个专业的写作助手，帮助用户完成他们的写作内容。请根据用户提供的上下文和需求，自然地延续内容，保持风格一致。",
	baseURL: "https://api.openai.com/v1"
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

		// API Key
		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("请输入您的 OpenAI API Key（必填）")
			.addText((text) =>
				text
					.setPlaceholder("sk-...")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		// Base URL
		new Setting(containerEl)
			.setName("API Base URL")
			.setDesc("OpenAI API 的基础 URL（可用于代理或本地服务）")
			.addText((text) =>
				text
					.setPlaceholder("https://api.openai.com/v1")
					.setValue(this.plugin.settings.baseURL)
					.onChange(async (value) => {
						this.plugin.settings.baseURL = value.trim();
						await this.plugin.saveSettings();
					})
			);

		// Model
		new Setting(containerEl)
			.setName("模型")
			.setDesc("选择要使用的 OpenAI 模型")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("gpt-3.5-turbo", "GPT-3.5 Turbo (快速)")
					.addOption("gpt-4", "GPT-4 (更强)")
					.addOption("gpt-4-turbo", "GPT-4 Turbo (平衡)")
					.addOption("gpt-4o", "GPT-4o (最新)")
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);

		// Max Tokens
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

		// Temperature
		new Setting(containerEl)
			.setName("创造性")
			.setDesc("控制输出的随机性（0-2，越高越有创造性）")
			.addSlider((slider) =>
				slider
					.setLimits(0, 2, 0.1)
					.setValue(this.plugin.settings.temperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.temperature = value;
						await this.plugin.saveSettings();
					})
			);

		// Context Before
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

		// Context After
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

		// System Prompt
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
	}
}

