import { gsap } from 'gsap';
import { toRem } from './layout-units.js';

// Порядок на орбите идёт по углу поворота, включая две дальние позиции.
const orbit = [-1, -2, 0, 2, 1];
const wrap = gsap.utils.wrap(0, orbit.length);
const interpolate = gsap.utils.interpolate;

function readPose(slide) {
  const style = getComputedStyle(slide);
  return {
    x: parseFloat(style.getPropertyValue('--slide-x')),
    y: parseFloat(style.getPropertyValue('--slide-y')),
    z: parseFloat(style.getPropertyValue('--slide-z')),
    angle: parseFloat(style.getPropertyValue('--slide-angle')),
  };
}

function initCarousel(carousel) {
  const slides = orbit.map((position) => carousel.querySelector(`[data-pos="${position}"]`));
  const stage = carousel.querySelector('.carousel__stage');
  const caption = carousel.querySelector('[data-carousel-caption]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(width < 900px)');
  let rotation = 0;
  let pending = 0;
  let animation = null;
  let gesture = null;

  function settle(steps) {
    rotation = wrap(rotation - steps);
    slides.forEach((slide, index) => {
      const position = orbit[wrap(index + rotation)];
      slide.dataset.pos = position;
      slide.style.removeProperty('transform');
      slide.style.removeProperty('z-index');
      if (position === 0) {
        slide.removeAttribute('aria-hidden');
        if (caption.textContent !== slide.dataset.caption) caption.textContent = slide.dataset.caption;
      } else {
        slide.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function advance() {
    if (pending === 0) return;
    if (reducedMotion.matches) {
      settle(pending);
      pending = 0;
      return;
    }

    const step = Math.sign(pending);
    pending -= step;
    const poses = orbit.map((position) => readPose(carousel.querySelector(`[data-pos="${position}"]`)));
    const paths = slides.map((slide, index) => {
      const from = poses[wrap(index + rotation)];
      const to = poses[wrap(index + rotation - step)];
      const angleChange = to.angle - from.angle;
      const crossesBack = Math.abs(angleChange) > 180;
      const targetAngle = crossesBack ? to.angle - Math.sign(angleChange) * 360 : to.angle;
      return { slide, from, to, targetAngle, crossesBack };
    });

    const frame = { progress: 0 };
    animation = gsap.to(frame, {
      progress: 1,
      duration: pending === 0 ? 0.5 : 0.3,
      ease: 'power2.inOut',
      onUpdate() {
        const { progress } = frame;
        for (const { slide, from, to, targetAngle, crossesBack } of paths) {
          const x = interpolate(from.x, to.x, progress);
          const y = interpolate(from.y, to.y, progress);
          const backDepth = crossesBack ? 220 * Math.sin(progress * Math.PI) : 0;
          const z = interpolate(from.z, to.z, progress) - backDepth;
          const angle = interpolate(from.angle, targetAngle, progress);
          slide.style.transform = `translate3d(${toRem(x)}, ${toRem(y)}, ${toRem(z)}) rotateY(${angle}deg)`;
          slide.style.zIndex = Math.round(z + 1500);
        }
      },
      onComplete() {
        settle(step);
        animation = null;
        advance();
      },
    });
  }

  function enqueue(step) {
    pending = (pending + step) % slides.length;
    if (!animation) advance();
  }

  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => enqueue(-1));
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => enqueue(1));
  carousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    enqueue(event.key === 'ArrowRight' ? 1 : -1);
  });

  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    gesture = event.isPrimary ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
    if (gesture) stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', (event) => {
    if (gesture?.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) >= 32 && Math.abs(dx) > Math.abs(dy) * 1.25) enqueue(dx < 0 ? 1 : -1);
  });
  stage.addEventListener('lostpointercapture', () => { gesture = null; });
  stage.addEventListener('pointercancel', () => { gesture = null; });

  mobile.addEventListener('change', () => animation?.progress(1));
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) animation?.progress(1);
  });
}

export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
}
