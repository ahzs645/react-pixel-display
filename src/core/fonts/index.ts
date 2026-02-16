import { setFontResolver as setTtf } from './canvas-font';
import { setFontResolver as setBdf } from './bdf-font';
import type { FontResolver } from '../types';

export { textToPixels, textToScrollPixels, pixelFont } from './legacy-font';
export {
  loadFont, isFontLoaded, textToPixelsCanvas, textToScrollPixelsCanvas,
  preloadFonts, FONT_METRICS, setFontResolver as setTtfFontResolver, getHeightKey,
} from './canvas-font';
export {
  loadBdfFont, isBdfFontLoaded, textToPixelsBdf, textToScrollPixelsBdf,
  preloadBdfFonts, getAvailableBdfFonts, BDF_FONT_CONFIG,
  setFontResolver as setBdfFontResolver,
  getHeightKey as getBdfHeightKey,
} from './bdf-font';

/**
 * Configure font URL resolution for both TTF and BDF fonts.
 */
export function configureFonts(options: {
  ttfResolver?: FontResolver;
  bdfResolver?: FontResolver;
  baseUrl?: string;
}): void {
  if (options.baseUrl) {
    const base = options.baseUrl.replace(/\/+$/, '');
    setTtf((name) => `${base}/${name}.ttf`);
    setBdf((_name, file) => `${base}/${file || _name}`);
  }
  if (options.ttfResolver) setTtf(options.ttfResolver);
  if (options.bdfResolver) setBdf(options.bdfResolver);
}
