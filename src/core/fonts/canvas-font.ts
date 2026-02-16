import type { PixelArray, HexColor, FontResolver, FontMetrics, ScrollPixelsResult } from '../types';
import { hexToRgbObj } from '../utils';

export const FONT_METRICS: Record<string, Record<number, FontMetrics>> = {
  'VCR_OSD_MONO': {
    16: { font_size: 16, offset: [0, 0], pixel_threshold: 70, var_width: true },
    24: { font_size: 24, offset: [0, 0], pixel_threshold: 70, var_width: true },
    32: { font_size: 28, offset: [-1, 2], pixel_threshold: 30, var_width: false },
  },
  'CUSONG': {
    16: { font_size: 16, offset: [0, -1], pixel_threshold: 70, var_width: false },
    24: { font_size: 24, offset: [0, 0], pixel_threshold: 70, var_width: false },
    32: { font_size: 32, offset: [0, 0], pixel_threshold: 70, var_width: false },
  },
};

const fontLoadState: Record<string, boolean> = {};
const fontLoadPromises: Record<string, Promise<boolean>> = {};

// Default resolver: assumes fonts are served relative to current page
const defaultResolver: FontResolver = (fontName: string) => {
  if (typeof window === 'undefined') return `/fonts/${fontName}.ttf`;
  const basePath = window.location.pathname.substring(
    0, window.location.pathname.lastIndexOf('/') + 1
  );
  return `${basePath}fonts/${fontName}.ttf`;
};

let _fontResolver: FontResolver = defaultResolver;

/**
 * Set a custom font URL resolver for TTF fonts.
 */
export function setFontResolver(resolver: FontResolver): void {
  _fontResolver = resolver;
}

function getHeightKey(height: number): number {
  if (height <= 18) return 16;
  if (height <= 28) return 24;
  return 32;
}

/**
 * Load a TTF font as @font-face.
 */
export async function loadFont(fontName: string, resolver?: FontResolver): Promise<boolean> {
  if (fontLoadState[fontName] === true) return true;
  if (fontLoadState[fontName] === false) return false;
  if (fontName in fontLoadPromises) return fontLoadPromises[fontName];

  fontLoadPromises[fontName] = (async () => {
    if (typeof document === 'undefined') return false;

    const resolveUrl = resolver || _fontResolver;
    const fontUrl = resolveUrl(fontName);

    try {
      const font = new FontFace(fontName, `url(${fontUrl})`);
      const loadedFont = await font.load();
      document.fonts.add(loadedFont);
      fontLoadState[fontName] = true;
      return true;
    } catch (e) {
      console.warn(`PixelDisplay: Failed to load font ${fontName}:`, e);
      fontLoadState[fontName] = false;
      return false;
    }
  })();

  return fontLoadPromises[fontName];
}

/**
 * Check if a TTF font is loaded.
 */
export function isFontLoaded(fontName: string): boolean {
  return fontLoadState[fontName] === true;
}

/**
 * Render text to pixels using Canvas (matches pypixelcolor output).
 */
export function textToPixelsCanvas(
  text: string,
  width: number,
  height: number,
  fgColor: HexColor = '#ff6600',
  bgColor: HexColor = '#111',
  fontName = 'VCR_OSD_MONO'
): PixelArray | null {
  if (typeof document === 'undefined') return null;

  const fontMetrics = FONT_METRICS[fontName];
  if (!fontMetrics) return null;
  if (!isFontLoaded(fontName)) {
    loadFont(fontName);
    return null;
  }

  const heightKey = getHeightKey(height);
  const metrics = fontMetrics[heightKey];

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  if (!text || text.trim() === '') {
    const pixels: PixelArray = [];
    for (let i = 0; i < width * height; i++) pixels.push(bgColor);
    return pixels;
  }

  ctx.font = `${metrics.font_size}px "${fontName}"`;
  ctx.fillStyle = fgColor;
  ctx.textBaseline = 'top';

  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;

  const x = Math.floor((width - textWidth) / 2) + metrics.offset[0];
  const y = Math.floor((height - metrics.font_size) / 2) + metrics.offset[1];

  ctx.fillText(text, x, y);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels: PixelArray = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const gray = (r + g + b) / 3;
    pixels.push(gray >= metrics.pixel_threshold ? fgColor : bgColor);
  }

  return pixels;
}

/**
 * Render text for scrolling (extended width for seamless loop).
 */
export function textToScrollPixelsCanvas(
  text: string,
  displayWidth: number,
  height: number,
  fgColor: HexColor = '#ff6600',
  bgColor: HexColor = '#111',
  fontName = 'VCR_OSD_MONO'
): ScrollPixelsResult | null {
  if (typeof document === 'undefined') return null;

  const fontMetrics = FONT_METRICS[fontName];
  if (!fontMetrics) return null;
  if (!isFontLoaded(fontName)) {
    loadFont(fontName);
    return null;
  }

  const heightKey = getHeightKey(height);
  const metrics = fontMetrics[heightKey];

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return null;
  tempCtx.font = `${metrics.font_size}px "${fontName}"`;
  const textWidth = Math.ceil(tempCtx.measureText(text).width);

  const extendedWidth = displayWidth + textWidth + displayWidth;

  const canvas = document.createElement('canvas');
  canvas.width = extendedWidth;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, extendedWidth, height);

  if (!text || text.trim() === '') {
    const pixels: PixelArray = [];
    for (let i = 0; i < extendedWidth * height; i++) pixels.push(bgColor);
    return { pixels, width: extendedWidth };
  }

  ctx.font = `${metrics.font_size}px "${fontName}"`;
  ctx.fillStyle = fgColor;
  ctx.textBaseline = 'top';

  const x = displayWidth + metrics.offset[0];
  const y = Math.floor((height - metrics.font_size) / 2) + metrics.offset[1];
  ctx.fillText(text, x, y);

  const imageData = ctx.getImageData(0, 0, extendedWidth, height);
  const pixels: PixelArray = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const gray = (r + g + b) / 3;
    pixels.push(gray >= metrics.pixel_threshold ? fgColor : bgColor);
  }

  return { pixels, width: extendedWidth };
}

/**
 * Preload all available TTF fonts.
 */
export async function preloadFonts(resolver?: FontResolver): Promise<void> {
  const fonts = Object.keys(FONT_METRICS);
  await Promise.all(fonts.map((f) => loadFont(f, resolver)));
}

export { getHeightKey };
