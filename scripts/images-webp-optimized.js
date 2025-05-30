const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

const srcDir = 'src/assets/images';
const destDir = 'dist/assets/images';

// タイムスタンプを記録するキャッシュファイル
const cacheFile = '.webp-cache.json';
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

// ファイルのMD5ハッシュを計算
function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// ディレクトリを再帰的に処理
async function processDirectory(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(srcPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      
      if (ext === '.jpg' || ext === '.png') {
        const relativePath = path.relative(srcDir, srcPath);
        const destPath = path.join(destDir, relativePath.replace(/\.(jpg|png)$/i, '.webp'));
        
        // ファイルのハッシュを計算
        const fileHash = calculateFileHash(srcPath);
        
        // キャッシュと比較して変更があるかチェック
        const needsConversion = !cache[srcPath] || 
                               cache[srcPath].hash !== fileHash ||
                               !fs.existsSync(destPath);
        
        if (needsConversion) {
          // 出力ディレクトリを作成
          await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
          
          try {
            // WebPに変換
            await sharp(srcPath)
              .webp({ quality: 80 })
              .toFile(destPath);
            
            console.log(`Converted: ${srcPath} -> ${destPath}`);
            
            // キャッシュを更新
            cache[srcPath] = {
              hash: fileHash,
              destPath: destPath
            };
          } catch (error) {
            console.error(`Error converting ${srcPath}:`, error);
          }
        } else {
          console.log(`Skipped (unchanged): ${srcPath}`);
        }
      }
    }
  }
}

// メイン処理
async function main() {
  try {
    await processDirectory(srcDir);
    
    // キャッシュファイルを保存
    await fs.promises.writeFile(cacheFile, JSON.stringify(cache, null, 2));
    
    console.log('WebP conversion completed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();