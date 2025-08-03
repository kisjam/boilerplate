/**
 * Clipboard Copy Module
 * data-copy-clipboard属性を持つ要素をクリックしたときにクリップボードにコピー
 */

import { showMessage } from "./message";

export function initClipboardCopy(): void {
	const copyElements = document.querySelectorAll("[data-copy-clipboard]");

	for (const element of copyElements) {
		if (element instanceof HTMLElement) {
			element.addEventListener("click", handleCopyClick);
		}
	}
}

async function handleCopyClick(event: Event): Promise<void> {
	event.preventDefault();

	const element = event.currentTarget as HTMLElement;
	const textToCopy = element.getAttribute("data-copy-clipboard");

	if (!textToCopy) {
		console.warn("data-copy-clipboard属性が空です");
		return;
	}

	try {
		if (navigator.clipboard && window.isSecureContext) {
			// モダンなClipboard APIを使用
			await navigator.clipboard.writeText(textToCopy);
		} else {
			// フォールバック: 旧来の方法
			await copyTextFallback(textToCopy);
		}

		// コピー成功のメッセージ表示
		showMessage(`コピーしました: ${textToCopy}`);
	} catch (error) {
		console.error("クリップボードへのコピーに失敗しました:", error);
		showMessage("クリップボードへのコピーに失敗しました");
	}
}

function copyTextFallback(text: string): Promise<void> {
	return new Promise((resolve, reject) => {
		// 一時的なtextarea要素を作成
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		textarea.style.pointerEvents = "none";

		document.body.appendChild(textarea);

		try {
			textarea.select();
			textarea.setSelectionRange(0, textarea.value.length);

			const successful = document.execCommand("copy");
			if (successful) {
				resolve();
			} else {
				reject(new Error("document.execCommand('copy') failed"));
			}
		} catch (error) {
			reject(error);
		} finally {
			document.body.removeChild(textarea);
		}
	});
}