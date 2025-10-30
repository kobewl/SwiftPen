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

		// 标题
		contentEl.createEl("h2", { text: "SwiftPen - AI 写作助手" });

		// 上下文预览
		const contextContainer = contentEl.createDiv({ cls: "swiftpen-context-preview" });
		contextContainer.createEl("div", {
			text: "当前位置：",
			cls: "swiftpen-context-label"
		});
		contextContainer.createEl("div", {
			text: this.contextPreview,
			cls: "swiftpen-context-text"
		});

		// 输入框
		const inputContainer = contentEl.createDiv({ cls: "swiftpen-input-container" });
		
		new Setting(inputContainer)
			.setName("写作需求")
			.setDesc("告诉 AI 你想写什么，例如：'继续写这一段'、'帮我总结上述内容'、'用更专业的语气改写'")
			.addText((text) => {
				this.inputEl = text.inputEl;
				text.inputEl.addClass("swiftpen-input-text");
				text
					.setPlaceholder("输入您的需求...")
					.onChange((value) => {
						this.userInput = value;
						this.updateSubmitButton();
					});

				// 自动聚焦
				setTimeout(() => {
					text.inputEl.focus();
				}, 50);

				// 回车提交
				text.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						this.submit();
					} else if (e.key === "Escape") {
						e.preventDefault();
						this.cancel();
					}
				});
			});

		// 按钮
		const buttonContainer = contentEl.createDiv({ cls: "swiftpen-button-container" });

		// 取消按钮
		const cancelBtn = buttonContainer.createEl("button", {
			text: "取消 (Esc)",
			cls: "swiftpen-button swiftpen-button-cancel"
		});
		cancelBtn.addEventListener("click", () => this.cancel());

		// 提交按钮
		this.submitButton = buttonContainer.createEl("button", {
			text: "生成 (Enter)",
			cls: "swiftpen-button swiftpen-button-submit"
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
				padding: 20px;
			}

			.swiftpen-context-preview {
				background: var(--background-secondary);
				padding: 12px;
				border-radius: 6px;
				margin: 16px 0;
				max-height: 120px;
				overflow-y: auto;
			}

			.swiftpen-context-label {
				font-weight: 600;
				margin-bottom: 6px;
				color: var(--text-muted);
				font-size: 0.9em;
			}

			.swiftpen-context-text {
				font-family: var(--font-monospace);
				font-size: 0.85em;
				color: var(--text-normal);
				white-space: pre-wrap;
				word-break: break-word;
			}

			.swiftpen-input-container {
				margin: 20px 0;
			}

			.swiftpen-input-text {
				width: 100%;
				min-width: 400px;
			}

			.swiftpen-button-container {
				display: flex;
				justify-content: flex-end;
				gap: 10px;
				margin-top: 20px;
			}

			.swiftpen-button {
				padding: 8px 16px;
				border-radius: 6px;
				border: none;
				cursor: pointer;
				font-weight: 500;
				transition: all 0.2s;
			}

			.swiftpen-button-cancel {
				background: var(--background-modifier-border);
				color: var(--text-normal);
			}

			.swiftpen-button-cancel:hover {
				background: var(--background-modifier-border-hover);
			}

			.swiftpen-button-submit {
				background: var(--interactive-accent);
				color: var(--text-on-accent);
			}

			.swiftpen-button-submit:hover:not(:disabled) {
				background: var(--interactive-accent-hover);
			}

			.swiftpen-button-submit:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}

			.setting-item-description.mod-warning {
				color: var(--text-error);
				background: var(--background-modifier-error);
				padding: 8px;
				border-radius: 4px;
				margin-bottom: 16px;
			}
		`;

		document.head.appendChild(styleEl);
	}
}

