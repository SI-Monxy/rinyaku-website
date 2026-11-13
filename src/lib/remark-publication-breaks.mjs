// 業績ページ（src/content/publications）だけ、段落内の改行をそのまま改行として表示する。
// Pages CMS のエディタでは改行がそのまま表示されるため、公開ページの見た目もそれに合わせる。
// 対象を業績に限定し、お知らせ・行事など他のページの表示は変えない。
export default function remarkPublicationBreaks() {
  return (tree, file) => {
    const path = file.path ?? file.history?.[0] ?? '';
    if (!path.replaceAll('\\', '/').includes('/content/publications/')) return;
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
