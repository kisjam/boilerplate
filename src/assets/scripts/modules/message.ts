/**
 * Message Module
 * c-messageコンポーネントを使用してリッチなメッセージを表示
 */

export interface MessageOptions {
	duration?: number; // メッセージ表示時間（ミリ秒）
	autoHide?: boolean; // 自動で非表示にするか
}

const DEFAULT_OPTIONS: Required<MessageOptions> = {
	duration: 3000,
	autoHide: true,
};

let currentMessage: HTMLElement | null = null;
let hideTimeout: number | null = null;

/**
 * メッセージを表示
 */
export function showMessage(text: string, options: MessageOptions = {}): void {
	const config = { ...DEFAULT_OPTIONS, ...options };

	// 既存のメッセージがある場合は削除
	hideMessage();

	// メッセージ要素を作成
	const messageElement = createMessageElement(text);
	document.body.appendChild(messageElement);

	// DOM挿入後にアニメーションを開始
	requestAnimationFrame(() => {
		messageElement.classList.add("-show");
	});

	currentMessage = messageElement;

	// 自動非表示の設定
	if (config.autoHide) {
		hideTimeout = window.setTimeout(() => {
			hideMessage();
		}, config.duration);
	}
}

/**
 * メッセージを非表示
 */
export function hideMessage(): void {
	if (!currentMessage) return;

	// タイムアウトをクリア
	if (hideTimeout) {
		clearTimeout(hideTimeout);
		hideTimeout = null;
	}

	// アニメーション終了後に要素を削除
	currentMessage.classList.remove("-show");
	
	const messageToRemove = currentMessage;
	currentMessage = null;

	// トランジション終了後に要素を削除
	setTimeout(() => {
		if (messageToRemove && messageToRemove.parentNode) {
			messageToRemove.parentNode.removeChild(messageToRemove);
		}
	}, 300); // CSSのtransition時間と合わせる
}

/**
 * メッセージ要素を作成
 */
function createMessageElement(text: string): HTMLElement {
	const messageElement = document.createElement("div");
	messageElement.className = "c-message";
	messageElement.textContent = text;

	// クリックで非表示
	messageElement.addEventListener("click", hideMessage);

	return messageElement;
}