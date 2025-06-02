# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際の包括的ガイドラインです。
セッション間の継続性と作業効率のため、すべての重要情報をここに集約しています。

## 📋 プロジェクト現状（最終更新: 2025-06-02）

### ✅ 完了済み重要機能
- **PERF-005**: 画像width/height自動付与機能 - CLS防止
- **BUILD-003**: ESモジュール（ESM）全面移行完了
- **CLEAN-002**: プロジェクト整理手順書作成

### 🚀 次回優先タスク
1. **PERF-001**: 画像遅延読み込み実装
2. **PERF-002**: Critical CSS自動インライン化
3. **DX-001**: Git pre-commitフック
4. **削除候補ファイル整理**: disable-button-doubleclick.ts, _company.scss, _hoge.scss

### ⚡ 重要技術情報
- **画像処理**: `scripts/lib/image-size-processor.js` でwidth/height自動付与
- **ESM対応**: package.json `"type": "module"` 設定済み
- **ビルド**: `npm run build` 完全動作確認済み

## 📋 タスク管理（統合TODO）

### 🔴 優先度: 高

#### PERF-001: 画像の遅延読み込み実装
- **状態**: 未着手
- **概要**: img要素にloading="lazy"属性を追加し、初期表示を高速化
- **詳細**: 全img要素への自動付与、above-the-fold画像の除外設定、効果測定の実装

#### PERF-002: Critical CSS自動インライン化
- **状態**: 未着手
- **概要**: 初期表示に必要なCSSのみをインライン化
- **詳細**: ビルド時の自動抽出、インライン/外部CSS分割、非同期CSS読み込み

#### A11Y-001: スキップリンクの実装
- **状態**: 未着手
- **概要**: キーボードナビゲーション向上のためのスキップリンク
- **詳細**: メインコンテンツへのスキップ、ナビゲーションスキップ、スタイリングとアニメーション

#### A11Y-002: フォーカス管理の改善
- **状態**: 未着手
- **概要**: focus-visible擬似クラスの活用
- **詳細**: キーボードフォーカスのみ表示、カスタムフォーカススタイル、フォーカストラップの実装

#### DX-001: Git pre-commitフック
- **状態**: 未着手
- **概要**: コミット前の自動品質チェック
- **詳細**: Biomeでのlint/format、ビルドテスト、コミットメッセージ検証

### 🟡 優先度: 中

#### COMP-001: モーダルコンポーネント
- **状態**: 未着手
- **概要**: アクセシブルなモーダルダイアログ
- **詳細**: フォーカストラップ、ESCキー対応、背景スクロール防止

#### COMP-002: トーストコンポーネント
- **状態**: 未着手
- **概要**: 通知メッセージ表示システム
- **詳細**: 自動消去タイマー、スタック表示、アクセシビリティ対応

#### TEST-001: Vitest環境構築
- **状態**: 未着手
- **概要**: ユニットテスト環境のセットアップ
- **詳細**: TypeScript対応、カバレッジ設定、CI/CD統合

#### DOC-001: Storybook導入
- **状態**: 未着手
- **概要**: コンポーネントカタログの構築
- **詳細**: 全コンポーネントのストーリー、インタラクティブテスト、ドキュメント自動生成

### 🟢 優先度: 低
- **SEO-001**: 構造化データ実装（JSON-LD）
- **I18N-001**: 多言語対応基盤構築
- **SEC-001**: CSPヘッダー実装

### ✅ 完了済み
- **PERF-005**: 画像width/height自動付与機能
- **BUILD-003**: ESモジュール（ESM）全面移行
- **CLEAN-002**: プロジェクト整理手順書作成

## 🏗️ プロジェクトアーキテクチャ

### ビルドシステム
- **基盤**: npm scripts + Node.js API（Gulpから移行済み）
- **並列処理**: 高速ビルドのため複数タスク同時実行
- **ESM対応**: 全ファイルESモジュール化完了

### ディレクトリ構造
```
src/assets/
├── sass/          # Sassファイル（BEM命名、コンポーネント設計）
├── js/            # TypeScript（クラスベース、data属性初期化）
├── images/        # 画像（自動WebP変換、width/height自動付与）
└── html/          # LiquidJSテンプレート（Nunjucksから移行）
```

### 主要技術スタック
- **JS**: TypeScript + Vite（Webpackから移行）
- **CSS**: Sass + PostCSS + Autoprefixer
- **HTML**: LiquidJS + 画像最適化
- **画像**: Sharp（WebP変換 + サイズ自動検出）
- **品質**: Biome（ESLintから移行）

## 📝 作業履歴・技術的決定

### 🎯 重要な技術的決定
- **ESM移行 (2025-06-02)**: CommonJS → ESモジュール全面移行
- **ビルドシステム (2025-06-02)**: Gulp → Node.js scripts + Vite
- **テンプレート (既存)**: Nunjucks → LiquidJS
- **品質ツール (既存)**: ESLint/Prettier → Biome

### ✅ 完了した主要改善
- ESM全面移行（package.json `"type": "module"`）
- npm scripts簡素化（30+ → 7個）
- 画像width/height自動付与機能実装
- ドキュメント統合（TODO.md, ARCHITECTURE.md統合）
- プロジェクト整理手順書作成

