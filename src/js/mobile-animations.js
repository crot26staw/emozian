import { gsap } from 'gsap';
import { toRem } from './layout-units.js';

function reveal(element, from) {
  return gsap.from(element, {
    ...from,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 96%',
      end: 'top 73%',
      scrub: 0.25,
      invalidateOnRefresh: true,
    },
  });
}

export function initMobileAnimations() {
  // В одной колонке каждый элемент входит в экран в своё время.
  for (const card of document.querySelectorAll('.program .offer, .points__item, .service-card, .dir-card')) {
    reveal(card, { y: toRem(26), rotation: 1.4, opacity: 0.45 });
  }

  for (const review of document.querySelectorAll('.review')) {
    const fromLeft = review.parentElement.matches(':first-child');
    reveal(review, { x: toRem(fromLeft ? -30 : 30), opacity: 0.4 });
  }

  for (const icon of document.querySelectorAll('.mentor-card picture img')) {
    reveal(icon, { y: toRem(10), rotation: -8, opacity: 0.35 });
  }

  const portrait = document.querySelector('.audience--adults .audience__media');
  gsap.fromTo(portrait, { clipPath: 'inset(9% 24% 0% round 1rem)' }, {
    clipPath: 'inset(0% 0% 0% round 1rem)',
    ease: 'power1.inOut',
    scrollTrigger: { trigger: portrait, start: 'top 94%', end: 'center 52%', scrub: 0.25 },
  });

  const scene = document.querySelector('.service__scene');
  const blue = scene.querySelector('.service__blue');
  const heading = scene.querySelector('h2').cloneNode(true);
  blue.append(heading);
  scene.parentElement.classList.add('has-mobile-wipe');

  gsap.fromTo(blue, { clipPath: 'polygon(0% 112%, 100% 100%, 100% 100%, 0% 100%)' }, {
    clipPath: 'polygon(0% 0%, 100% -12%, 100% 100%, 0% 100%)',
    ease: 'none',
    scrollTrigger: { trigger: scene, start: 'top 88%', end: 'bottom 63%', scrub: 0.2 },
  });

  return () => {
    heading.remove();
    scene.parentElement.classList.remove('has-mobile-wipe');
  };
}
