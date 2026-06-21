import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { clearCache, processImageSizes } from "../scripts/lib/image-size.js";

// 1x1 PNG
const PNG_1x1 = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgYGAAAAAEAAH2FzhVAAAAAElFTkSuQmCC",
	"base64",
);

function tmpDistWithImage() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "imgsize-"));
	fs.writeFileSync(path.join(dir, "x.png"), PNG_1x1);
	return dir;
}

test("ローカル画像に width/height を補完", () => {
	clearCache();
	const dist = tmpDistWithImage();
	const out = processImageSizes('<img src="/x.png" alt="a">', dist);
	assert.match(out, /width="1"/);
	assert.match(out, /height="1"/);
});

test("外部 URL はスキップ", () => {
	clearCache();
	const html = '<img src="https://example.com/y.png">';
	assert.equal(processImageSizes(html, tmpDistWithImage()), html);
});

test("protocol-relative URL はスキップ", () => {
	clearCache();
	const html = '<img src="//cdn.example.com/y.png">';
	assert.equal(processImageSizes(html, tmpDistWithImage()), html);
});

test("width/height 両方ある場合はそのまま", () => {
	clearCache();
	const html = '<img src="/x.png" width="10" height="20">';
	assert.equal(processImageSizes(html, tmpDistWithImage()), html);
});

test("存在しない画像はそのまま（属性追加しない）", () => {
	clearCache();
	const html = '<img src="/missing.png">';
	assert.equal(processImageSizes(html, tmpDistWithImage()), html);
});

test("相対パスと絶対パスで同じ画像を解決（分岐バグ回帰）", () => {
	clearCache();
	const dist = tmpDistWithImage();
	const abs = processImageSizes('<img src="/x.png">', dist);
	const rel = processImageSizes('<img src="x.png">', dist);
	assert.match(abs, /width="1"/);
	assert.match(rel, /width="1"/);
});
