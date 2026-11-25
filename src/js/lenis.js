import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initLenis() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reduced.matches,
  });
  reduced.addEventListener('change', () => { lenis.options.smoothWheel = !reduced.matches; });

  // Синхронизация Lenis и ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Плавный скролл к якорям
  document.querySelectorAll('[data-scroll-to]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      lenis.scrollTo(link.getAttribute('href'), { immediate: reduced.matches });
    });
  });

  return lenis;
}
