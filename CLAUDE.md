# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development environment (builds files and starts dev server with watch mode)
npm run gulp

# Install dependencies
npm install
```

## Build System Architecture

This project uses Gulp 5.0 with ES modules (.mjs files) for all build tasks.

### Task Structure
- `gulp/task/images.mjs` - Converts jpg/png to WebP format
- `gulp/task/js.mjs` - Bundles TypeScript with Webpack, outputs to `dist/assets/js/bundle.js`
- `gulp/task/css.mjs` - Compiles Sass with glob imports and autoprefixer
- `gulp/task/html.mjs` - Processes Nunjucks templates using data from `_config/site.json`
- `gulp/task/server.mjs` - BrowserSync development server with live reload
- `gulp/task/copy-files.mjs` - Copies static files from `src/public/` to `dist/`

The build system watches all source files and automatically deletes corresponding dist files when source files are removed.

## Code Organization

### Sass/CSS Architecture
When creating new styles, follow this structure:
- `components/` - Primary location for new components
  - Create `.button-XXX`, `.title-XXX` patterns
  - Group by function/role (event/, nav/) when files accumulate
  - Use folder names as prefixes for easier discovery
- `layouts/` - Site-wide layout components (header, footer)
- `pages/` - Page-specific styles
- `global/` - Mixins (`mixin/`) and variables (`variable-css/`, `variable-sass/`)
- `utility/` - Utility classes

### TypeScript Modules
All JavaScript modules are in `src/assets/js/modules/` and use TypeScript with strict mode. Modules are class-based and initialized via data attributes.

### HTML Templating
Uses Nunjucks with:
- Base layouts in `_layouts/`
- Reusable partials in `_partials/`
- Site configuration in `_config/site.json`
- Page templates in `pages/`

## Code Quality Tools

ESLint is configured with standard and prettier configs. Run linting manually as there's no dedicated npm script.

## Environment Requirements
- Node.js v16.17.1
- npm v8.19