import { gsap } from 'gsap';
import { toCssPixels } from './layout-units.js';

export function initServiceAnimation() {
  const section = document.querySelector('.service');
  if (!section) return;

  const scene = section.querySelector('.service__scene');
  const blue = scene.querySelector('.service__blue');
  const heading = scene.querySelector('.service__title');
  const blueHeading = heading.cloneNode(true);
  const cards = section.querySelectorAll('.service-card');
  const backgroundDuration = 1.1125;
  const cardDelay = 0.09;
  const cardDuration = 1;
  const cardMotionEnd = cardDelay + cardDuration;
  const scrollScale = Math.max(backgroundDuration, cardMotionEnd) / cardMotionEnd;

  blue.append(blueHeading);
  section.classList.add('has-service-motion');

  gsap.fromTo([heading, blueHeading], { y: () => toCssPixels(110) - heading.offsetTop }, {
    y: 0,
    ease: 'sine.inOut',
    scrollTrigger: {
      trigger: section,
      start: 'top 43%',
      end: () => `top ${getComputedStyle(scene).top}`,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: () => `top ${toCssPixels(124)}px`,
      end: () => `+=${Math.round(gsap.utils.clamp(toCssPixels(230), toCssPixels(310), scene.clientHeight * 0.34) * scrollScale)}`,
      scrub: 0.28,
      invalidateOnRefresh: true,
    },
  })
    .fromTo(blue, {
      clipPath: 'polygon(0% 108%, 100% 100%, 100% 100%, 0% 100%)',
    }, {
      clipPath: 'polygon(0% 0%, 100% -8%, 100% 100%, 0% 100%)',
      duration: backgroundDuration,
      ease: 'power1.inOut',
    }, 0)
    .fromTo(cards, { opacity: 0 }, { opacity: 1, duration: 0.29, ease: 'power1.out' }, cardDelay)
    .fromTo(cards, { y: () => scene.clientHeight * 0.53 }, {
      y: () => scene.clientHeight * 0.39,
      duration: cardDuration,
      ease: 'power1.out',
    }, cardDelay);

  return () => {
    blueHeading.remove();
    section.classList.remove('has-service-motion');
  };
}
