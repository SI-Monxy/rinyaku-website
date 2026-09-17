# 静岡県立大学 薬学部 臨床薬剤学分野サイト

公開中の旧サイト（SIRIUS + 静的HTML）を、**Astro + Pages CMS** 前提で再構築した検証用リポジトリです。

当面のゴールは **Cloudflare Pages の無料枠（`*.pages.dev`）でデザイン・導線・更新フローを確認できること** です。

## 技術構成

| 項目 | 内容 |
|---|---|
| フレームワーク | Astro 5 |
| コンテンツ | Markdown（Content Collections） |
| CMS | Pages CMS（`.pages.yml`） |
| ホスティング想定 | Cloudflare Pages |
| 画像・配布資料 | `public/images`, `public/downloads` |

## ローカル起動

```bash
npm install
npm run dev
```

本番相当の静的ビルド:

```bash
npm run build
npm run preview
```

## Cloudflare Pages への接続（史門さん側）

1. このリポジトリを GitHub へ push
2. Cloudflare Pages でリポジトリを接続
3. ビルド設定:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `22` 推奨
4. デプロイ後、`https://<project>.pages.dev` で確認
5. Pages CMS を使う場合は、Pages CMS 側で同リポジトリを接続

> Cloudflare の API トークン発行・連携操作は、この成果物には含めていません。

## 公開範囲からの移植方針

- 旧URL: `https://w3pharm.u-shizuoka-ken.ac.jp/rinyaku/`
- 公開HTML・画像・実務実習ファイルのみを取得して移植
- 取得できない過去原稿や非公開情報は推測せず、`migration/` に要確認として残しています

### URL対応（新サイト）

| 内容 | パス |
|---|---|
| トップ | `/` |
| メンバー | `/members/` |
| 研究内容 | `/research/` |
| 活動内容 | `/activities/` |
| 業績 | `/publications/` |
| 行事 | `/events/` |
| 実務実習 | `/training/` |
| お知らせ | `/news/` |

詳細な旧→新対応と欠落項目は `migration/missing-content.md` を参照。

## 大学サーバーへ載せる場合

現時点の `astro.config.mjs` はルート公開（`pages.dev`）前提です。  
`/rinyaku/` 配下へ置く場合は次を変更してください。

```js
export default defineConfig({
  base: '/rinyaku',
  // ...
});
```

## 開発メモ

- `_mirror/` は取得時の生データ置き場です（`.gitignore` 済み）
- 検証中は `public/robots.txt` で検索エンジンを拒否しています。本番公開前に見直してください
- お知らせ追加は `src/content/news/` か Pages CMS から行えます
