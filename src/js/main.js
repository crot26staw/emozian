import { initLenis } from './lenis.js';
import { initAnimations } from './animations.js';
import { initPhoneMasks } from './phone-mask.js';

document.addEventListener('DOMContentLoaded', () => {
  initPhoneMasks();

  document.querySelectorAll('form').forEach((form) => {
    // Capture invalid events because the browser blocks submit before it fires.
    form.addEventListener('invalid', () => form.classList.add('was-validated'), true);
    form.addEventListener('reset', () => form.classList.remove('was-validated'));
  });

  initLenis();
  initAnimations();
});
