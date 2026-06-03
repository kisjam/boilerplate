/**
 * Tab
 *
 * @example
 * <div data-tab>
 *   <div data-tab-list>
 *     <button id="tab-all" data-tab-controls="panel-all" data-tab-default>すべて</button>
 *     <button id="tab-news" data-tab-controls="panel-news">お知らせ</button>
 *   </div>
 *   <div id="panel-all"></div>
 *   <div id="panel-news"></div>
 * </div>
 *
 * @usage
 * document.querySelectorAll<HTMLElement>("[data-tab]").forEach((el) => new Tab(el));
 */
export function init(): void {
	document.querySelectorAll<HTMLElement>("[data-tab]").forEach((el) => new Tab(el));
}

export class Tab {
	tabs: HTMLButtonElement[];
	panels: HTMLElement[];

	constructor(domNode: HTMLElement) {
		this.tabs = Array.from(domNode.querySelectorAll<HTMLButtonElement>("[data-tab-controls]"));
		this.panels = this.tabs
			.map((tab) => document.getElementById(tab.dataset.tabControls!))
			.filter((el): el is HTMLElement => el !== null);

		if (this.tabs.length === 0) {
			throw new Error("Tab: [data-tab-controls] が見つかりません");
		}

		domNode.querySelector<HTMLElement>("[data-tab-list]")?.setAttribute("role", "tablist");

		this.tabs.forEach((tab) => {
			tab.setAttribute("role", "tab");
			tab.setAttribute("aria-controls", tab.dataset.tabControls!);
			tab.setAttribute("aria-selected", "false");
			tab.setAttribute("tabindex", "-1");
			tab.addEventListener("click", () => this.activate(tab));
			tab.addEventListener("keydown", (e) => this.handleKeydown(e));
		});

		this.panels.forEach((panel) => {
			const tab = this.tabs.find((t) => t.dataset.tabControls === panel.id);
			panel.setAttribute("role", "tabpanel");
			if (tab?.id) panel.setAttribute("aria-labelledby", tab.id);
			panel.hidden = true;
		});

		const initial = this.tabs.find((t) => "tabDefault" in t.dataset) ?? this.tabs[0];
		this.activate(initial, false);
	}

	activate(tab: HTMLButtonElement, focus = true): void {
		this.tabs.forEach((t) => {
			t.setAttribute("aria-selected", "false");
			t.setAttribute("tabindex", "-1");
			t.classList.remove("is-selected");
		});
		this.panels.forEach((p) => {
			p.hidden = true;
		});

		tab.setAttribute("aria-selected", "true");
		tab.setAttribute("tabindex", "0");
		tab.classList.add("is-selected");
		if (focus) tab.focus();

		const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
		if (panel) panel.hidden = false;
	}

	handleKeydown(e: KeyboardEvent): void {
		const index = this.tabs.indexOf(e.currentTarget as HTMLButtonElement);
		const { length } = this.tabs;
		const map: Record<string, number> = {
			ArrowRight: (index + 1) % length,
			ArrowLeft: (index - 1 + length) % length,
			Home: 0,
			End: length - 1,
		};
		if (!(e.key in map)) return;
		e.preventDefault();
		this.activate(this.tabs[map[e.key]]);
	}
}
