import { SwiftPenSettings, AIProvider } from "./settings";
import { requestUrl } from "obsidian";

/**
 * AI 服务的统一接口
 */
export interface IAIService {
	isConfigured(): boolean;
	cancel(): void;
	streamCompletion(
		contextBefore: string,
		contextAfter: string,
		userRequest: string,
		onError?: (error: Error) => void
	): AsyncGenerator<string, void, unknown>;
	translate(
		text: string,
		targetLang: string,
		sourceLang?: string
	): Promise<string>;
}

/**
 * AI 服务工厂
 */
export class AIServiceFactory {
	static create(settings: SwiftPenSettings, provider?: AIProvider): IAIService {
		const actualProvider = provider || settings.provider;
		
		switch (actualProvider) {
			case "openai":
				return new OpenAIService(settings);
			case "gemini":
				return new GeminiService(settings);
			case "custom":
				return new CustomAIService(settings);
			default:
				throw new Error(`不支持的 AI 服务: ${actualProvider}`);
		}
	}
}

/**
 * 缓存管理器
 */
class CacheManager {
	private cache: Map<string, { data: string; timestamp: number }> = new Map();
	private timeout: number;

	constructor(timeoutMinutes: number) {
		this.timeout = timeoutMinutes * 60 * 1000;
	}

	get(key: string): string | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > this.timeout) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	set(key: string, data: string): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	clear(): void {
		this.cache.clear();
	}

	getCacheKey(...parts: string[]): string {
		return parts.join("|");
	}
}

/**
 * OpenAI 服务实现
 */
class OpenAIService implements IAIService {
	private settings: SwiftPenSettings;
	private currentAbortController: AbortController | null = null;
	private cache: CacheManager;

	constructor(settings: SwiftPenSettings) {
		this.settings = settings;
		this.cache = new CacheManager(settings.cacheTimeout);
	}

	isConfigured(): boolean {
		return !!this.settings.openaiApiKey && !!this.settings.openaiBaseURL;
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
		if (!this.isConfigured()) {
			throw new Error("OpenAI 未配置，请检查 API Key 和 Base URL");
		}

		// 检查缓存
		if (this.settings.enableCache) {
			const cacheKey = this.cache.getCacheKey(contextBefore, contextAfter, userRequest);
			const cached = this.cache.get(cacheKey);
			if (cached) {
				yield cached;
				return;
			}
		}

		this.currentAbortController = new AbortController();
		const messages = [
			{
				role: "system",
				content: this.settings.systemPrompt
			},
			{
				role: "user",
				content: this.buildPrompt(contextBefore, contextAfter, userRequest)
			}
		];

		let fullResponse = "";
		let retryCount = 0;
		const maxRetries = 3;
		const baseDelay = 1000;

		while (retryCount <= maxRetries) {
			try {
				const response = await requestUrl({
					url: `${this.settings.openaiBaseURL}/chat/completions`,
					method: "POST",
					headers: {
						"Authorization": `Bearer ${this.settings.openaiApiKey}`,
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						model: this.settings.openaiModel,
						messages: messages,
						max_tokens: this.settings.maxTokens,
						temperature: this.settings.temperature,
						stream: true
					}),
					throw: false
				});

				if (response.status !== 200) {
					throw new Error(`API 请求失败: ${response.status}`);
				}

				// 处理流式响应
				const lines = response.text.split("\n");
				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.substring(6);
						if (data === "[DONE]") break;
						
						try {
							const parsed = JSON.parse(data);
							const content = parsed.choices?.[0]?.delta?.content;
							if (content) {
								fullResponse += content;
								yield content;
							}
						} catch (e) {
							// 忽略解析错误
						}
					}
				}

				// 保存到缓存
				if (this.settings.enableCache && fullResponse) {
					const cacheKey = this.cache.getCacheKey(contextBefore, contextAfter, userRequest);
					this.cache.set(cacheKey, fullResponse);
				}

