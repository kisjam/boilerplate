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

## 📋 タスク管理（統合 TODO）

### 🔴 優先度: 高

#### PERF-001: 画像の遅延読み込み実装

- **状態**: 未着手
- **概要**: img 要素に loading="lazy"属性を追加し、初期表示を高速化
- **詳細**: 全 img 要素への自動付与、above-the-fold 画像の除外設定、効果測定の実装

#### PERF-002: Critical CSS 自動インライン化

- **状態**: 未着手
- **概要**: 初期表示に必要な CSS のみをインライン化
- **詳細**: ビルド時の自動抽出、インライン/外部 CSS 分割、非同期 CSS 読み込み

#### A11Y-001: スキップリンクの実装

- **状態**: 未着手
- **概要**: キーボードナビゲーション向上のためのスキップリンク
- **詳細**: メインコンテンツへのスキップ、ナビゲーションスキップ、スタイリングとアニメーション

#### A11Y-002: フォーカス管理の改善

- **状態**: 未着手
- **概要**: focus-visible 擬似クラスの活用
- **詳細**: キーボードフォーカスのみ表示、カスタムフォーカススタイル、フォーカストラップの実装

#### DX-001: Git pre-commit フック

- **状態**: 未着手
- **概要**: コミット前の自動品質チェック
- **詳細**: Biome での lint/format、ビルドテスト、コミットメッセージ検証

### 🟡 優先度: 中

#### COMP-001: モーダルコンポーネント

- **状態**: 未着手
- **概要**: アクセシブルなモーダルダイアログ
- **詳細**: フォーカストラップ、ESC キー対応、背景スクロール防止

#### COMP-002: トーストコンポーネント

- **状態**: 未着手
- **概要**: 通知メッセージ表示システム
- **詳細**: 自動消去タイマー、スタック表示、アクセシビリティ対応

#### COMP-003: SVG プレースホルダー実装

- **状態**: 未着手
- **概要**: 開発時の画像プレースホルダー生成システム
- **詳細**: SVG による動的プレースホルダー、サイズ指定対応、テキスト埋め込み機能

#### TEST-001: Vitest 環境構築

- **状態**: 未着手
- **概要**: ユニットテスト環境のセットアップ
- **詳細**: TypeScript 対応、カバレッジ設定、CI/CD 統合

#### DOC-001: Storybook 導入

- **状態**: 未着手
- **概要**: コンポーネントカタログの構築
- **詳細**: 全コンポーネントのストーリー、インタラクティブテスト、ドキュメント自動生成

### 🟢 優先度: 低

- **SEO-001**: 構造化データ実装（JSON-LD）
- **I18N-001**: 多言語対応基盤構築
- **SEC-001**: CSP ヘッダー実装

### ✅ 完了済み

- **PERF-005**: 画像 width/height 自動付与機能
- **BUILD-003**: ES モジュール（ESM）全面移行
- **CLEAN-002**: プロジェクト整理手順書作成
- **CSS-001**: Tailwind CSS v4 + FLOCSS カスケードレイヤー統合

## 🏗️ プロジェクトアーキテクチャ

### ビルドシステム

- **基盤**: npm scripts + Node.js API（Gulp から移行済み）
- **並列処理**: 高速ビルドのため複数タスク同時実行
- **ESM 対応**: 全ファイル ES モジュール化完了

### ディレクトリ構造

```
src/assets/
├── styles/        # Sassファイル（BEM命名、コンポーネント設計）
├── scripts/       # TypeScript（クラスベース、data属性初期化）
├── images/        # 画像（自動WebP変換、width/height自動付与）
└── html/          # LiquidJSテンプレート（Nunjucksから移行）
```

### 主要技術スタック

- **JS**: TypeScript + Vite（Webpack から移行）
- **CSS**: Sass + PostCSS + Autoprefixer + Tailwind CSS v4
- **HTML**: LiquidJS + 画像最適化
- **画像**: Sharp（WebP 変換 + サイズ自動検出）
- **品質**: Biome（ESLint から移行）

## 📝 作業履歴・技術的決定

### 🎯 重要な技術的決定

- **ESM 移行 (2025-06-02)**: CommonJS → ES モジュール全面移行
- **ビルドシステム (2025-06-02)**: Gulp → Node.js scripts + Vite
- **テンプレート (既存)**: Nunjucks → LiquidJS
- **品質ツール (既存)**: ESLint/Prettier → Biome
- **CSS アーキテクチャ (2025-06-08)**: FLOCSS + Tailwind CSS v4 カスケードレイヤー統合

### ✅ 完了した主要改善

- ESM 全面移行（package.json `"type": "module"`）
- npm scripts 簡素化（30+ → 7 個）
- 画像 width/height 自動付与機能実装
- ドキュメント統合（TODO.md, ARCHITECTURE.md 統合）
- プロジェクト整理手順書作成
- Tailwind CSS v4 統合（ユーティリティクラスのみ、カスケードレイヤー実装）
- CSS変数による spacing カスタマイズ（8px基準）

