// 指定したコレクション（業績・研究内容・活動内容）だけ、段落内の改行をそのまま改行として表示する。
// Pages CMS のエディタでは改行がそのまま表示されるため、公開ページの見た目もそれに合わせる。
// お知らせ・行事など、対象外のページの表示は変えない。
const TARGETS = ['/content/publications/', '/content/research/', '/content/activities/'];

export default function remarkLineBreaks() {
  return (tree, file) => {
    const path = (file.path ?? file.history?.[0] ?? '').replaceAll('\\', '/');
    if (!TARGETS.some((dir) => path.includes(dir))) return;
    splitBreaks(tree);
  };
}

function splitBreaks(node) {
  if (!Array.isArray(node.children)) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text' && child.value.includes('\n')) {
      child.value.split('\n').forEach((value, i) => {
        if (i > 0) next.push({ type: 'break' });
        if (value) next.push({ type: 'text', value });
      });
    } else {
      splitBreaks(child);
      next.push(child);
    }
  }
  node.children = next;
}