				this.currentAbortController = null;
				return;

			} catch (error: any) {
				if (error.name === "AbortError") {
					throw new Error("操作已取消");
				}

				// 处理重试
				const status = error.status || 0;
				if ((status === 429 || status >= 500) && retryCount < maxRetries) {
					retryCount++;
					const delay = baseDelay * Math.pow(2, retryCount - 1);
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				}

				const errorMsg = this.parseError(error);
				if (onError) onError(new Error(errorMsg));
				throw new Error(errorMsg);
			}
		}
	}

	async translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
		if (!this.isConfigured()) {
			throw new Error("OpenAI 未配置");
		}

		const prompt = sourceLang && sourceLang !== "auto"
			? `将以下${sourceLang}文本翻译成${targetLang}，只输出翻译结果，不要添加任何解释：\n\n${text}`
			: `将以下文本翻译成${targetLang}，只输出翻译结果，不要添加任何解释：\n\n${text}`;

		const response = await requestUrl({
			url: `${this.settings.openaiBaseURL}/chat/completions`,
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.settings.openaiApiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: this.settings.openaiModel,
				messages: [
					{ role: "system", content: "你是一个专业的翻译助手。" },
					{ role: "user", content: prompt }
				],
				max_tokens: this.settings.maxTokens,
				temperature: 0.3
			})
		});

		return response.json.choices[0].message.content.trim();
	}

	private buildPrompt(contextBefore: string, contextAfter: string, userRequest: string): string {
		let prompt = "";
		if (contextBefore) prompt += `【光标前的内容】\n${contextBefore}\n\n`;
		prompt += `【光标位置】\n`;
		if (contextAfter) prompt += `\n【光标后的内容】\n${contextAfter}\n\n`;
		prompt += `【用户需求】\n${userRequest}\n\n`;
		prompt += `请根据上下文和用户需求，生成应该插入到【光标位置】的内容。请直接输出内容，不要包含任何解释或元信息。`;
		return prompt;
	}

	private parseError(error: any): string {
		if (error.message) return error.message;
		if (error.status === 401) return "API Key 无效";
		if (error.status === 403) return "访问被拒绝";
		if (error.status === 429) return "请求过于频繁";
		return `请求失败: ${error.toString()}`;
	}
}

/**
 * Gemini 服务实现
 */
class GeminiService implements IAIService {
	private settings: SwiftPenSettings;
	private currentAbortController: AbortController | null = null;
	private cache: CacheManager;

	constructor(settings: SwiftPenSettings) {
		this.settings = settings;
		this.cache = new CacheManager(settings.cacheTimeout);
	}

	isConfigured(): boolean {
		return !!this.settings.geminiApiKey;
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
		if (!this.isConfigured()) {
			throw new Error("Gemini 未配置，请检查 API Key");
		}

		// 检查缓存
		if (this.settings.enableCache) {
			const cacheKey = this.cache.getCacheKey(contextBefore, contextAfter, userRequest);
			const cached = this.cache.get(cacheKey);
			if (cached) {
				yield cached;
				return;
			}
		}

		this.currentAbortController = new AbortController();
		const prompt = this.buildPrompt(contextBefore, contextAfter, userRequest);
		
		let fullResponse = "";
		let retryCount = 0;
		const maxRetries = 3;

		while (retryCount <= maxRetries) {
			try {
				const url = `${this.settings.geminiBaseURL}/models/${this.settings.geminiModel}:streamGenerateContent?key=${this.settings.geminiApiKey}`;
				
				const response = await requestUrl({
					url,
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						contents: [{
							parts: [{
								text: prompt
							}]
						}],
						generationConfig: {
							temperature: this.settings.temperature,
							maxOutputTokens: this.settings.maxTokens
						}
					}),
					throw: false
				});

				if (response.status !== 200) {
					throw new Error(`Gemini API 请求失败: ${response.status}`);
				}

				// 处理流式响应
				const lines = response.text.split("\n");
				for (const line of lines) {
					if (line.trim() && !line.startsWith("[")) {
						try {
							const parsed = JSON.parse(line);
							const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
							if (content) {
								fullResponse += content;
								yield content;
							}
						} catch (e) {
							// 忽略解析错误
						}
					}
				}

				// 保存到缓存
				if (this.settings.enableCache && fullResponse) {
					const cacheKey = this.cache.getCacheKey(contextBefore, contextAfter, userRequest);
					this.cache.set(cacheKey, fullResponse);
				}

				this.currentAbortController = null;
				return;

			} catch (error: any) {
				if (error.name === "AbortError") {
					throw new Error("操作已取消");
				}

				if (retryCount < maxRetries) {
					retryCount++;
					await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
					continue;
				}

				const errorMsg = `Gemini 请求失败: ${error.message || error.toString()}`;
				if (onError) onError(new Error(errorMsg));
				throw new Error(errorMsg);
			}
		}
	}

	async translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
		if (!this.isConfigured()) {
			throw new Error("Gemini 未配置");
		}

		const prompt = sourceLang && sourceLang !== "auto"
			? `将以下${sourceLang}文本翻译成${targetLang}，只输出翻译结果：\n\n${text}`
			: `将以下文本翻译成${targetLang}，只输出翻译结果：\n\n${text}`;

		const url = `${this.settings.geminiBaseURL}/models/${this.settings.geminiModel}:generateContent?key=${this.settings.geminiApiKey}`;
		
		const response = await requestUrl({
			url,
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				contents: [{
					parts: [{
						text: prompt
					}]
				}],
				generationConfig: {
					temperature: 0.3
				}
			})
		});

		return response.json.candidates[0].content.parts[0].text.trim();
	}

	private buildPrompt(contextBefore: string, contextAfter: string, userRequest: string): string {
		let prompt = this.settings.systemPrompt + "\n\n";
		if (contextBefore) prompt += `【光标前的内容】\n${contextBefore}\n\n`;
		prompt += `【光标位置】\n`;
		if (contextAfter) prompt += `\n【光标后的内容】\n${contextAfter}\n\n`;
		prompt += `【用户需求】\n${userRequest}\n\n`;
		prompt += `请根据上下文和用户需求，生成应该插入到【光标位置】的内容。`;
		return prompt;
	}
}

