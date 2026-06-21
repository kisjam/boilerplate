// Swiper の遅延ロード用バンドル面。使用モジュールだけを静的 import して
// tree-shaking を効かせ、app.ts からは `await import("./swiper-bundle")` で読む。
// カルーセルの可変設定は app.ts 側に残す（[[boilerplate-volatile-code-stays-in-app]]）。
export { default as Swiper } from "swiper";
export { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
