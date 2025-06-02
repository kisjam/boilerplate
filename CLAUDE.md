# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイドラインを提供します。

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

## ビルドシステムのアーキテクチャ

このプロジェクトは、すべてのビルドタスクにnpmスクリプトを使用しています（Gulp 5.0から移行）。

### タスク構造
- `build:images` - 画像をdistにコピー
- `build:images-webp` - jpg/pngをWebP形式に変換
- `build:images-webp:cached` - キャッシュ付きWebP変換（変更されていないファイルをスキップ）
- `build:js` - ViteでTypeScriptをバンドル、`dist/assets/js/bundle.js`に出力
- `build:css` - PostCSSを使用してSassをCSSにコンパイル
- `build:html` - `_config/site.json`のデータを使用してLiquidテンプレートを処理
- `build:copy` - `src/public/`から`dist/`に静的ファイルをコピー
- `serve` - ライブリロード機能付きBrowserSync開発サーバー
- `watch` - すべてのソースファイルの変更を監視

ビルドシステムは、ファイル監視にchokidar、並列タスク実行にnpm-run-allを使用しています。

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

### タスク管理
- TodoWrite/TodoReadツールを使用してすべてのタスクを追跡する
- タスクを完了したらすぐに完了とマークする
- 主要な作業の完了後はgitコミットをタスクアイテムとして追加する

### コードスタイル
- 特に要求されない限りコメントを追加しない
- 既存のコードパターンと規則に従う
- すべての新しいモジュールでTypeScript strictモードを使用する
- 適切なエラーハンドリングとクリーンアップメソッドを実装する

### セッション間の同期
複数のClaude Codeセッションで作業する場合：
1. 作業開始時に`.claude/WORK_LOG.md`を確認
2. 重要な変更は`.claude/WORK_LOG.md`に記録
3. ファイルの移動や削除は特に注意して記録
4. `git status`で他セッションの変更を確認
- すべての新しいモジュールでTypeScript strictモードを使用する
- 適切なエラーハンドリングとクリーンアップメソッドを実装する