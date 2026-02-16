import type { RGBColor } from './types';

/**
 * Convert hex color string to RGB array.
 * Handles short-circuit cases for common dark/background colors.
 */
export function hexToRgb(hex: string): RGBColor {
  if (!hex || hex === '#111' || hex === '#000') return [17, 17, 17];
  if (hex === '#050505') return [5, 5, 5];

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [17, 17, 17];
}

/**
 * Convert hex color to RGB object (used by canvas font renderer).
 */
export function hexToRgbObj(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert HSV values to RGB color.
 * @param h - Hue (0-1)
 * @param s - Saturation (0-1)
 * @param v - Value/brightness (0-1)
 */
export function hsvToRgb(h: number, s: number, v: number): RGBColor {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return [r * 255, g * 255, b * 255];
}
