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

		// 标题栏
		const header = contentEl.createDiv({ cls: "translation-header" });
		header.createEl("span", { text: "🌍", cls: "translation-icon" });
		header.createEl("h3", { text: "翻译", cls: "translation-title" });

		// 语言选择器
		const langSelector = contentEl.createDiv({ cls: "translation-lang-selector" });
		langSelector.createEl("span", { 
			text: this.getLangName(this.sourceLang),
			cls: "lang-label"
		});
		langSelector.createEl("span", { text: "→", cls: "lang-arrow" });
		
		// 目标语言下拉选择
		const targetSelect = langSelector.createEl("select", { cls: "lang-select" });
		const languages = [
			{ code: "zh-CN", name: "简体中文" },
			{ code: "zh-TW", name: "繁体中文" },
			{ code: "en", name: "English" },
			{ code: "ja", name: "日本語" },
			{ code: "ko", name: "한국어" },
			{ code: "fr", name: "Français" },
			{ code: "de", name: "Deutsch" },
			{ code: "es", name: "Español" },
			{ code: "ru", name: "Русский" }
		];
		
		languages.forEach(lang => {
			const option = targetSelect.createEl("option", { 
				value: lang.code,
				text: lang.name
			});
			if (lang.code === this.targetLang) {
				option.selected = true;
			}
		});

		// 内容区域
		const contentArea = contentEl.createDiv({ cls: "translation-content" });

		// 原文区域（紧凑）
		const originalSection = contentArea.createDiv({ cls: "translation-section" });
		originalSection.createEl("div", { 
			text: "原文", 
			cls: "section-label"
		});
		const originalBox = originalSection.createEl("div", { 
			cls: "text-box original-box"
		});
		originalBox.createEl("pre").setText(this.originalText);

		// 译文区域（可编辑）
		const translatedSection = contentArea.createDiv({ cls: "translation-section" });
		translatedSection.createEl("div", { 
			text: "译文", 
			cls: "section-label"
		});
		const translatedBox = translatedSection.createEl("div", { 
			cls: "text-box translated-box"
		});
		const translatedTextarea = translatedBox.createEl("textarea", {
			cls: "translation-textarea"
		});
		translatedTextarea.value = this.translatedText;
		translatedTextarea.rows = Math.min(10, Math.max(3, this.translatedText.split("\n").length + 1));

		// 统计信息（更紧凑）
		const statsDiv = contentEl.createDiv({ cls: "translation-stats" });
		statsDiv.createEl("span", { 
			text: `${this.originalText.length} 字符`,
			cls: "stat-item"
		});
		statsDiv.createEl("span", { text: "→", cls: "stat-arrow" });
		statsDiv.createEl("span", { 
			text: `${this.translatedText.length} 字符`,
			cls: "stat-item"
		});

		// 按钮区域（紧凑）
		const buttonContainer = contentEl.createDiv({ cls: "translation-buttons" });

		// 取消按钮
		const cancelBtn = buttonContainer.createEl("button", {
			text: "取消",
			cls: "btn btn-secondary"
		});
		cancelBtn.addEventListener("click", () => {
			this.onCancel();
			this.close();
		});

		// 复制按钮
		const copyBtn = buttonContainer.createEl("button", {
			text: "📋 复制",
			cls: "btn btn-normal"
		});
		copyBtn.addEventListener("click", () => {
			navigator.clipboard.writeText(translatedTextarea.value);
			new Notice("✅ 已复制");
		});

		// 替换按钮
		const replaceBtn = buttonContainer.createEl("button", {
			text: "✓ 替换",
			cls: "btn btn-primary"
		});
		replaceBtn.addEventListener("click", () => {
			this.onReplace(translatedTextarea.value);
			this.close();
		});

		// 语言切换事件
		targetSelect.addEventListener("change", async () => {
			const newTargetLang = targetSelect.value;
			// 这里可以触发重新翻译，但为了简化，我们只更新显示
			new Notice(`已切换目标语言为 ${this.getLangName(newTargetLang)}`);
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
				padding: 0;
				max-width: 520px;
			}

			.translation-header {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 16px 20px 12px;
				border-bottom: 1px solid var(--background-modifier-border);
			}

			.translation-icon {
				font-size: 18px;
			}

			.translation-title {
				margin: 0;
				font-size: 16px;
				font-weight: 600;
				color: var(--text-normal);
			}

			.translation-lang-selector {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 12px 20px;
				background: var(--background-secondary);
				border-bottom: 1px solid var(--background-modifier-border);
			}

			.lang-label {
				font-size: 13px;
				color: var(--text-muted);
				font-weight: 500;
			}

			.lang-arrow {
				color: var(--text-muted);
				font-size: 12px;
			}

			.lang-select {
				padding: 4px 8px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 4px;
				background: var(--background-primary);
				color: var(--text-normal);
				font-size: 13px;
				cursor: pointer;
				outline: none;
			}

			.lang-select:hover {
				border-color: var(--interactive-accent);
			}

			.translation-content {
				padding: 16px 20px;
			}

			.translation-section {
				margin-bottom: 12px;
			}

			.section-label {
				font-size: 12px;
				font-weight: 600;
				color: var(--text-muted);
				margin-bottom: 6px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}

			.text-box {
				background: var(--background-primary);
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				padding: 10px;
				max-height: 200px;
				overflow-y: auto;
			}

			.text-box:focus-within {
				border-color: var(--interactive-accent);
				box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.1);
			}

			.text-box pre {
				margin: 0;
				padding: 0;
				white-space: pre-wrap;
				word-break: break-word;
				font-family: var(--font-text);
				font-size: 14px;
				line-height: 1.6;
				color: var(--text-normal);
			}

			.translation-textarea {
				width: 100%;
				min-height: 60px;
				padding: 0;
				border: none;
				background: transparent;
				color: var(--text-normal);
				font-family: var(--font-text);
				font-size: 14px;
				line-height: 1.6;
				resize: vertical;
				outline: none;
			}

			.translation-stats {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 6px;
				margin: 12px 0;
				padding: 6px;
				font-size: 11px;
				color: var(--text-muted);
			}

			.stat-item {
				font-weight: 500;
			}

			.stat-arrow {
				font-size: 10px;
			}

			.translation-buttons {
				display: flex;
				justify-content: flex-end;
				gap: 8px;
				padding: 12px 20px 16px;
				border-top: 1px solid var(--background-modifier-border);
			}

			.btn {
				padding: 6px 14px;
				border-radius: 5px;
				border: none;
				font-size: 13px;
				font-weight: 500;
				cursor: pointer;
				transition: all 0.15s;
			}

			.btn-secondary {
				background: var(--background-modifier-border);
				color: var(--text-normal);
			}

			.btn-secondary:hover {
				background: var(--background-modifier-border-hover);
			}

			.btn-normal {
				background: var(--interactive-normal);
				color: var(--text-normal);
			}

			.btn-normal:hover {
				background: var(--interactive-hover);
			}

			.btn-primary {
				background: var(--interactive-accent);
				color: var(--text-on-accent);
			}

			.btn-primary:hover {
				background: var(--interactive-accent-hover);
			}
		`;

		document.head.appendChild(styleEl);
	}
}

