import { Editor } from "obsidian";

export interface EditorContext {
	textBefore: string;
	textAfter: string;
	cursorPosition: number;
	selectedText: string;
	fullText: string;
}

export class ContextExtractor {
	/**
	 * 从编辑器中提取上下文
	 * @param editor Obsidian 编辑器实例
	 * @param maxCharsBefore 光标前最大字符数
	 * @param maxCharsAfter 光标后最大字符数
	 */
	static extract(
		editor: Editor,
		maxCharsBefore: number,
		maxCharsAfter: number
	): EditorContext {
		const cursor = editor.getCursor();
		const fullText = editor.getValue();
		const cursorOffset = editor.posToOffset(cursor);

		// 获取选中文本
		const selectedText = editor.getSelection();

		// 提取光标前的文本
		let textBefore = fullText.substring(0, cursorOffset);
		if (textBefore.length > maxCharsBefore) {
			// 尝试在合适的位置截断，保持 Markdown 结构完整
			textBefore = this.smartTruncateBefore(textBefore, maxCharsBefore);
		}

		// 提取光标后的文本
		let textAfter = fullText.substring(cursorOffset);
		if (textAfter.length > maxCharsAfter) {
			textAfter = this.smartTruncateAfter(textAfter, maxCharsAfter);
		}

		return {
			textBefore,
			textAfter,
			cursorPosition: cursorOffset,
			selectedText,
			fullText
		};
	}

	/**
	 * 智能截断光标前的文本，尽量保持结构完整
	 */
	private static smartTruncateBefore(text: string, maxChars: number): string {
		if (text.length <= maxChars) {
			return text;
		}

		// 从 maxChars 位置往前找合适的截断点
		const startPos = text.length - maxChars;
		const searchText = text.substring(startPos);

		// 优先在段落边界截断
		const paragraphBreak = searchText.indexOf("\n\n");
		if (paragraphBreak !== -1 && paragraphBreak < maxChars * 0.3) {
			return "..." + searchText.substring(paragraphBreak + 2);
		}

		// 其次在行边界截断
		const lineBreak = searchText.indexOf("\n");
		if (lineBreak !== -1 && lineBreak < maxChars * 0.2) {
			return "..." + searchText.substring(lineBreak + 1);
		}

		// 最后在句子边界截断
		const sentenceEnds = [". ", "。", "! ", "！", "? ", "？", "\n"];
		for (const end of sentenceEnds) {
			const pos = searchText.indexOf(end);
			if (pos !== -1 && pos < maxChars * 0.2) {
				return "..." + searchText.substring(pos + end.length);
			}
		}

		// 如果都找不到，直接截断
		return "..." + searchText;
	}

	/**
	 * 智能截断光标后的文本，尽量保持结构完整
	 */
	private static smartTruncateAfter(text: string, maxChars: number): string {
		if (text.length <= maxChars) {
			return text;
		}

		// 从开始往后找合适的截断点
		const searchText = text.substring(0, maxChars);

		// 优先在段落边界截断
		const paragraphBreak = searchText.lastIndexOf("\n\n");
		if (paragraphBreak !== -1 && paragraphBreak > maxChars * 0.7) {
			return searchText.substring(0, paragraphBreak) + "...";
		}

		// 其次在行边界截断
		const lineBreak = searchText.lastIndexOf("\n");
		if (lineBreak !== -1 && lineBreak > maxChars * 0.8) {
			return searchText.substring(0, lineBreak) + "...";
		}

		// 最后在句子边界截断
		const sentenceEnds = [". ", "。", "! ", "！", "? ", "？"];
		for (let i = searchText.length - 1; i >= maxChars * 0.8; i--) {
			for (const end of sentenceEnds) {
				if (searchText.substring(i).startsWith(end)) {
					return searchText.substring(0, i + end.length) + "...";
				}
			}
		}

		// 如果都找不到，直接截断
		return searchText + "...";
	}

	/**
	 * 格式化上下文以供显示
	 */
	static formatForDisplay(context: EditorContext, maxLength: number = 100): string {
		const before = context.textBefore.slice(-maxLength).trim();
		const after = context.textAfter.slice(0, maxLength).trim();

		let display = "";
		if (before) {
			display += "..." + before;
		}
		display += " [光标] ";
		if (after) {
			display += after + "...";
		}

		return display;
	}
}

