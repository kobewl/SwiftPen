import OpenAI from "openai";
import { SwiftPenSettings } from "./settings";

export class OpenAIService {
	private client: OpenAI | null = null;
	private settings: SwiftPenSettings;
	private currentAbortController: AbortController | null = null;

	constructor(settings: SwiftPenSettings) {
		this.settings = settings;
		this.initializeClient();
	}

	private initializeClient(): void {
		if (!this.settings.apiKey) {
			this.client = null;
			return;
		}

		this.client = new OpenAI({
			apiKey: this.settings.apiKey,
			baseURL: this.settings.baseURL,
			dangerouslyAllowBrowser: true // Obsidian 插件运行在 Electron 中
		});
	}

	updateSettings(settings: SwiftPenSettings): void {
		this.settings = settings;
		this.initializeClient();
	}

	isConfigured(): boolean {
		return !!this.settings.apiKey;
	}

	cancel(): void {
		if (this.currentAbortController) {
			this.currentAbortController.abort();
			this.currentAbortController = null;
		}
	}

	async *streamCompletion(
		contextBefore: string,
		contextAfter: string,
		userRequest: string,
		onError?: (error: Error) => void
	): AsyncGenerator<string, void, unknown> {
		if (!this.client) {
			throw new Error("OpenAI 客户端未初始化，请检查 API Key 设置");
		}

		this.currentAbortController = new AbortController();

		const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{
				role: "system",
				content: this.settings.systemPrompt
			},
			{
				role: "user",
				content: this.buildPrompt(contextBefore, contextAfter, userRequest)
			}
		];

		let retryCount = 0;
		const maxRetries = 3;
		const baseDelay = 1000;

		while (retryCount <= maxRetries) {
			try {
				const stream = await this.client.chat.completions.create(
					{
						model: this.settings.model,
						messages: messages,
						max_tokens: this.settings.maxTokens,
						temperature: this.settings.temperature,
						stream: true
					},
					{
						signal: this.currentAbortController.signal
					}
				);

				for await (const chunk of stream) {
					const content = chunk.choices[0]?.delta?.content;
					if (content) {
						yield content;
					}
				}

				this.currentAbortController = null;
				return;

			} catch (error: any) {
				// 处理取消
				if (error.name === "AbortError" || error.code === "ABORT_ERR") {
					throw new Error("操作已取消");
				}

				// 处理速率限制
				if (error.status === 429 || error.status >= 500) {
					retryCount++;
					if (retryCount > maxRetries) {
						const errorMsg = error.status === 429
							? "API 请求过于频繁，请稍后再试"
							: "服务器错误，请稍后再试";
						throw new Error(errorMsg);
					}

					// 指数退避
					const delay = baseDelay * Math.pow(2, retryCount - 1);
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				}

				// 其他错误
				const errorMessage = this.parseError(error);
				if (onError) {
					onError(new Error(errorMessage));
				}
				throw new Error(errorMessage);
			}
		}
	}

	private buildPrompt(contextBefore: string, contextAfter: string, userRequest: string): string {
		let prompt = "";

		if (contextBefore) {
			prompt += `【光标前的内容】\n${contextBefore}\n\n`;
		}

		prompt += `【光标位置】\n`;

		if (contextAfter) {
			prompt += `\n【光标后的内容】\n${contextAfter}\n\n`;
		}

		prompt += `【用户需求】\n${userRequest}\n\n`;
		prompt += `请根据上下文和用户需求，生成应该插入到【光标位置】的内容。请直接输出内容，不要包含任何解释或元信息。`;

		return prompt;
	}

	private parseError(error: any): string {
		if (error.message) {
			return error.message;
		}

		if (error.error?.message) {
			return error.error.message;
		}

		if (error.status === 401) {
			return "API Key 无效，请检查设置";
		}

		if (error.status === 403) {
			return "API 访问被拒绝，请检查您的账户状态";
		}

		if (error.status === 404) {
			return "模型不存在或您无权访问该模型";
		}

		return `请求失败: ${error.toString()}`;
	}
}

