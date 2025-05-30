const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

const srcDir = 'src/assets/html';
const distDir = 'dist';

// タイムスタンプを記録するキャッシュファイル
const cacheFile = '.html-cache.json';
let cache = {};

// キャッシュファイルを読み込む
try {
  if (fs.existsSync(cacheFile)) {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
} catch (error) {
  console.error('Error loading cache:', error);
  cache = {};
}

// Nunjucksの設定
const env = nunjucks.configure(srcDir, {
  autoescape: true,
  noCache: true
});

// サイト設定の読み込み
const siteConfigPath = path.join(srcDir, '_config/site.json');
let siteConfig = {};
try {
  siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));
} catch (error) {
  console.error('Error loading site config:', error);
  siteConfig = {};
}

// ファイルの依存関係を取得（レイアウト、パーシャル、設定ファイル）
function getDependencies() {
  const dependencies = [siteConfigPath];
  const layoutsDir = path.join(srcDir, '_layouts');
  const partialsDir = path.join(srcDir, '_partials');
  
  // レイアウトファイルを追加
  if (fs.existsSync(layoutsDir)) {
    const layouts = fs.readdirSync(layoutsDir);
    layouts.forEach(layout => {
      dependencies.push(path.join(layoutsDir, layout));
    });
  }
  
  // パーシャルファイルを追加
  if (fs.existsSync(partialsDir)) {
    const partials = fs.readdirSync(partialsDir);
    partials.forEach(partial => {
      dependencies.push(path.join(partialsDir, partial));
    });
  }
  
  return dependencies;
}

// 依存関係の最新更新時刻を取得
function getLatestDependencyTime(dependencies) {
  let latest = 0;
  for (const dep of dependencies) {
    if (fs.existsSync(dep)) {
      const stats = fs.statSync(dep);
      latest = Math.max(latest, stats.mtime.getTime());
    }
  }
  return latest;
}

// ページディレクトリを再帰的に処理
async function processDirectory(dir, relativePath = '') {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const dependencies = getDependencies();
  const latestDepTime = getLatestDependencyTime(dependencies);
  
  for (const entry of entries) {
    const srcPath = path.join(dir, entry.name);
    const currentRelativePath = path.join(relativePath, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(srcPath, currentRelativePath);
    } else if (entry.isFile() && entry.name.endsWith('.njk')) {
      const outputName = entry.name.replace('.njk', '.html');
      const outputPath = path.join(distDir, relativePath, outputName);
      
      // ファイルの最終更新時刻を取得
      const stats = await fs.promises.stat(srcPath);
      const mtime = stats.mtime.getTime();
      
      // キャッシュと比較して変更があるかチェック
      const needsBuild = !cache[srcPath] || 
                        cache[srcPath].mtime !== mtime ||
                        cache[srcPath].latestDepTime !== latestDepTime ||
                        !fs.existsSync(outputPath);
      
      if (needsBuild) {
        try {
          // 出力ディレクトリを作成
          await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
          
          // ページ固有のデータを準備
          const templatePath = path.relative(srcDir, srcPath);
          const filename = templatePath.split('/').filter(part => part !== '..' && part !== '.');
          
          const data = {
            ...siteConfig,
            filename: filename
          };
          
          // テンプレートをレンダリング
          const html = env.render(templatePath, data);
          
          // HTMLファイルを出力
          await fs.promises.writeFile(outputPath, html);
          
          console.log(`Built: ${templatePath} -> ${path.relative('.', outputPath)}`);
          
          // キャッシュを更新
          cache[srcPath] = {
            mtime: mtime,
            latestDepTime: latestDepTime,
            outputPath: outputPath
          };
        } catch (error) {
          console.error(`Error building ${srcPath}:`, error);
        }
      } else {
        console.log(`Skipped (unchanged): ${path.relative(srcDir, srcPath)}`);
      }
    }
  }
}

// メイン処理
async function main() {
  try {
    const pagesDir = path.join(srcDir, 'pages');
    await processDirectory(pagesDir);
    
    // キャッシュファイルを保存
    await fs.promises.writeFile(cacheFile, JSON.stringify(cache, null, 2));
    
    console.log('HTML build completed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();