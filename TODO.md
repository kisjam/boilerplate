# TODO リスト

## Phase 0: プロジェクトドキュメントの整備
- [ ] STYLE_GUIDE.md - コーディング規約とスタイルガイド
- [ ] ARCHITECTURE.md - プロジェクト構造とコンポーネント設計
- [ ] DEVELOPMENT.md - 開発フローとGit運用
- [ ] TESTING.md - テスト戦略と実行方法
- [ ] PERFORMANCE.md - パフォーマンス基準と最適化
- [ ] ACCESSIBILITY.md - アクセシビリティ要件

## Phase 1: npm scriptへの移行
- [x] 必要なパッケージのインストール
- [ ] 画像処理（WebP変換）のnpm script化
- [x] TypeScript/WebpackビルドのScript化
- [ ] Sass コンパイルのnpm script化
- [ ] Nunjucksテンプレート処理のnpm script化
- [x] 静的ファイルコピーのnpm script化
- [ ] ファイル監視（watch）機能の実装
- [ ] 開発サーバー（BrowserSync）の設定
- [ ] npm scriptsの統合とテスト
- [ ] Gulp関連ファイルの削除

## Phase 2: 新スタック移行
- [ ] 新スタック移行の要件定義（Liquid、11ty等の選定）
- [ ] ビルドツールの選定（Vite vs Webpack vs esbuild）
- [ ] CSSフレームワークの検討（Tailwind、PostCSS等）
- [ ] 画像最適化戦略の見直し
- [ ] コンポーネント設計の改善

## Phase 3: 企業サイト向け機能強化
- [ ] 企業サイト向け機能の追加（SEO、OGP対応）
- [ ] パフォーマンス最適化（Critical CSS、遅延読み込み）
- [ ] アクセシビリティ対応の強化
- [ ] CI/CD パイプラインの設定