### 📊 現在のメトリクス

- **ビルド時間**: ~79ms (JavaScript)
- **バンドルサイズ**: 14.79 kB (gzip: 2.93 kB)
- **セキュリティ**: 脆弱性なし
- **品質**: Biome 設定済み

### 🗂️ 削除候補ファイル（整理時に処理）

- `src/assets/scripts/modules/disable-button-doubleclick.ts` - 未使用 JS モジュール
- `src/assets/styles/pages/about/_company.scss` - 空ファイル
- `src/assets/styles/pages/about/_hoge.scss` - テスト用空ファイル

## 開発コマンド

```bash
# Start development environment (builds files and starts dev server with watch mode)
npm run dev
# or
npm start

# Build all files
npm run build

# Production build with minification
npm run build:prod

# Build with cache (skips unchanged images)
npm run build:cached

# Watch files for changes
npm run watch

# Start development server only
npm run serve

# Clean dist directory
npm run clean

# Install dependencies
npm install
```

### プロジェクト整理コマンド

```bash
# プロジェクト全体の不要ファイル削除と整理（定期実行推奨）
# Claudeに以下のメッセージを送信してください：
"整理"
```

## ビルドシステムのアーキテクチャ

このプロジェクトは、すべてのビルドタスクに npm スクリプトを使用しています（Gulp 5.0 から移行）。

### タスク構造

- `build:images` - 画像を dist にコピー
- `build:images-webp` - jpg/png を WebP 形式に変換
- `build:images-webp:cached` - キャッシュ付き WebP 変換（変更されていないファイルをスキップ）
- `build:js` - Vite で TypeScript をバンドル、`dist/assets/js/bundle.js`に出力
- `build:css` - PostCSS を使用して Sass を CSS にコンパイル
- `build:html` - `_config/site.json`のデータを使用して Liquid テンプレートを処理（画像の width/height 自動付与機能含む）
- `build:copy` - `src/public/`から`dist/`に静的ファイルをコピー
- `serve` - ライブリロード機能付き BrowserSync 開発サーバー
- `watch` - すべてのソースファイルの変更を監視

ビルドシステムは、ファイル監視に chokidar、並列タスク実行に npm-run-all を使用しています。

### パフォーマンス最適化機能

#### 画像の width/height 自動付与

HTML ビルド時に、img 要素に自動的に width/height 属性を追加して CLS（Cumulative Layout Shift）を防止：

- 実装: `scripts/lib/image-size-processor.js`
- ビルド時に画像サイズを自動検出
- メモリキャッシュによる高速処理
- 外部 URL 画像はスキップ
- 既存の width/height 属性がある場合はスキップ

## コード構成

### Sass/CSS アーキテクチャ

新しいスタイルを作成する際は、以下の構造に従ってください：

- `components/` - 新しいコンポーネントの主な配置場所
  - `.button-XXX`、`.title-XXX`パターンを作成
  - ファイルが増えたら機能/役割別にグループ化（event/, nav/）
  - 検索しやすくするためフォルダ名をプレフィックスとして使用
- `layouts/` - サイト全体のレイアウトコンポーネント（ヘッダー、フッター）
- `pages/` - ページ固有のスタイル
- `global/` - ミックスイン（`mixin/`）と変数（`variable-css/`、`variable-sass/`）
- `utility/` - ユーティリティクラス

### TypeScript モジュール

すべての JavaScript モジュールは`src/assets/scripts/modules/`にあり、TypeScript の strict モードを使用しています。主要なモジュール：

- `base-module.ts` - すべてのモジュールの基底クラス
- `throttle.ts` - パフォーマンスユーティリティ（throttle、debounce、rafThrottle）
- `types.ts` - 共通型定義
- その他のモジュールはクラスベースで、data 属性を介して初期化されます

### HTML テンプレート

LiquidJS（Nunjucks から移行）を使用：

- 基本レイアウトは`_layouts/`に配置
- 再利用可能なコンポーネントは`_components/`に配置（旧`_partials/`を統合）
- サイト設定は`_config/site.json`に配置
- ページテンプレートは`pages/`に配置

## コード品質ツール

ESLint は standard と prettier の設定で構成されています。専用の npm スクリプトがないため、リンティングは手動で実行してください。

## 環境要件

- Node.js v16.17.1+
- npm v8.19+

## 重要な作業ルール

### ライブラリ使用時のルール

**⚠️ 重要: ライブラリを使用する際は必ず最新のドキュメントを確認する**

#### 確認手順

