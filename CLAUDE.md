# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際の包括的ガイドラインです。
セッション間の継続性と作業効率のため、すべての重要情報をここに集約しています。

## 📋 プロジェクト現状（最終更新: 2025-06-06）

### ✅ 完了済み重要機能

- **PERF-005**: 画像 width/height 自動付与機能 - CLS 防止
- **BUILD-003**: ES モジュール（ESM）全面移行完了
- **CLEAN-002**: プロジェクト整理手順書作成
- **PERF-006**: CSS/HTML 部分ビルド実装 - パフォーマンス最適化
- **PERF-007**: デバウンス機能実装 - 連続変更対応
- **DX-002**: スクリプト品質向上 - 未使用変数削除
- **PERF-008**: Liquid 単一ページビルド実装 - pages/ ディレクトリ高速化

### 🚀 次回優先タスク

1. **PERF-001**: 画像遅延読み込み実装
2. **PERF-002**: Critical CSS 自動インライン化
3. **COMP-003**: SVG プレースホルダー実装
4. **DX-001**: Git pre-commit フック
5. **削除候補ファイル整理**: disable-button-doubleclick.ts, \_company.scss, \_hoge.scss

### 🔧 今後の改善検討項目

- **DX-003**: プログレス表示の追加検討（長時間操作用）
- **DX-004**: ビルドスクリプトのTypeScriptサポート検討

### ⚡ 重要技術情報

- **画像処理**: `scripts/lib/image-size-processor.js` で width/height 自動付与
- **ESM 対応**: package.json `"type": "module"` 設定済み
- **ビルド**: `npm run build` 完全動作確認済み
- **ウォッチャー**: partial/共通ファイル変更時のみ全体ビルド実行
- **デバウンス**: 100ms で連続変更をまとめて処理
- **単一ページビルド**: `build-html.js --single <file>` で個別ページビルド可能

### 🎨 CSS アーキテクチャ (2025-06-08)

#### Tailwind CSS v4 + FLOCSS 統合完了

**構成:**
- **FLOCSS**: Foundation, Layout, Component, Page レイヤー（Utilities除外）
- **Tailwind CSS v4**: ユーティリティクラスのみ使用（preflight無効）
- **カスケードレイヤー**: `@layer base, layouts, components, pages, utilities;`

**重要設定:**
1. **tailwind.config.js**
   - `corePlugins.preflight: false` - Sassのリセット使用
   - screensのみ定義（v4では多くの設定がCSS変数に移行）

2. **CSS変数カスタマイズ**
   - `src/assets/styles/_layers.scss`で`@theme`ディレクティブ使用
   - `--spacing: 8px` - 基本単位を4pxから8pxに変更

3. **ビルドプロセス**
   - Sass → PostCSS(Tailwind + Autoprefixer) の順で処理
   - Tailwindはthemeとutilitiesレイヤーのみインポート