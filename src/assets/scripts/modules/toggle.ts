/**
 * Toggle Module
 * data-toggle属性で指定したセレクタの要素に対して
 * is-collapsed / is-expanded をトグルする
 *
 * data-toggle-outside-close をトリガーに付けると targets外クリックで閉じる
 */

export function init(): void {
	for (const trigger of document.querySelectorAll<HTMLElement>("[data-toggle]")) {
		const selector = trigger.dataset.toggle;
		if (!selector) continue;
		updateAria(trigger, allExpanded(getTargets(selector)));
		trigger.addEventListener("click", handleToggleClick);
	}

	document.addEventListener("click", handleOutsideClick);
}

function handleToggleClick(event: Event): void {
	event.preventDefault();

	const trigger = event.currentTarget;
	if (!(trigger instanceof HTMLElement)) return;

	const selector = trigger.dataset.toggle;
	if (!selector) {
		console.warn("data-toggle属性が空です");
		return;
	}

	const targets = getTargets(selector);
	if (targets.length === 0) {
		console.warn(`data-toggleの対象が見つかりません: ${selector}`);
		return;
	}

	setState(trigger, targets, !allExpanded(targets));
}

function handleOutsideClick(event: MouseEvent): void {
	const clicked = event.target as Node;

	for (const trigger of document.querySelectorAll<HTMLElement>(
		"[data-toggle][data-toggle-outside-close]",
	)) {
		const selector = trigger.dataset.toggle;
		if (!selector) continue;
		const targets = getTargets(selector);
		if (!targets.some((t) => t.classList.contains("is-expanded"))) continue;
		if (!trigger.contains(clicked) && targets.every((t) => !t.contains(clicked))) {
			setState(trigger, targets, false);
		}
	}
}

function getTargets(selector: string): HTMLElement[] {
	return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

function allExpanded(targets: HTMLElement[]): boolean {
	return targets.every((t) => t.classList.contains("is-expanded"));
}

function setState(trigger: HTMLElement, targets: HTMLElement[], isExpanded: boolean): void {
	for (const target of targets) {
		target.classList.toggle("is-expanded", isExpanded);
		target.classList.toggle("is-collapsed", !isExpanded);
	}
	updateAria(trigger, isExpanded);
}

function updateAria(trigger: HTMLElement, isExpanded: boolean): void {
	trigger.setAttribute("aria-expanded", String(isExpanded));
	const selector = trigger.dataset.toggle;
	if (selector?.startsWith("#") && !selector.includes(" ")) {
		trigger.setAttribute("aria-controls", selector.slice(1));
	}
}
