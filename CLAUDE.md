# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development environment (builds files and starts dev server with watch mode)
npm run dev
# or
npm start

# Build all files
npm run build

# Watch files for changes
npm run watch

# Start development server only
npm run serve

# Clean dist directory
npm run clean

# Install dependencies
npm install
```

## Build System Architecture

This project uses npm scripts for all build tasks (migrated from Gulp 5.0).

### Task Structure
- `build:images` - Copies images to dist
- `build:images-webp` - Converts jpg/png to WebP format
- `build:js` - Bundles TypeScript with Webpack, outputs to `dist/assets/js/bundle.js`
- `build:css` - Compiles Sass to CSS
- `build:html` - Processes Nunjucks templates using data from `_config/site.json`
- `build:copy` - Copies static files from `src/public/` to `dist/`
- `serve` - BrowserSync development server with live reload
- `watch` - Watches all source files for changes

The build system uses chokidar for file watching and npm-run-all for parallel task execution.

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