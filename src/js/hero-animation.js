import { gsap } from 'gsap';

// Три плана из макета: расстояние от оси коридора и смещение вниз от центра.
const desktop = {
  width: 1440, angle: 26, depth: 540, exit: 620, originY: 50,
  positions: [[176, 138], [258, 146], [240, 152]],
};
const mobile = {
  width: 375, angle: 20, depth: 260, exit: 340, originY: 68,
  positions: [[5, 123], [282, 94], [260, 101]],
};

const clamp = gsap.utils.clamp(0, 1);

export function initHeroAnimation(lenis) {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const scene = hero.querySelector('.hero__scene');
  const frame = hero.querySelector('.hero__frame');
  const stage = hero.querySelector('.hero__stage');
  const background = hero.querySelector('.hero__bg');
  const nextButton = hero.querySelector('.hero__next');
  const progress = hero.querySelector('.hero__progress');
  const header = document.querySelector('.header');
  const cards = Array.from(stage.children, (element, index) => {
    element.style.zIndex = stage.childElementCount - index;
    return { element, video: element.querySelector('video'), playing: false };
  });
  const lastStep = cards.length - 1;
  const controls = new AbortController();
  const options = { signal: controls.signal };
  const camera = { step: 0 };
  let layout;
  let unit;
  let frontIndex = -1;
  let inView = false;
  let running = false;
  let observer;
  let headerHeight;
  const pointer = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };

  hero.style.setProperty('--hero-steps', lastStep);
  hero.classList.add('has-hero-motion');

  function measure() {
    layout = window.matchMedia('(width < 900px)').matches ? mobile : desktop;
    unit = frame.getBoundingClientRect().width / layout.width;
    const height = header.getBoundingClientRect().height;
    if (height !== headerHeight) {
      headerHeight = height;
      observer?.disconnect();
      observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > 0;
        updatePlayback();
      }, { rootMargin: `-${height}px 0px 0px`, threshold: 0.001 });
      observer.observe(scene);
    }
  }

  measure();
  const flight = gsap.to(camera, {
    step: lastStep,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: () => `+=${hero.offsetHeight - scene.offsetHeight * 1.2}`,
      scrub: 0.25,
      onRefresh: measure,
    },
  });

  function setVideoPlayback(card, play) {
    if (!card.video || card.playing === play) return;
    card.playing = play;
    if (play) {
      card.video.play().catch(() => { /* При запрете автозапуска видна обложка. */ });
    } else {
      card.video.pause();
    }
  }

  function render(time, delta) {
    const follow = 1 - Math.exp(-Math.min(delta, 64) * 0.004);
    look.x += (pointer.x - look.x) * follow;
    look.y += (pointer.y - look.y) * follow;
    const current = Math.round(camera.step);

    if (current !== frontIndex) {
      frontIndex = current;
      cards.forEach(({ element }, index) => {
        element.classList.toggle('is-front', index === current);
        element.classList.toggle('is-next', index === current + 1);
        if (element.matches('a')) element.tabIndex = index === current ? 0 : -1;
      });
      nextButton.setAttribute('aria-label', current === lastStep ? 'Перейти к разделу «Подросткам»' : 'Следующий экран');
    }

    cards.forEach((card, index) => {
      // 0 — экран у камеры, 1 — на противоположной стене, меньше 0 — проходит мимо.
      const distance = index - camera.step;
      const opacity = clamp(distance < 0 ? 1 + distance / 0.65 : 1 - Math.max(0, distance - 1) / 0.9);
      const hidden = opacity === 0;
      if (card.element.hidden !== hidden) card.element.hidden = hidden;
      setVideoPlayback(card, running && !hidden);
      if (!opacity) return;

      const segment = distance < 1 ? 0 : 1;
      const mix = clamp(distance - segment);
      const [x0, y0] = layout.positions[segment];
      const [x1, y1] = layout.positions[segment + 1];
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (x0 + (x1 - x0) * mix);
      const y = y0 + (y1 - y0) * mix + Math.sin(time * 1.1 + index * 1.7) * 4;
      const z = -distance * (distance < 0 ? layout.exit : layout.depth);
      const angle = -side * (layout.angle + Math.sin(time * 0.8 + index) * 0.9);

      card.element.style.transform = `translate(-50%, -50%) translate3d(${x * unit}px, ${y * unit}px, ${z * unit}px) rotateY(${angle}deg)`;
      card.element.style.opacity = opacity;
    });

    const zoom = 1.02 + camera.step * 0.035 + Math.sin(time * 0.6) * 0.006;
    background.style.transform = `translate3d(${-look.x * 10 * unit}px, ${-look.y * 6 * unit}px, 0) scale(${zoom})`;
    stage.style.perspectiveOrigin = `${50 + look.x * 1.6}% ${layout.originY + look.y * 1.6}%`;
    progress.style.strokeDashoffset = 1 - camera.step / lastStep;
  }

  function updatePlayback() {
    const active = inView && !document.hidden;
    if (active === running) return;
    running = active;
    nextButton.style.setProperty('--hero-hint-playback', active ? 'running' : 'paused');
    if (active) gsap.ticker.add(render);
    else {
      gsap.ticker.remove(render);
      cards.forEach((card) => setVideoPlayback(card, false));
    }
  }

  function goToStep(step) {
    const { start, end } = flight.scrollTrigger;
    lenis.scrollTo(start + (end - start) * step / lastStep);
  }

  stage.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const card = event.target.closest('.hero__card');
    if (card?.classList.contains('is-next')) {
      event.preventDefault();
      goToStep(frontIndex + 1);
    } else if (card?.matches('a.is-front')) {
      event.preventDefault();
      lenis.scrollTo(card.hash);
    }
  }, options);

  nextButton.addEventListener('click', () => {
    if (frontIndex < lastStep) goToStep(frontIndex + 1);
    else lenis.scrollTo(hero.nextElementSibling);
  }, options);

  scene.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = scene.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointer.y = (event.clientY - bounds.top) / bounds.height - 0.5;
  }, options);
  scene.addEventListener('pointerleave', () => {
    pointer.x = 0;
    pointer.y = 0;
  }, options);

  document.addEventListener('visibilitychange', updatePlayback, options);
  render(0, 0);

  return () => {
    controls.abort();
    observer.disconnect();
    gsap.ticker.remove(render);
    cards.forEach((card) => setVideoPlayback(card, false));
    background.style.removeProperty('transform');
    hero.style.removeProperty('--hero-steps');
    hero.classList.remove('has-hero-motion');
  };
}
