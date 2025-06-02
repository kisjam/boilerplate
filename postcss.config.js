module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer')({
      cascade: false,
      grid: 'autoplace'
    })
  ]
};