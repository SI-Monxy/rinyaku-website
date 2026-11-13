// 本文（.prose）の画像をクリックすると、ページ上に拡大表示する。
// 画像がリンクで囲まれていなくても動くので、CMS で追加した画像にもそのまま効く。
// JavaScript が動かない環境では、リンク付きの画像は画像ファイルを直接開く。

const images = Array.from(document.querySelectorAll<HTMLImageElement>('.prose img'));

if (images.length > 0) {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', '画像の拡大表示');
  dialog.innerHTML = `
    <figure class="lightbox-figure">
      <img class="lightbox-image" alt="" />
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <button type="button" class="lightbox-button lightbox-close" aria-label="閉じる">×</button>
    <button type="button" class="lightbox-button lightbox-prev" aria-label="前の画像">‹</button>
    <button type="button" class="lightbox-button lightbox-next" aria-label="次の画像">›</button>
    <p class="lightbox-count" aria-live="polite"></p>
  `;
  document.body.appendChild(dialog);

  const view = dialog.querySelector<HTMLImageElement>('.lightbox-image')!;
  const caption = dialog.querySelector<HTMLElement>('.lightbox-caption')!;
  const count = dialog.querySelector<HTMLElement>('.lightbox-count')!;
  const prev = dialog.querySelector<HTMLButtonElement>('.lightbox-prev')!;
  const next = dialog.querySelector<HTMLButtonElement>('.lightbox-next')!;
  let current = 0;

  // リンク先が画像ならそちらを（より大きい版の可能性がある）、なければ表示中の画像を使う
  const fullSource = (img: HTMLImageElement) => {
    const link = img.closest('a');
    const href = link?.getAttribute('href') ?? '';
    return /\.(jpe?g|png|gif|webp|avif)$/i.test(href) ? href : img.currentSrc || img.src;
  };

  const show = (index: number) => {
    current = (index + images.length) % images.length;
    const img = images[current];
    view.src = fullSource(img);
    view.alt = img.alt;
    caption.textContent = img.alt;
    caption.hidden = !img.alt;
    count.textContent = `${current + 1} / ${images.length}`;
    const single = images.length < 2;
    prev.hidden = single;
    next.hidden = single;
    count.hidden = single;
  };

  images.forEach((img, index) => {
    img.classList.add('is-zoomable');
    const target = img.closest('a') ?? img;
    target.addEventListener('click', (event) => {
      event.preventDefault();
      show(index);
      dialog.showModal();
    });
  });

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  dialog.querySelector('.lightbox-close')!.addEventListener('click', () => dialog.close());

  // 画像やボタン以外（背景）をクリックしたら閉じる
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === dialog.querySelector('.lightbox-figure')) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  dialog.addEventListener('close', () => view.removeAttribute('src'));
}
