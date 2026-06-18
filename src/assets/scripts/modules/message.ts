/**
 * Message Module
 * c-messageコンポーネントを使用してリッチなメッセージを表示
 */

export interface MessageOptions {
	duration?: number;
	autoHide?: boolean;
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

	hideMessage();

	const messageElement = createMessageElement(text);
	document.body.appendChild(messageElement);

	requestAnimationFrame(() => {
		messageElement.classList.add("-show");
	});

	currentMessage = messageElement;

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

	if (hideTimeout) {
		clearTimeout(hideTimeout);
		hideTimeout = null;
	}

	currentMessage.classList.remove("-show");

	const messageToRemove = currentMessage;
	currentMessage = null;

	setTimeout(() => {
		if (messageToRemove?.parentNode) {
			messageToRemove.parentNode.removeChild(messageToRemove);
		}
	}, 300);
}

/**
 * メッセージ要素を作成
 */
function createMessageElement(text: string): HTMLElement {
	const messageElement = document.createElement("div");
	messageElement.className = "c-message";
	messageElement.textContent = text;

	messageElement.addEventListener("click", hideMessage);

	return messageElement;
}
