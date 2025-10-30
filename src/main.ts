import { Editor, Notice, Plugin } from "obsidian";
import { SwiftPenSettings, DEFAULT_SETTINGS, SwiftPenSettingTab } from "./settings";
import { OpenAIService } from "./openai-service";
import { ContextExtractor } from "./context-extractor";
import { InputModal } from "./input-modal";

export default class SwiftPenPlugin extends Plugin {
	settings: SwiftPenSettings;
	openAIService: OpenAIService;
	private isGenerating: boolean = false;

	async onload() {
		await this.loadSettings();

		// 初始化 OpenAI 服务
		this.openAIService = new OpenAIService(this.settings);

		// 添加命令：快速写作
		this.addCommand({
			id: "swiftpen-quick-write",
			name: "快速写作",
			icon: "pencil",
			editorCallback: (editor: Editor) => {
				this.handleQuickWrite(editor);
			},
			hotkeys: [
				{
					modifiers: ["Mod", "Shift"],
					key: "L"
				}
			]
		});

		// 添加命令：取消生成
		this.addCommand({
			id: "swiftpen-cancel",
			name: "取消生成",
			icon: "x",
			callback: () => {
				this.cancelGeneration();
			},
			hotkeys: [
				{
					modifiers: ["Mod"],
					key: "Escape"
				}
			]
		});

		// 添加设置选项卡
		this.addSettingTab(new SwiftPenSettingTab(this.app, this));

		console.log("SwiftPen 插件已加载");
	}

	onunload() {
		// 取消任何正在进行的生成
		this.cancelGeneration();
		console.log("SwiftPen 插件已卸载");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// 更新 OpenAI 服务配置
		if (this.openAIService) {
			this.openAIService.updateSettings(this.settings);
		}
	}

	/**
	 * 处理快速写作命令
	 */
	private async handleQuickWrite(editor: Editor) {
		// 检查是否正在生成
		if (this.isGenerating) {
			new Notice("正在生成中，请稍候或按 Esc 取消");
			return;
		}

		// 检查 API Key
		if (!this.openAIService.isConfigured()) {
			new Notice("请先在设置中配置 OpenAI API Key");
			return;
		}

		// 提取上下文
		const context = ContextExtractor.extract(
			editor,
			this.settings.contextBefore,
			this.settings.contextAfter
		);

		// 格式化上下文预览
		const contextPreview = ContextExtractor.formatForDisplay(context);

		// 显示输入对话框
		const modal = new InputModal(
			this.app,
			contextPreview,
			(userRequest) => {
				// 用户提交了需求，开始生成
				this.generateContent(editor, context.textBefore, context.textAfter, userRequest);
			},
			() => {
				// 用户取消
				// 不需要做任何事情
			}
		);

		modal.open();
	}

	/**
	 * 生成内容
	 */
	private async generateContent(
		editor: Editor,
		textBefore: string,
		textAfter: string,
		userRequest: string
	) {
		this.isGenerating = true;
		const startCursor = editor.getCursor();
		let generatedText = "";

		try {
			new Notice("正在生成内容... (按 Esc 取消)", 0);

			// 流式生成
			for await (const chunk of this.openAIService.streamCompletion(
				textBefore,
				textAfter,
				userRequest
			)) {
				generatedText += chunk;

				// 实时插入到编辑器
				const currentText = editor.getRange(startCursor, editor.getCursor());
				const newText = generatedText.substring(currentText.length);

				if (newText) {
					editor.replaceRange(
						newText,
						editor.getCursor(),
						editor.getCursor()
					);
				}
			}

			// 清除通知
			this.clearNotices();

			// 显示成功通知
			new Notice(`✓ 已生成 ${generatedText.length} 个字符`, 3000);

		} catch (error) {
			// 清除通知
			this.clearNotices();

			// 如果已经生成了一部分内容，保留它
			if (generatedText.length > 0) {
				new Notice(`⚠ 生成中断，已保留 ${generatedText.length} 个字符`, 4000);
			} else {
				new Notice(`✗ 生成失败: ${error.message}`, 5000);
			}

			console.error("SwiftPen 生成错误:", error);
		} finally {
			this.isGenerating = false;
		}
	}

	/**
	 * 取消生成
	 */
	private cancelGeneration() {
		if (this.isGenerating) {
			this.openAIService.cancel();
			this.clearNotices();
			new Notice("已取消生成", 2000);
			this.isGenerating = false;
		}
	}

	/**
	 * 清除所有通知
	 */
	private clearNotices() {
		// Obsidian 的 Notice 没有直接的清除所有通知的方法
		// 我们通过创建一个空通知然后立即清除来实现
		const notices = document.querySelectorAll(".notice");
		notices.forEach((notice) => {
			(notice as HTMLElement).remove();
		});
	}
}

