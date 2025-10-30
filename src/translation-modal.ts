import { App, Modal, Setting, Notice } from "obsidian";

export class TranslationModal extends Modal {
	private originalText: string;
	private translatedText: string;
	private sourceLang: string;
	private targetLang: string;
	private onReplace: (text: string) => void;
	private onCancel: () => void;

	constructor(
		app: App,
		originalText: string,
		translatedText: string,
		sourceLang: string,
		targetLang: string,
		onReplace: (text: string) => void,
		onCancel: () => void
	) {
		super(app);
		this.originalText = originalText;
		this.translatedText = translatedText;
		this.sourceLang = sourceLang;
		this.targetLang = targetLang;
		this.onReplace = onReplace;
		this.onCancel = onCancel;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.empty();
		contentEl.addClass("swiftpen-translation-modal");

		// 标题
		contentEl.createEl("h2", { text: "🌍 翻译结果" });

		// 语言信息
		const langInfo = contentEl.createDiv({ cls: "translation-lang-info" });
		langInfo.createEl("span", { 
			text: this.getLangName(this.sourceLang),
			cls: "lang-badge source-lang"
		});
		langInfo.createEl("span", { text: " → ", cls: "lang-arrow" });
		langInfo.createEl("span", { 
			text: this.getLangName(this.targetLang),
			cls: "lang-badge target-lang"
		});

		// 原文区域
		const originalSection = contentEl.createDiv({ cls: "translation-section" });
		originalSection.createEl("div", { 
			text: "原文", 
			cls: "translation-section-title"
		});
		const originalBox = originalSection.createEl("div", { 
			cls: "translation-text-box original-text"
		});
		originalBox.createEl("pre").setText(this.originalText);

		// 译文区域（可编辑）
		const translatedSection = contentEl.createDiv({ cls: "translation-section" });
		translatedSection.createEl("div", { 
			text: "译文（可编辑）", 
			cls: "translation-section-title"
		});
		const translatedBox = translatedSection.createEl("div", { 
			cls: "translation-text-box translated-text"
		});
		const translatedTextarea = translatedBox.createEl("textarea", {
			cls: "translation-textarea"
		});
		translatedTextarea.value = this.translatedText;
		translatedTextarea.rows = Math.min(15, this.translatedText.split("\n").length + 2);

		// 统计信息
		const statsDiv = contentEl.createDiv({ cls: "translation-stats" });
		statsDiv.createEl("span", { 
			text: `原文: ${this.originalText.length} 字符`,
			cls: "stat-item"
		});
		statsDiv.createEl("span", { text: " | ", cls: "stat-divider" });
		statsDiv.createEl("span", { 
			text: `译文: ${this.translatedText.length} 字符`,
			cls: "stat-item"
		});

		// 按钮区域
		const buttonContainer = contentEl.createDiv({ cls: "translation-button-container" });

		// 取消按钮
		const cancelBtn = buttonContainer.createEl("button", {
			text: "取消",
			cls: "translation-button cancel-button"
		});
		cancelBtn.addEventListener("click", () => {
			this.onCancel();
			this.close();
		});

		// 复制按钮
		const copyBtn = buttonContainer.createEl("button", {
			text: "复制译文",
			cls: "translation-button copy-button"
		});
		copyBtn.addEventListener("click", () => {
			navigator.clipboard.writeText(translatedTextarea.value);
			new Notice("✅ 已复制到剪贴板");
		});

		// 替换按钮
		const replaceBtn = buttonContainer.createEl("button", {
			text: "替换原文",
			cls: "translation-button replace-button"
		});
		replaceBtn.addEventListener("click", () => {
			this.onReplace(translatedTextarea.value);
			this.close();
		});

		// 添加样式
		this.addStyles();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private getLangName(code: string): string {
		const langMap: Record<string, string> = {
			"auto": "自动检测",
			"zh-CN": "简体中文",
			"zh-TW": "繁体中文",
			"en": "英语",
			"ja": "日语",
			"ko": "韩语",
			"fr": "法语",
			"de": "德语",
			"es": "西班牙语",
			"ru": "俄语"
		};
		return langMap[code] || code;
	}

	private addStyles() {
		const styleEl = document.createElement("style");
		styleEl.textContent = `
			.swiftpen-translation-modal {
				padding: 20px;
				max-width: 800px;
			}

			.swiftpen-translation-modal h2 {
				margin-bottom: 16px;
				color: var(--text-normal);
			}

			.translation-lang-info {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 20px;
				padding: 10px;
				background: var(--background-secondary);
				border-radius: 6px;
			}

			.lang-badge {
				padding: 4px 12px;
				border-radius: 4px;
				font-weight: 500;
				font-size: 0.9em;
			}

			.source-lang {
				background: var(--interactive-accent);
				color: var(--text-on-accent);
			}

			.target-lang {
				background: var(--interactive-success);
				color: white;
			}

			.lang-arrow {
				margin: 0 12px;
				font-size: 1.2em;
				color: var(--text-muted);
			}

			.translation-section {
				margin-bottom: 20px;
			}

			.translation-section-title {
				font-weight: 600;
				margin-bottom: 8px;
				color: var(--text-muted);
				font-size: 0.9em;
			}

			.translation-text-box {
				background: var(--background-primary);
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				padding: 12px;
				max-height: 300px;
				overflow-y: auto;
			}

			.translation-text-box pre {
				margin: 0;
				padding: 0;
				white-space: pre-wrap;
				word-break: break-word;
				font-family: var(--font-text);
				color: var(--text-normal);
			}

			.translation-textarea {
				width: 100%;
				min-height: 100px;
				max-height: 300px;
				padding: 0;
				border: none;
				background: transparent;
				color: var(--text-normal);
				font-family: var(--font-text);
				font-size: 1em;
				resize: vertical;
				outline: none;
			}

			.translation-stats {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 20px;
				padding: 8px;
				background: var(--background-secondary);
				border-radius: 4px;
				font-size: 0.85em;
				color: var(--text-muted);
			}

			.stat-item {
				padding: 0 8px;
			}

			.stat-divider {
				color: var(--background-modifier-border);
			}

			.translation-button-container {
				display: flex;
				justify-content: flex-end;
				gap: 10px;
				margin-top: 20px;
			}

			.translation-button {
				padding: 8px 16px;
				border-radius: 6px;
				border: none;
				cursor: pointer;
				font-weight: 500;
				transition: all 0.2s;
			}

			.cancel-button {
				background: var(--background-modifier-border);
				color: var(--text-normal);
			}

			.cancel-button:hover {
				background: var(--background-modifier-border-hover);
			}

			.copy-button {
				background: var(--interactive-normal);
				color: var(--text-normal);
			}

			.copy-button:hover {
				background: var(--interactive-hover);
			}

			.replace-button {
				background: var(--interactive-accent);
				color: var(--text-on-accent);
			}

			.replace-button:hover {
				background: var(--interactive-accent-hover);
			}
		`;

		document.head.appendChild(styleEl);
	}
}