1. `package.json`でバージョンを確認
2. 公式ドキュメントまたは`node_modules/[ライブラリ名]/README.md`を参照
3. 特にメジャーバージョンアップでは破壊的変更に注意

#### 例: chokidar v4での重要な変更

- **v3**: `chokidar.watch('**/*.scss')` - globパターンサポート
- **v4**: globパターン削除、ディレクトリ監視 + `ignored`関数でフィルタリング

```javascript
// ❌ v4では動作しない
chokidar.watch(`${path}/**/*.scss`)

// ✅ v4での正しい方法
chokidar.watch(path, {
  ignored: (filePath, stats) => {
    if (stats?.isDirectory()) return false;
    return !filePath.endsWith('.scss');
  }
})
```

### Git コミットルール

このプロジェクトは[Conventional Commits](https://www.conventionalcommits.org/)仕様に従います：

```
<type>: <description>

[optional body]
```

#### タイプ

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマット等）
- `refactor`: バグ修正や機能追加を伴わないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `build`: ビルドシステムや外部依存の変更
- `chore`: その他の変更

#### 例

```bash
# 良い例
git commit -m "feat: アコーディオンコンポーネントを追加"
git commit -m "fix: モバイルメニューの表示崩れを修正"
git commit -m "refactor: build:cssタスクをNode.js APIに移行"
git commit -m "perf: 画像のWebP変換を並列処理化"

# 悪い例
git commit -m "Update styles"  # 英語は避ける（日本語プロジェクトの場合）
git commit -m "バグ修正"        # 具体的でない
```

#### 重要なルール

1. 日本語でコミットメッセージを書く（プロジェクトの主言語に合わせる）
2. 1 行目は 50 文字以内
3. 動詞で始める（追加、修正、変更、削除など）
4. 1 つのコミットは 1 つの論理的な変更のみ
5. 各主要タスクの完了後は必ずコミットを行う
6. コミット前に`npm run build`を実行し、すべてが正しくビルドされることを確認する
7. **Claudeの署名は含めない**（`Generated with Claude Code`や`Co-Authored-By: Claude`は不要）
8. **重要な変更をコミットしたらCLAUDE.mdを更新する**
   - 技術的決定事項は「🎯 重要な技術的決定」に記録
   - 完了したタスクは「✅ 完了済み」に移動
   - 新しい課題は「📋 タスク管理」に追加

### Git Add ルール

**⚠️ 重要: `git add -A` や `git add .` は使用禁止**

#### 理由

- 複数の作業が並行している可能性
- 意図しないファイルのコミットを防ぐ
- 変更内容の明確化

#### 正しい方法

```bash
# ❌ 悪い例
git add -A
git add .

# ✅ 良い例 - 関連ファイルのみを明示的に指定
git add package.json build.config.js
git add scripts/tasks/build-css.js scripts/tasks/sass-glob.js
git add src/assets/sass/components/_button.scss

# ✅ パターンを使用する場合も慎重に
git add scripts/tasks/*.js  # tasksディレクトリのJSファイルのみ
```

#### 推奨プロセス

1. `git status` で変更されたファイルを確認
2. 今回のタスクに関連するファイルのみを特定
3. 関連ファイルを個別に `git add` で追加
4. `git status` で追加されたファイルを再確認
5. コミット実行

### タスク管理

- TodoWrite/TodoRead ツールを使用してすべてのタスクを追跡する
- タスクを完了したらすぐに完了とマークする
- 主要な作業の完了後は git コミットをタスクアイテムとして追加する

### コードスタイル

- 特に要求されない限りコメントを追加しない
- 既存のコードパターンと規則に従う
- すべての新しいモジュールで TypeScript strict モードを使用する
- 適切なエラーハンドリングとクリーンアップメソッドを実装する

### セッション間の同期と WORK_LOG 運用

複数の Claude Code セッションで作業する場合：

1. 作業開始時に`WORK_LOG.md`を確認
2. 重要な変更は`WORK_LOG.md`に記録
3. ファイルの移動や削除は特に注意して記録
4. `git status`で他セッションの変更を確認

#### WORK_LOG 記録ルール（重要）

**必須記録対象:**

- 技術的変更（アーキテクチャ、ライブラリ移行など）
- 設定ファイル変更（package.json、tsconfig.json など）
- ビルドシステム変更（scripts 追加・削除・修正）
- 問題解決（エラーの原因と対処法）
- パフォーマンス改善

**記録フォーマット:**

```
### [時刻] カテゴリ: 作業内容
- **変更内容**: 具体的な変更
- **理由**: なぜその変更が必要だったか
- **影響**: システムへの影響や注意点
- **関連ファイル**: 変更されたファイル一覧
```

**カテゴリ:** BUILD, CONFIG, DEPS, PERF, REFACTOR, FIX, DOCS, TOOLS

## メモ

- dist/には Webp だけコピーしたい
- watch が聞いてない
