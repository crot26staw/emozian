import { gsap } from 'gsap';
import { addAudiencePointsReveal } from './audience-points.js';

export function initAdultsAnimation() {
  const intro = document.querySelector('.audience--adults .audience__intro');
  if (!intro) return;

  const track = intro.parentElement;
  const heading = intro.querySelector('.section-head');
  const preheading = intro.querySelector('.section-head__pre');
  const body = intro.querySelector('.audience__body');
  const media = intro.querySelector('.audience__media');
  const points = intro.querySelectorAll('.points__item');
  const centerMedia = (width) => () => (body.clientWidth - width) / 2;

  const portrait = { width: 152, height: 208, x: centerMedia(152), y: 206 };
  const tall = { width: 300, height: 455, x: centerMedia(300), y: 0 };
  const wide = { width: () => parseFloat(getComputedStyle(body).gridTemplateColumns), height: 455, x: 0, y: 0 };

  track.classList.add('has-adults-motion');

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: () => `top ${getComputedStyle(intro).top}`,
      end: () => `+=${getComputedStyle(track, '::after').height}`,
      scrub: 0.3,
      invalidateOnRefresh: true,
    },
  });

  timeline
    .fromTo([heading, media], { opacity: 0.8 }, { opacity: 1, duration: 0.19, ease: 'power1.out' }, 0)
    .fromTo(heading, { y: 158 }, { y: 36, duration: 0.38, ease: 'power1.inOut' }, 0.19)
    .fromTo(preheading, { scale: 1.65 }, { scale: 1.14, duration: 0.38, ease: 'power1.inOut' }, 0.19)
    .fromTo(media, portrait, { ...tall, duration: 0.38, ease: 'power1.inOut' }, 0.19)
    .to(heading, { y: 0, duration: 0.22, ease: 'power1.inOut' }, 0.57)
    .to(preheading, { scale: 1, duration: 0.22, ease: 'power1.inOut' }, 0.57)
    .to(media, { ...wide, duration: 0.23, ease: 'power1.inOut' }, 0.57);

  addAudiencePointsReveal(timeline, points, 0.71);

  return () => track.classList.remove('has-adults-motion');
}
