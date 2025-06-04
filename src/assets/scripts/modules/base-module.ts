export interface BaseOptions {
	// biome-ignore lint/suspicious/noExplicitAny: Options type is intentionally flexible
	[key: string]: any;
}

export abstract class BaseModule<T extends BaseOptions = BaseOptions> {
	protected element: HTMLElement;
	protected options: T;
	protected isInitialized = false;

	constructor(element: HTMLElement, options?: Partial<T>) {
		this.element = element;
		this.options = this.mergeOptions(options);
	}

	protected abstract getDefaultOptions(): T;

	protected mergeOptions(options?: Partial<T>): T {
		return {
			...this.getDefaultOptions(),
			...options,
		} as T;
	}

	init(): void {
		if (this.isInitialized) return;

		this.setupEventListeners();
		this.isInitialized = true;
	}

	destroy(): void {
		if (!this.isInitialized) return;

		this.removeEventListeners();
		this.isInitialized = false;
	}

	protected abstract setupEventListeners(): void;
	protected abstract removeEventListeners(): void;

	static initializeAll<M extends BaseModule>(
		selector: string,
		// biome-ignore lint/suspicious/noExplicitAny: ModuleClass constructor accepts flexible options
		ModuleClass: new (element: HTMLElement, options?: any) => M,
	): M[] {
		const elements = document.querySelectorAll<HTMLElement>(selector);
		const instances: M[] = [];

		for (const element of elements) {
			const instance = new ModuleClass(element);
			instance.init();
			instances.push(instance);
		}

		return instances;
	}
}
