import assert from "node:assert/strict";
import { test } from "node:test";
import { parseArgs } from "../scripts/core/args.js";

const argv = (...rest) => ["node", "script.js", ...rest];

test("引数なし", () => {
	assert.deepEqual(parseArgs(argv()), { prod: false, single: null, force: false });
});

test("--prod", () => {
	assert.equal(parseArgs(argv("--prod")).prod, true);
});

test("--force", () => {
	assert.equal(parseArgs(argv("--force")).force, true);
});

test("--single <path>", () => {
	assert.equal(parseArgs(argv("--single", "src/a.liquid")).single, "src/a.liquid");
});

test("-s エイリアス", () => {
	assert.equal(parseArgs(argv("-s", "src/a.png")).single, "src/a.png");
});

test("--single のスペース入りパス（未クォート）を連結", () => {
	assert.equal(parseArgs(argv("--single", "my", "file.png")).single, "my file.png");
});

test("--single の値は次のフラグで止まる", () => {
	const r = parseArgs(argv("--single", "a.png", "--prod"));
	assert.equal(r.single, "a.png");
	assert.equal(r.prod, true);
});

test("--single に値が続かなければ null", () => {
	assert.equal(parseArgs(argv("--single", "--prod")).single, null);
});

test("複合: --prod --single", () => {
	assert.deepEqual(parseArgs(argv("--prod", "--single", "x.scss")), {
		prod: true,
		single: "x.scss",
		force: false,
	});
});
