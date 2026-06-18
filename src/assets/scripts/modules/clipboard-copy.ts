/**
 * Clipboard Copy Module
 * data-copy-clipboard属性を持つ要素をクリックしたときにクリップボードにコピー
 */

export function init(): void {
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
			await navigator.clipboard.writeText(textToCopy);
		} else {
			await copyTextFallback(textToCopy);
		}

		showToast(`コピーしました: ${textToCopy}`);
	} catch (error) {
		console.error("クリップボードへのコピーに失敗しました:", error);
		showToast("クリップボードへのコピーに失敗しました");
	}
}

function showToast(message: string): void {
	const toast = document.createElement("div");
	toast.textContent = message;
	toast.className =
		"fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded shadow-lg opacity-0 transition-opacity duration-300 pointer-events-none z-50";
	document.body.appendChild(toast);

	requestAnimationFrame(() => {
		toast.classList.remove("opacity-0");
		toast.classList.add("opacity-100");
	});

	setTimeout(() => {
		toast.classList.remove("opacity-100");
		toast.classList.add("opacity-0");
		toast.addEventListener("transitionend", () => toast.remove(), { once: true });
	}, 2000);
}

function copyTextFallback(text: string): Promise<void> {
	return new Promise((resolve, reject) => {
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