/**
 * 自定义 AI 服务（兼容 OpenAI 格式）
 */
class CustomAIService implements IAIService {
	private settings: SwiftPenSettings;
	private currentAbortController: AbortController | null = null;
	private cache: CacheManager;

	constructor(settings: SwiftPenSettings) {
		this.settings = settings;
		this.cache = new CacheManager(settings.cacheTimeout);
	}

	isConfigured(): boolean {
		return !!this.settings.customApiKey && !!this.settings.customBaseURL && !!this.settings.customModel;
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
		if (!this.isConfigured()) {
			throw new Error("自定义 API 未完整配置");
		}

		// 检查缓存
		if (this.settings.enableCache) {
			const cacheKey = this.cache.getCacheKey(contextBefore, contextAfter, userRequest);
			const cached = this.cache.get(cacheKey);
			if (cached) {
				yield cached;
				return;
			}
		}

		// 使用类似 OpenAI 的实现
		this.currentAbortController = new AbortController();
		const messages = [
			{ role: "system", content: this.settings.systemPrompt },
			{ role: "user", content: this.buildPrompt(contextBefore, contextAfter, userRequest) }
		];

		let fullResponse = "";

		try {
			const response = await requestUrl({
				url: `${this.settings.customBaseURL}/chat/completions`,
				method: "POST",
				headers: {
					"Authorization": `Bearer ${this.settings.customApiKey}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					model: this.settings.customModel,
					messages,
					max_tokens: this.settings.maxTokens,
					temperature: this.settings.temperature,
					stream: true
				}),
				throw: false
			});

			if (response.status !== 200) {
				throw new Error(`自定义 API 请求失败: ${response.status}`);
			}

			const lines = response.text.split("\n");
			for (const line of lines) {
				if (line.startsWith("data: ")) {
					const data = line.substring(6);
					if (data === "[DONE]") break;
					
					try {
						const parsed = JSON.parse(data);
						const content = parsed.choices?.[0]?.delta?.content;
						if (content) {
							fullResponse += content;
							yield content;
						}
					} catch (e) {
						// 忽略
					}
				}
			}

			if (this.settings.enableCache && fullResponse) {
				const cacheKey = this.cache.getCacheKey(contextBefore, contextAfter, userRequest);
				this.cache.set(cacheKey, fullResponse);
			}

		} catch (error: any) {
			if (error.name === "AbortError") {
				throw new Error("操作已取消");
			}
			const errorMsg = `自定义 API 请求失败: ${error.message || error.toString()}`;
			if (onError) onError(new Error(errorMsg));
			throw new Error(errorMsg);
		}

		this.currentAbortController = null;
	}

	async translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
		if (!this.isConfigured()) {
			throw new Error("自定义 API 未配置");
		}

		const prompt = `将以下文本翻译成${targetLang}，只输出翻译结果：\n\n${text}`;

		const response = await requestUrl({
			url: `${this.settings.customBaseURL}/chat/completions`,
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.settings.customApiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: this.settings.customModel,
				messages: [
					{ role: "system", content: "你是一个专业的翻译助手。" },
					{ role: "user", content: prompt }
				],
				temperature: 0.3
			})
		});

		return response.json.choices[0].message.content.trim();
	}

	private buildPrompt(contextBefore: string, contextAfter: string, userRequest: string): string {
		let prompt = "";
		if (contextBefore) prompt += `【光标前的内容】\n${contextBefore}\n\n`;
		prompt += `【光标位置】\n`;
		if (contextAfter) prompt += `\n【光标后的内容】\n${contextAfter}\n\n`;
		prompt += `【用户需求】\n${userRequest}\n\n`;
		prompt += `请根据上下文和用户需求，生成应该插入到【光标位置】的内容。`;
		return prompt;
	}
}

