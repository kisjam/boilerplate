# プロジェクトアーキテクチャ

## ビルドシステム

### npm scriptsベース
Gulpから移行し、npm scriptsとCLIツールを組み合わせたビルドシステムを採用。

### 主要なビルドタスク
- **images**: Sharp CLIによるWebP変換
- **scripts**: Webpack CLIによるTypeScriptバンドル
- **styles**: Sass/PostCSS CLIによるCSS生成
- **templates**: Nunjucks CLIによるHTML生成
- **copy**: cpx2による静的ファイルコピー
- **serve**: BrowserSyncによる開発サーバー
- **watch**: chokidarによるファイル監視

## ディレクトリ構造

```
src/
├── assets/
│   ├── sass/          # Sassファイル
│   │   ├── components/    # UIコンポーネント
│   │   ├── foundation/    # リセット・ベース
│   │   ├── global/        # 変数・mixin
│   │   ├── layouts/       # レイアウト
│   │   ├── pages/         # ページ固有
│   │   └── utility/       # ユーティリティ
│   ├── js/            # TypeScriptファイル
│   │   ├── app.ts         # エントリーポイント
│   │   └── modules/       # モジュール
│   ├── images/        # 画像ファイル
│   └── html/          # Nunjucksテンプレート
│       ├── _config/       # 設定
│       ├── _layouts/      # レイアウト
│       ├── _partials/     # パーシャル
│       └── pages/         # ページ
├── public/            # 静的ファイル
└── dist/              # ビルド出力
```

## コンポーネント設計

### TypeScriptモジュール
- クラスベースのモジュール設計
- data属性による初期化
- 各モジュールは単一責任の原則に従う

### Sassコンポーネント
- BEM命名規則を推奨
- コンポーネント接頭辞（`.button-*`, `.title-*`）
- フォルダ名を接頭辞として使用（`input/`, `event/`）

### HTMLテンプレート
- Nunjucksによるテンプレート継承
- 共通パーツのパーシャル化
- サイト設定の外部化（`_config/site.json`）