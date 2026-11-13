# 静岡県立大学 薬学部 臨床薬剤学分野サイト

公開中の旧サイト（SIRIUS + 静的HTML）を、**Astro + Pages CMS** 前提で再構築したリポジトリです。

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

## Cloudflare Pages への接続

1. このリポジトリを GitHub へ push
2. Cloudflare Pages でリポジトリを接続
3. ビルド設定:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `22` 推奨
4. デプロイ後、`https://<project>.pages.dev` で確認
5. Pages CMS を使う場合は、Pages CMS 側で同リポジトリを接続

## Pages CMS での編集

管理画面: https://app.pagescms.org （GitHub でログインし、このリポジトリを選択）

| 項目 | データ | 反映先 |
|---|---|---|
| メンバー | `src/data/members.json` | `/members/`、トップの教員一覧 |
| 実務実習資料 | `src/data/training.json` + `public/downloads` | `/training/` |
| 業績 | `src/content/publications/` | `/publications/` |
| お知らせ | `src/content/news/` | `/news/`、トップ |
| 行事 | `src/content/events/` | `/events/`、トップ |

- メンバーの学年繰り上げは「区分」を変更、卒業は削除、新入生は追加。区分内の表示順は一覧の並び順
- 区分の選択肢を増やすときは `.pages.yml` と `src/lib/data.ts` の `memberGroups` を両方更新する
- 業績は年度を見出し（H3）、1件を箇条書き1項目で書く。書誌情報の改行は Shift+Enter。論文ページは約130件あり、エディタを開くまで30〜40秒かかる
- 必須項目の空欄などデータに不備があると、ビルドがエラーになり公開サイトは更新されない（直前の状態のまま）

### 行事の入力ルール

- 1年度につき1ページ。同じ年度の行事を2件作るとビルドが止まる（どのファイルが重複しているかがエラーに出る）
- 「概要」と「カバー画像」は必須。カバー画像は画像一覧から選ぶ（一覧にない画像を指定するとビルドが止まる）

### ビルド失敗の通知（Cloudflare）

CMS での保存内容に不備があるとビルドが失敗し、本番は直前の状態のまま更新されない。気づけるように、Cloudflare の通知を設定しておく。

1. Cloudflare ダッシュボードで Workers & Pages →「rinyaku-website」→「設定」を開く
2. 「一般」の「通知」で通知を追加する
3. Pages のデプロイ失敗（Deployment failed）を選び、通知先のメールアドレスを指定して保存する

失敗の原因は、Cloudflare の「デプロイ」一覧から該当のデプロイを開き、ビルドログで確認できる。

### 画像のアップロード

- 長い辺が 1600px を超える画像は、ビルド時に配信用だけ 1600px に縮小される（`scripts/optimize-images.mjs`）。リポジトリの元画像はそのまま残る
- そのため、スマホやカメラの写真をそのままアップロードしてもページは重くならない。ただしリポジトリの容量は増えるので、可能なら長い辺 2000px 程度に縮小してからアップロードする
- 本文の画像は画面に近づいてから読み込まれる（`src/lib/rehype-image-attrs.mjs`）

### 実務実習資料の取り扱い

- `public/downloads` のファイルは URL を知っていれば誰でも取得できる。「公開する」をオフにしても一覧から消えるだけなので、公開できないファイルはアップロードしない
- 不要になったファイルは一覧から削除したうえで、メディア（配布資料）からファイル自体も削除する
- 現在の Excel / Word 資料はすべてパスワード付き（暗号化済み）。パスワードはサイトに掲載せず別経路で伝える

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
