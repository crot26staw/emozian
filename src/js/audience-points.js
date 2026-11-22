import { gsap } from 'gsap';

export function addAudiencePointsReveal(timeline, points, startAt = 0) {
  timeline
    .set(points, { opacity: 0, y: 48, rotation: 3, transformOrigin: 'left center', immediateRender: true }, 0)
    .to(points, {
      opacity: 1,
      y: 0,
      rotation: 0,
      duration: 0.17,
      stagger: 0.065,
      ease: 'power2.out',
    }, startAt);
}

export function initKidsPoints() {
  const list = document.querySelector('.audience--kids .points');
  if (!list) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: list,
      start: 'top 80%',
      end: 'top 43%',
      scrub: 0.3,
    },
  });

  addAudiencePointsReveal(timeline, list.querySelectorAll('.points__item'));
}
