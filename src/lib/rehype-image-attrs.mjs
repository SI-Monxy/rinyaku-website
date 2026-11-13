// Markdown 本文の画像に、遅延読み込みと幅・高さを付ける。
// - loading="lazy"：画面に近づいてから読み込む（行事ページのように画像が多いページを軽くする）
// - width / height：読み込み前から表示領域を確保し、読み込み時のレイアウトのずれを防ぐ
//   値は配信される画像（scripts/optimize-images.mjs で縮小した後）の大きさに合わせる
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const MAX_SIZE = 1600; // scripts/optimize-images.mjs と揃える
const PUBLIC = new URL('../../public', import.meta.url);
const cache = new Map();

async function sizeOf(src) {
  if (cache.has(src)) return cache.get(src);
  let size = null;
  const file = new URL(`${PUBLIC.href}${decodeURI(src)}`);
  if (existsSync(file)) {
    try {
      const { width, height, orientation } = await sharp(file.pathname).metadata();
      if (width && height) {
        const [w, h] = orientation && orientation >= 5 ? [height, width] : [width, height];
        const scale = Math.min(1, MAX_SIZE / Math.max(w, h));
        size = { width: Math.round(w * scale), height: Math.round(h * scale) };
      }
    } catch {
      size = null;
    }
  }
  cache.set(src, size);
  return size;
}

function collectImages(node, list = []) {
  if (node.type === 'element' && node.tagName === 'img') list.push(node);
  for (const child of node.children ?? []) collectImages(child, list);
  return list;
}

export default function rehypeImageAttrs() {
  return async (tree) => {
    for (const img of collectImages(tree)) {
      const props = (img.properties ??= {});
      props.loading ??= 'lazy';
      props.decoding ??= 'async';
      const src = typeof props.src === 'string' ? props.src : '';
      if (!src.startsWith('/') || props.width || props.height) continue;
      const size = await sizeOf(src);
      if (size) Object.assign(props, size);
    }
  };
}
