/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,liquid}",
    "./dist/**/*.html",
  ],
  theme: {
    screens: {
      'sm': {'max': '767px'},
      'md': {'min': '768px', 'max': '1024px'},
      'pc': {'min': '1025px'},
    },
    extend: {
      // 必要に応じてカスタマイズ
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Tailwindのリセットを無効化（既存のリセットCSSを使用）
  },
}