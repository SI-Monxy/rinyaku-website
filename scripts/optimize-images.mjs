// ビルド後に、配信用の画像（dist/images）のうち大きすぎるものを縮小する。
// リポジトリの元画像（public/images）は変更しないので、元の解像度はいつでも取り出せる。
// CMS からアップロードした画像にも、次のビルドから自動で効く。
//
// 長い辺が MAX_SIZE を超える画像だけを MAX_SIZE に縮小する。
// 記事の表示幅（最大約1100px）より大きいため、ページ上の表示サイズは変わらない。
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const DIR = new URL('../dist/images/', import.meta.url);
const MAX_SIZE = 1600;
const TARGETS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const files = (await readdir(DIR)).filter((name) => TARGETS.has(extname(name).toLowerCase()));
let before = 0;
let after = 0;
let count = 0;

for (const name of files) {
  const path = join(DIR.pathname, name);
  const input = await readFile(path);
  const { width = 0, height = 0, format, orientation } = await sharp(input).metadata();
  // 撮影時の向き情報（EXIF）で回転させて表示する画像は、縮小後も向きを保つ
  const [w, h] = orientation && orientation >= 5 ? [height, width] : [width, height];
  if (Math.max(w, h) <= MAX_SIZE) continue;

  let image = sharp(input).rotate().resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true });
  if (format === 'jpeg') image = image.jpeg({ quality: 82, mozjpeg: true });
  else if (format === 'png') image = image.png({ compressionLevel: 9 });
  else if (format === 'webp') image = image.webp({ quality: 82 });
  const output = await image.toBuffer();

  // 縮小しても小さくならない場合は元のまま配信する
  if (output.length >= input.length) continue;
  await writeFile(path, output);
  before += input.length;
  after += output.length;
  count += 1;
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`[optimize-images] ${count} / ${files.length} 枚を縮小: ${mb(before)}MB → ${mb(after)}MB`);
