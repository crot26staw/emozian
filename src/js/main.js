import { initLenis } from './lenis.js';
import { initAnimations } from './animations.js';
import { initPhoneMasks } from './phone-mask.js';

function initNavigation() {
  const menu = document.querySelector('.header__menus');
  const mobile = window.matchMedia('(width < 900px)');
  const sync = () => menu.toggleAttribute('popover', mobile.matches);
  sync();
  mobile.addEventListener('change', sync);
  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !menu.matches(':popover-open')) return;
    menu.hidePopover();
    const target = document.querySelector(link.hash);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

function initStudioVideo() {
  const video = document.querySelector('.studio-video video');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  function sync() {
    video.controls = reduced.matches;
    if (visible && !document.hidden && !reduced.matches) {
      video.play().catch(() => { video.controls = true; });
    } else {
      video.pause();
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(video);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
}

document.addEventListener('DOMContentLoaded', () => {
  initPhoneMasks();
  initNavigation();
  initStudioVideo();

  document.querySelectorAll('form').forEach((form) => {
    // Capture invalid events because the browser blocks submit before it fires.
    form.addEventListener('invalid', () => form.classList.add('was-validated'), true);
    form.addEventListener('reset', () => form.classList.remove('was-validated'));
  });

  const lenis = initLenis();
  initAnimations(lenis);
});
