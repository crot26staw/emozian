// В исходном макете шириной 1440px один rem равен 16px.
export const designRootSize = 16;

export function toRem(designPixels) {
  return `${designPixels / designRootSize}rem`;
}

// Для расчётов вместе с DOM-координатами и порогами ScrollTrigger.
export function toCssPixels(designPixels) {
  const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return designPixels * rootSize / designRootSize;
}
