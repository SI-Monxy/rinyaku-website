import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { existsSync } from 'node:fs';

// CMS の入力ミスをビルド時に分かりやすく止めるための共通スキーマ
const requiredText = (label: string) => z.string({ required_error: `${label}は必須です` }).trim().min(1, `${label}は必須です`);

/** public 配下に実在する画像のパス（例: /images/xxx.jpg） */
const publicImage = (label: string) =>
  requiredText(label).refine((path) => existsSync(new URL(`../public${path}`, import.meta.url)), {
    message: `${label}に指定したファイルが見つかりません（Pages CMS の画像一覧から選び直してください）`,
  });

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cover: publicImage('カバー画像'),
    order: z.number(),
    oldUrl: z.string().optional(),
    incomplete: z.boolean().optional(),
  }),
});

const activities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/activities' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    oldUrl: z.string().optional(),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    oldUrl: z.string().optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: requiredText('タイトル'),
    year: z.number({ required_error: '年度は必須です' }).int(),
    description: requiredText('概要'),
    cover: publicImage('カバー画像'),
    oldUrl: z.string().optional(),
  }),
});

export const collections = { news, research, activities, publications, events };
