# Boilerplate

静的 Web サイト向けの雛形

## 概要

- **ビルド**: Node.js ESM + npm scripts
- **JavaScript**: TypeScript + Vite
- **CSS**: Sass + PostCSS + Autoprefixer + Tailwind CSS
- **HTML**: LiquidJS テンプレート
- **画像**: Sharp（WebP 変換）+ 自動サイズ検出
- **Lint**: Biome

## 🚀 クイックスタート

```bash
# 依存関係インストール
npm ci

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

## ⚙️ 要件

- Node.js >= 22.0.0
