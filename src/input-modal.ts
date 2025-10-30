import { App, Modal, Notice, Setting } from "obsidian";

export class InputModal extends Modal {
	private userInput: string = "";
	private onSubmit: (input: string) => void;
	private onCancel: () => void;
	private contextPreview: string;
	private inputEl: HTMLInputElement | null = null;
	private submitButton: HTMLButtonElement | null = null;
	private isSubmitted: boolean = false;

	constructor(
		app: App,
		contextPreview: string,
		onSubmit: (input: string) => void,
		onCancel: () => void
	) {
		super(app);
		this.contextPreview = contextPreview;
		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.empty();
		contentEl.addClass("swiftpen-input-modal");

		// 标题栏
		const header = contentEl.createDiv({ cls: "input-modal-header" });
		header.createEl("span", { text: "✨", cls: "input-modal-icon" });
		header.createEl("h3", { text: "AI 写作助手", cls: "input-modal-title" });

		// 描述
		const descEl = contentEl.createDiv({ cls: "input-modal-description" });
		descEl.setText("描述你的需求，AI 将基于当前上下文智能生成内容");

		// 上下文预览（紧凑）
		const contextContainer = contentEl.createDiv({ cls: "input-modal-context" });
		contextContainer.createEl("div", {
			text: "📍 当前位置",
			cls: "context-label"
		});
		contextContainer.createEl("div", {
			text: this.contextPreview,
			cls: "context-text"
		});

		// 输入框
		const inputContainer = contentEl.createDiv({ cls: "input-modal-input-container" });
		inputContainer.createEl("label", { text: "写作需求", cls: "input-label" });
		
		const textarea = inputContainer.createEl("textarea", {
			cls: "input-textarea",
			placeholder: "例如：\n• 继续写下一段\n• 用更专业的语气改写\n• 补充更多细节和例子"
		});
		textarea.rows = 4;
		this.inputEl = textarea as any;

		textarea.addEventListener("input", (e) => {
			this.userInput = (e.target as HTMLTextAreaElement).value;
			this.updateSubmitButton();
		});

		// 自动聚焦
		setTimeout(() => textarea.focus(), 50);

		// 回车提交
		textarea.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				this.submit();
			} else if (e.key === "Escape") {
				e.preventDefault();
				this.cancel();
			}
		});

		// 提示信息
		const hintEl = contentEl.createDiv({ cls: "input-modal-hint" });
		hintEl.innerHTML = "<kbd>Enter</kbd> 提交 · <kbd>Shift + Enter</kbd> 换行 · <kbd>Esc</kbd> 取消";

		// 按钮
		const buttonContainer = contentEl.createDiv({ cls: "input-modal-buttons" });

		// 取消按钮
		const cancelBtn = buttonContainer.createEl("button", {
			text: "取消",
			cls: "btn btn-secondary"
		});
		cancelBtn.addEventListener("click", () => this.cancel());

		// 提交按钮
		this.submitButton = buttonContainer.createEl("button", {
			text: "✨ 开始生成",
			cls: "btn btn-primary"
		});
		this.submitButton.disabled = true;
		this.submitButton.addEventListener("click", () => this.submit());

		// 添加样式
		this.addStyles();
	}

	private updateSubmitButton() {
		if (this.submitButton) {
			this.submitButton.disabled = !this.userInput.trim();
		}
	}

	private submit() {
		if (!this.userInput.trim() || this.isSubmitted) {
			return;
		}

		this.isSubmitted = true;
		this.onSubmit(this.userInput.trim());
		this.close();
	}

	private cancel() {
		if (this.isSubmitted) {
			return;
		}

		this.onCancel();
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		
		// 如果关闭时还没有提交，调用取消回调
		if (!this.isSubmitted) {
			this.onCancel();
		}
	}

	private addStyles() {
		const styleEl = document.createElement("style");
		styleEl.textContent = `
			.swiftpen-input-modal {
				padding: 0;
				max-width: 520px;
			}

			.input-modal-header {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 16px 20px 12px;
				border-bottom: 1px solid var(--background-modifier-border);
			}

			.input-modal-icon {
				font-size: 18px;
			}

			.input-modal-title {
				margin: 0;
				font-size: 16px;
				font-weight: 600;
				color: var(--text-normal);
			}

			.input-modal-description {
				padding: 12px 20px;
				background: var(--background-secondary);
				color: var(--text-muted);
				font-size: 13px;
				line-height: 1.5;
				border-bottom: 1px solid var(--background-modifier-border);
			}

			.input-modal-context {
				padding: 12px 20px;
				background: var(--background-primary-alt);
				border-bottom: 1px solid var(--background-modifier-border);
			}

			.context-label {
				font-size: 11px;
				font-weight: 600;
				color: var(--text-muted);
				margin-bottom: 6px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}

			.context-text {
				font-family: var(--font-monospace);
				font-size: 12px;
				color: var(--text-normal);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-height: 40px;
			}

			.input-modal-input-container {
				padding: 16px 20px;
			}

			.input-label {
				display: block;
				font-size: 12px;
				font-weight: 600;
				color: var(--text-muted);
				margin-bottom: 8px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}

			.input-textarea {
				width: 100%;
				padding: 10px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				background: var(--background-primary);
				color: var(--text-normal);
				font-family: var(--font-text);
				font-size: 14px;
				line-height: 1.6;
				resize: vertical;
				outline: none;
				transition: border-color 0.15s, box-shadow 0.15s;
			}

			.input-textarea:focus {
				border-color: var(--interactive-accent);
				box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.1);
			}

			.input-textarea::placeholder {
				color: var(--text-faint);
			}

			.input-modal-hint {
				padding: 0 20px 12px;
				font-size: 11px;
				color: var(--text-faint);
				text-align: center;
			}

			.input-modal-hint kbd {
				padding: 2px 6px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 3px;
				background: var(--background-secondary);
				font-family: var(--font-monospace);
				font-size: 10px;
				color: var(--text-muted);
			}

			.input-modal-buttons {
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

			.btn-primary {
				background: var(--interactive-accent);
				color: var(--text-on-accent);
			}

			.btn-primary:hover:not(:disabled) {
				background: var(--interactive-accent-hover);
			}

			.btn-primary:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		`;

		document.head.appendChild(styleEl);
	}
}

