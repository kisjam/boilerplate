# 静的サイトボイラープレート

モダンなツールチェーンによる高速・軽量な静的サイト生成システム

## ✨ 特徴

- **⚡ 高速ビルド**: Node.js + Vite による最適化されたビルドシステム
- **🖼️ 画像最適化**: 自動WebP変換 + width/height属性自動付与（CLS防止）
- **🎨 モダンCSS**: Sass + PostCSS + Tailwind CSS v4
- **📱 レスポンシブ**: モバイルファーストなコンポーネント設計
- **🔧 TypeScript**: 型安全なJavaScriptモジュール
- **🚀 開発体験**: ライブリロード + 自動フォーマット

## 🛠️ 技術スタック

- **ビルド**: Node.js ESM + npm scripts
- **JavaScript**: TypeScript + Vite
- **CSS**: Sass + PostCSS + Autoprefixer + Tailwind CSS
- **HTML**: LiquidJS テンプレート
- **画像**: Sharp（WebP変換）+ 自動サイズ検出
- **品質**: Biome（リント + フォーマット）

## 🚀 クイックスタート

```bash
# 依存関係インストール
npm install

# 開発環境起動（ビルド + サーバー + ファイル監視）
npm run dev

# 本番ビルド
npm run build:prod
```

## 📋 コマンド

```bash
npm run dev         # 開発環境起動
npm run build       # 開発ビルド
npm run build:prod  # 本番ビルド
npm run serve       # サーバーのみ起動
npm run clean       # dist/ クリーンアップ
npm run lint        # コード品質チェック
```

## 📁 ディレクトリ構造

```
src/assets/
├── html/           # LiquidJS テンプレート
├── sass/           # Sass スタイルシート
├── js/             # TypeScript モジュール
└── images/         # 画像ファイル（自動最適化）

dist/               # ビルド出力
scripts/            # ビルドスクリプト
```

## 🎯 パフォーマンス最適化

- **画像**: 自動WebP変換 + width/height属性付与
- **JavaScript**: Viteによる最適化バンドル（14.79KB → 2.93KB gzip）
- **CSS**: 自動プレフィックス + 最適化
- **HTML**: テンプレートエンジンによる効率的生成

## 📖 ドキュメント

詳細な開発ガイドラインは `CLAUDE.md` を参照してください。

## ⚙️ 要件

- Node.js >= 22.0.0
