import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAdultsAnimation } from './adults-animation.js';
import { initKidsPoints } from './audience-points.js';
import { initCarousels } from './carousels.js';
import { initHeroAnimation } from './hero-animation.js';
import { initMobileAnimations } from './mobile-animations.js';
import { toRem } from './layout-units.js';
import { initServiceAnimation } from './service-animation.js';

gsap.registerPlugin(ScrollTrigger);

function initTeensPhotos(row) {
  const cards = [...row.querySelectorAll('.dir-card')];
  const defaultCard = row.querySelector('.dir-card--default');
  const defaultPhoto = defaultCard.querySelector('.dir-card__photo');
  const defaultWindow = defaultPhoto.parentElement;
  const controls = new AbortController();
  const options = { signal: controls.signal };
  const flight = { x: 0, y: 0 };
  let activeCard = defaultCard;
  let pointerOverRow = false;
  let photoWidth, photoHeight, insetRight, insetTop;

  const windows = cards.map((card) => {
    const photoWindow = card.querySelector('.dir-card__photo-window');
    const photo = photoWindow.firstElementChild;
    return { window: photoWindow, photo, place: gsap.quickSetter(photo, 'css') };
  });

  // Каждое фото движется в координатах ряда и видно только внутри своей карточки.
  function paint() {
    for (const frame of windows) {
      frame.place({ x: flight.x - frame.x, y: flight.y - frame.y });
    }
  }

  function measure() {
    const bounds = row.getBoundingClientRect();
    const photo = defaultPhoto.getBoundingClientRect();
    const style = getComputedStyle(defaultPhoto);
    photoWidth = photo.width;
    photoHeight = photo.height;
    insetRight = parseFloat(style.right);
    insetTop = parseFloat(style.top);
    for (const frame of windows) {
      const rect = frame.window.getBoundingClientRect();
      frame.x = rect.right - bounds.left - insetRight - photoWidth;
      frame.y = rect.top - bounds.top + insetTop;
    }
  }

  function restPosition(card) {
    const { x, y } = windows[cards.indexOf(card)];
    return { x, y };
  }

  measure();
  Object.assign(flight, restPosition(defaultCard));
  paint();
  row.classList.add('has-photo-motion');

  const motion = { duration: 0.32, ease: 'power3.out', onUpdate: paint };
  const moveX = gsap.quickTo(flight, 'x', motion);
  const moveY = gsap.quickTo(flight, 'y', motion);

  function show(card, position = restPosition(card)) {
    if (activeCard !== card) {
      activeCard.classList.remove('is-active');
      card.classList.add('is-active');
      activeCard = card;
    }
    moveX(position.x);
    moveY(position.y);
  }

  function showFocusedCard() {
    show(row.querySelector('.dir-card:focus-visible') ?? defaultCard);
  }

  const observer = new ResizeObserver(() => {
    measure();
    show(activeCard);
  });
  observer.observe(row);

  row.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    pointerOverRow = true;
    const bounds = row.getBoundingClientRect();
    const card = event.target.closest('.dir-card') ?? activeCard;
    show(card, {
      x: gsap.utils.clamp(insetRight, bounds.width - insetRight - photoWidth, event.clientX - bounds.left - photoWidth / 2),
      y: gsap.utils.clamp(insetTop, defaultWindow.clientHeight - photoHeight - insetTop, event.clientY - bounds.top - photoHeight / 2),
    });
  }, options);

  row.addEventListener('pointerleave', () => {
    pointerOverRow = false;
    showFocusedCard();
  }, options);

  row.addEventListener('focusin', (event) => {
    if (event.target.matches('.dir-card:focus-visible')) show(event.target);
  }, options);

  row.addEventListener('focusout', (event) => {
    if (!pointerOverRow && !row.contains(event.relatedTarget)) show(defaultCard);
  }, options);

  return () => {
    controls.abort();
    observer.disconnect();
    moveX.tween.kill();
    moveY.tween.kill();
    row.classList.remove('has-photo-motion');
    activeCard.classList.remove('is-active');
    defaultCard.classList.add('is-active');
    for (const { photo } of windows) photo.style.removeProperty('transform');
  };
}

function initProgramOffers() {
  const cleanup = [...document.querySelectorAll('.program .offers')].map((row) => {
    const reveal = gsap.from(row.querySelectorAll('.offer'), {
      y: (index) => toRem(64 + index * 30),
      rotation: (index) => 5 + index,
      opacity: 0,
      duration: 0.62,
      stagger: 0.14,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: row, start: 'top 82%', toggleActions: 'play none none reverse', invalidateOnRefresh: true },
    });

    function finish() {
      reveal.progress(1).pause();
    }

    row.addEventListener('focusin', finish);
    return () => row.removeEventListener('focusin', finish);
  });

  return () => cleanup.forEach((removeListener) => removeListener());
}

function initReviews() {
  const list = document.querySelector('.reviews__list');
  if (!list) return;

  const [upperRow, lowerRow] = list.querySelectorAll('.reviews__row');
  gsap.timeline({
    defaults: { duration: 0.7, ease: 'power1.out' },
    scrollTrigger: { trigger: list, start: 'top 84%', end: 'top 50%', scrub: 0.3, invalidateOnRefresh: true },
  })
    .from(upperRow, { x: toRem(-112), opacity: 0 }, 0)
    .from(lowerRow, { x: toRem(112), opacity: 0 }, 0.1);
}

/**
 * Анимации подключаются строго по одной, по порядку из PROJECT.md:
 * сделали → заказчик проверил и принял → берёмся за следующую.
 *
 *  1. 02 Подросткам — фото едет за курсором по карточкам
 *  2. 03–05 Карусели — перелистывание по кругу + наведение на карточки
 *  3. 03–05 Карточки — появление снизу под углом
 *  4. 06 Взрослым — смена цвета блока, видео растёт, пункты поднимаются
 *  5. 08 Детям — появление пунктов
 *  6. 09 Сервис — смена цвета наклонной линией, карточки поверх заголовка
 *  7. 13 Отзывы — два ряда выезжают с противоположных сторон
 *  8. 15 Наставники — CSS-подсветка карточки и проявление иконки при наведении
 *  9. 16 Аренда — карточки собираются в стопку через CSS sticky
 * 10. 01 Первый экран — пролёт по коридору с карточками и видео
 */
export function initAnimations(lenis) {
  initCarousels();

  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => initHeroAnimation(lenis));
  media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const removeOfferListeners = initProgramOffers();
    const resetAdults = initAdultsAnimation();
    const resetService = initServiceAnimation();
    initKidsPoints();
    initReviews();
    return () => {
      removeOfferListeners();
      resetAdults?.();
      resetService?.();
    };
  });
  media.add('(width < 900px) and (prefers-reduced-motion: no-preference)', initMobileAnimations);

  const teensCards = document.querySelector('[data-teens-cards]');
  if (teensCards) {
    media.add('(min-width: 900px) and (any-hover: hover) and (prefers-reduced-motion: no-preference)', () => initTeensPhotos(teensCards));
  }
}
