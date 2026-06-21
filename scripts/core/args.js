/**
 * CLI 引数のパース（純粋関数）
 * @param {string[]} argv - process.argv 相当（先頭2要素 node/script を含む）
 * @returns {{ prod: boolean, single: string|null, force: boolean }}
 */
export function parseArgs(argv) {
	const args = argv.slice(2);

	const prod = args.includes("--prod");
	const force = args.includes("--force");

	const singleIndex = args.findIndex((a) => a === "--single" || a === "-s");
	let single = null;
	if (singleIndex !== -1) {
		// --single の後続を、次のフラグ直前まで連結（未クォートのスペース入りパスに対応）
		const parts = [];
		for (const a of args.slice(singleIndex + 1)) {
			if (a.startsWith("-")) break;
			parts.push(a);
		}
		single = parts.length > 0 ? parts.join(" ") : null;
	}

	return { prod, single, force };
}
