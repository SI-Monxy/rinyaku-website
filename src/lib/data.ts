// Pages CMS で編集する JSON データの読み込みと検証。
// CMS の入力ミス（必須項目の空欄など）はビルド時にエラーとして検出する。
import { z } from 'astro/zod';
import membersRaw from '../data/members.json';
import trainingRaw from '../data/training.json';

// 区分の表示順と見出し。.pages.yml の group の選択肢と揃えること。
export const memberGroups = [
  { key: 'faculty', title: '教員' },
  { key: 'phd-social', title: '博士課程（社会人）' },
  { key: 'phd4', title: '博士課程4年' },
  { key: 'phd3', title: '博士課程3年' },
  { key: 'phd2', title: '博士課程2年' },
  { key: 'phd1', title: '博士課程1年' },
  { key: 'year6', title: '6年生' },
  { key: 'year5', title: '5年生' },
  { key: 'year4', title: '4年生' },
] as const;

const groupKeys = memberGroups.map((g) => g.key) as [string, ...string[]];

/** 検証に失敗したら、どのファイルのどの項目かが分かるメッセージでビルドを止める。 */
function parseData<T extends z.ZodTypeAny>(file: string, schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || '(ルート)'}: ${i.message}`);
    throw new Error(`${file} の内容に不備があります（Pages CMS で修正してください）\n${lines.join('\n')}`);
  }
  return result.data;
}

const optionalText = z.string().nullish().transform((v) => v?.trim() ?? '');

const memberSchema = z.object({
  name: z.string().trim().min(1, '氏名は必須です'),
  nameEn: optionalText,
  group: z.enum(groupKeys, { errorMap: () => ({ message: '区分の値が不正です' }) }),
  role: optionalText,
  degree: optionalText,
  profileUrl: optionalText,
});

export type Member = z.infer<typeof memberSchema>;

const members = parseData('src/data/members.json', z.object({ members: z.array(memberSchema) }), membersRaw).members;

/** 区分ごとにまとめたメンバー（メンバーがいない区分は除く）。区分内は CMS の並び順。 */
export const memberSections = memberGroups
  .map((g) => ({ ...g, items: members.filter((m) => m.group === g.key) }))
  .filter((g) => g.items.length > 0);

export const faculty = members.filter((m) => m.group === 'faculty');

const trainingSchema = z.object({
  intro: optionalText,
  files: z.array(
    z.object({
      title: z.string().trim().min(1, '資料名は必須です'),
      file: z.string().trim().min(1, 'ファイルは必須です'),
      year: z.number().int().nullish(),
      published: z.boolean().nullish().transform((v) => v ?? true),
    }),
  ),
});

const training = parseData('src/data/training.json', trainingSchema, trainingRaw);

export const trainingIntro = training.intro;
/** 公開中の実務実習資料。並び順は CMS の並び順。 */
export const trainingFiles = training.files.filter((f) => f.published);