### 📊 現在のメトリクス
- **ビルド時間**: ~79ms (JavaScript)
- **バンドルサイズ**: 14.79 kB (gzip: 2.93 kB)
- **セキュリティ**: 脆弱性なし
- **品質**: Biome設定済み

### 🗂️ 削除候補ファイル（整理時に処理）
- `src/assets/js/modules/disable-button-doubleclick.ts` - 未使用JSモジュール
- `src/assets/sass/pages/about/_company.scss` - 空ファイル
- `src/assets/sass/pages/about/_hoge.scss` - テスト用空ファイル

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

このプロジェクトは、すべてのビルドタスクにnpmスクリプトを使用しています（Gulp 5.0から移行）。

### タスク構造
- `build:images` - 画像をdistにコピー
- `build:images-webp` - jpg/pngをWebP形式に変換
- `build:images-webp:cached` - キャッシュ付きWebP変換（変更されていないファイルをスキップ）
- `build:js` - ViteでTypeScriptをバンドル、`dist/assets/js/bundle.js`に出力
- `build:css` - PostCSSを使用してSassをCSSにコンパイル
- `build:html` - `_config/site.json`のデータを使用してLiquidテンプレートを処理（画像のwidth/height自動付与機能含む）
- `build:copy` - `src/public/`から`dist/`に静的ファイルをコピー
- `serve` - ライブリロード機能付きBrowserSync開発サーバー
- `watch` - すべてのソースファイルの変更を監視

ビルドシステムは、ファイル監視にchokidar、並列タスク実行にnpm-run-allを使用しています。

### パフォーマンス最適化機能

#### 画像のwidth/height自動付与
HTMLビルド時に、img要素に自動的にwidth/height属性を追加してCLS（Cumulative Layout Shift）を防止：
- 実装: `scripts/lib/image-size-processor.js`
- ビルド時に画像サイズを自動検出
- メモリキャッシュによる高速処理
- 外部URL画像はスキップ
- 既存のwidth/height属性がある場合はスキップ

## コード構成

### Sass/CSSアーキテクチャ
新しいスタイルを作成する際は、以下の構造に従ってください：
- `components/` - 新しいコンポーネントの主な配置場所
  - `.button-XXX`、`.title-XXX`パターンを作成
  - ファイルが増えたら機能/役割別にグループ化（event/, nav/）
  - 検索しやすくするためフォルダ名をプレフィックスとして使用
- `layouts/` - サイト全体のレイアウトコンポーネント（ヘッダー、フッター）
- `pages/` - ページ固有のスタイル
- `global/` - ミックスイン（`mixin/`）と変数（`variable-css/`、`variable-sass/`）
- `utility/` - ユーティリティクラス

### TypeScriptモジュール
すべてのJavaScriptモジュールは`src/assets/js/modules/`にあり、TypeScriptのstrictモードを使用しています。主要なモジュール：
- `base-module.ts` - すべてのモジュールの基底クラス
- `throttle.ts` - パフォーマンスユーティリティ（throttle、debounce、rafThrottle）
- `types.ts` - 共通型定義
- その他のモジュールはクラスベースで、data属性を介して初期化されます

### HTMLテンプレート
LiquidJS（Nunjucksから移行）を使用：
- 基本レイアウトは`_layouts/`に配置
- 再利用可能なコンポーネントは`_components/`に配置
- 再利用可能なパーシャルは`_partials/`に配置
- サイト設定は`_config/site.json`に配置
- ページテンプレートは`pages/`に配置

## コード品質ツール

ESLintはstandardとprettierの設定で構成されています。専用のnpmスクリプトがないため、リンティングは手動で実行してください。

## 環境要件
- Node.js v16.17.1+
- npm v8.19+

## 重要な作業ルール

### Gitコミットルール

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
2. 1行目は50文字以内
3. 動詞で始める（追加、修正、変更、削除など）
4. 1つのコミットは1つの論理的な変更のみ
5. 各主要タスクの完了後は必ずコミットを行う
6. コミット前に`npm run build`を実行し、すべてが正しくビルドされることを確認する

### Git Addルール

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
- TodoWrite/TodoReadツールを使用してすべてのタスクを追跡する
- タスクを完了したらすぐに完了とマークする
- 主要な作業の完了後はgitコミットをタスクアイテムとして追加する

### コードスタイル
- 特に要求されない限りコメントを追加しない
- 既存のコードパターンと規則に従う
- すべての新しいモジュールでTypeScript strictモードを使用する
- 適切なエラーハンドリングとクリーンアップメソッドを実装する

### セッション間の同期とWORK_LOG運用
複数のClaude Codeセッションで作業する場合：
1. 作業開始時に`WORK_LOG.md`を確認
2. 重要な変更は`WORK_LOG.md`に記録
3. ファイルの移動や削除は特に注意して記録
4. `git status`で他セッションの変更を確認

#### WORK_LOG記録ルール（重要）
**必須記録対象:**
- 技術的変更（アーキテクチャ、ライブラリ移行など）
- 設定ファイル変更（package.json、tsconfig.jsonなど）
- ビルドシステム変更（scripts追加・削除・修正）
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