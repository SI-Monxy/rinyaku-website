type CarouselRoot = HTMLElement & {
  _carouselCleanup?: () => void;
};

function setupCarousel(root: CarouselRoot) {
  root._carouselCleanup?.();

  const track = root.querySelector<HTMLElement>('[data-carousel-track]');
  if (!track) return;

  const slides = Array.from(track.children) as HTMLElement[];
  if (slides.length === 0) return;

  const autoplayMs = Number(root.dataset.autoplay || 0);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canScroll = () => track.scrollWidth > track.clientWidth + 4;

  const nearestIndex = () => {
    const left = track.scrollLeft;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const dist = Math.abs(slide.offsetLeft - left);
      if (dist < bestDist) {
        best = index;
        bestDist = dist;
      }
    });
    return best;
  };

  const updateUi = () => {
    root.classList.toggle('is-scrollable', canScroll());
  };

  const goTo = (index: number) => {
    const normalized = ((index % slides.length) + slides.length) % slides.length;
    const slide = slides[normalized];
    if (!slide) return;
    track.scrollTo({
      left: slide.offsetLeft,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  let timer: number | undefined;
  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = undefined;
  };

  const start = () => {
    stop();
    if (!autoplayMs || reduceMotion || !canScroll()) return;
    timer = window.setInterval(() => {
      if (document.hidden) return;
      if (!canScroll()) return;
      goTo(nearestIndex() + 1);
    }, autoplayMs);
  };

  const onScroll = () => window.requestAnimationFrame(updateUi);
  track.addEventListener('scroll', onScroll, { passive: true });
  root.addEventListener('pointerenter', stop);
  root.addEventListener('pointerleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  const onTouchStart = () => stop();
  const onTouchEnd = () => {
    window.setTimeout(start, 2000);
  };
  track.addEventListener('touchstart', onTouchStart, { passive: true });
  track.addEventListener('touchend', onTouchEnd, { passive: true });

  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onResize = () => {
    updateUi();
    start();
  };
  window.addEventListener('resize', onResize);

  // layout確定後に自動送りを開始
  window.requestAnimationFrame(() => {
    updateUi();
    start();
  });

  root._carouselCleanup = () => {
    stop();
    track.removeEventListener('scroll', onScroll);
    track.removeEventListener('touchstart', onTouchStart);
    track.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', onResize);
  };
}

function initCarousels() {
  document.querySelectorAll<CarouselRoot>('[data-carousel]').forEach(setupCarousel);
}

initCarousels();
document.addEventListener('astro:page-load', initCarousels);
