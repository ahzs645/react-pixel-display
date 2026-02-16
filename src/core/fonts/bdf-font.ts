import type { PixelArray, HexColor, FontResolver, BdfFontConfig, ScrollPixelsResult } from '../types';

// Lazy imports for bdfparser/fetchline to avoid issues if not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let $Font: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let $fetchline: any = null;

async function ensureBdfParser(): Promise<boolean> {
  if ($Font && $fetchline) return true;
  try {
    const bdfparser = await import('bdfparser');
    const fetchline = await import('fetchline');
    $Font = bdfparser.$Font;
    const fl = fetchline as unknown as Record<string, unknown>;
    $fetchline = fl.default || fl.$fetchline || fetchline;
    return true;
  } catch {
    console.warn('PixelDisplay: bdfparser/fetchline packages not available. BDF font rendering disabled.');
    return false;
  }
}

export const BDF_FONT_CONFIG: Record<string, Record<number, BdfFontConfig>> = {
  'VCR_OSD_MONO': {
    16: { file: 'VCR_OSD_MONO_16.bdf', yOffset: 0 },
    24: { file: 'VCR_OSD_MONO_24.bdf', yOffset: 0 },
    32: { file: 'VCR_OSD_MONO_32.bdf', yOffset: 2 },
  },
  'CUSONG': {
    16: { file: 'CUSONG_16.bdf', yOffset: -1 },
    24: { file: 'CUSONG_24.bdf', yOffset: 0 },
    32: { file: 'CUSONG_32.bdf', yOffset: 0 },
  },
};

interface CachedFont {
  font: { draw: (text: string, options: { direction: string; mode: number }) => { bindata: string[]; width: () => number; height: () => number } };
  config: BdfFontConfig;
}

const fontCache = new Map<string, CachedFont>();
const fontLoadPromises = new Map<string, Promise<CachedFont | null>>();

// Default resolver: assumes fonts are served relative to current page
const defaultResolver: FontResolver = (_fontName: string, fileName?: string) => {
  if (typeof window === 'undefined') return `/fonts/${fileName || _fontName}`;
  const basePath = window.location.pathname.substring(
    0, window.location.pathname.lastIndexOf('/') + 1
  );
  return `${basePath}fonts/${fileName || _fontName}`;
};

let _fontResolver: FontResolver = defaultResolver;

/**
 * Set a custom font URL resolver for BDF fonts.
 */
export function setFontResolver(resolver: FontResolver): void {
  _fontResolver = resolver;
}

/**
 * Get closest height key for font metrics (16, 24, or 32).
 */
export function getHeightKey(height: number): number {
  if (height <= 18) return 16;
  if (height <= 28) return 24;
  return 32;
}

/**
 * Load a BDF font for a specific size.
 */
export async function loadBdfFont(
  fontName: string,
  heightKey = 16,
  resolver?: FontResolver
): Promise<CachedFont | null> {
  const cacheKey = `${fontName}_${heightKey}`;

  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)!;
  }

  if (fontLoadPromises.has(cacheKey)) {
    return fontLoadPromises.get(cacheKey)!;
  }

  const fontConfig = BDF_FONT_CONFIG[fontName];
  if (!fontConfig || !fontConfig[heightKey]) {
    console.warn(`PixelDisplay BDF: No config for font ${fontName} at height ${heightKey}`);
    return null;
  }

  const config = fontConfig[heightKey];

  const loadPromise = (async () => {
    try {
      const parserAvailable = await ensureBdfParser();
      if (!parserAvailable || !$Font || !$fetchline) return null;

      const resolveUrl = resolver || _fontResolver;
      const fontUrl = resolveUrl(fontName, config.file);

      const font = await $Font($fetchline(fontUrl)) as CachedFont['font'];
      const result: CachedFont = { font, config };
      fontCache.set(cacheKey, result);
      return result;
    } catch (e) {
      console.warn(`PixelDisplay BDF: Failed to load font ${fontName} (${heightKey}px):`, e);
      fontLoadPromises.delete(cacheKey);
      return null;
    }
  })();

  fontLoadPromises.set(cacheKey, loadPromise);
  return loadPromise;
}

/**
 * Check if a BDF font is loaded.
 */
export function isBdfFontLoaded(fontName: string, heightKey = 16): boolean {
  const cacheKey = `${fontName}_${heightKey}`;
  return fontCache.has(cacheKey);
}

/**
 * Render text to pixels using BDF font.
 */
export function textToPixelsBdf(
  text: string,
  width: number,
  height: number,
  fgColor: HexColor = '#ff6600',
  bgColor: HexColor = '#111',
  fontName = 'VCR_OSD_MONO'
): PixelArray | null {
  const heightKey = getHeightKey(height);
  const cacheKey = `${fontName}_${heightKey}`;
  const cached = fontCache.get(cacheKey);

  if (!cached) {
    loadBdfFont(fontName, heightKey);
    return null;
  }

  const { font, config } = cached;
  const pixels: PixelArray = new Array(width * height).fill(bgColor);

  if (!text || text.trim() === '') return pixels;

  try {
    const bitmap = font.draw(text, { direction: 'lrtb', mode: 1 });
    const bindata = bitmap.bindata;
    const textWidth = bitmap.width();
    const textHeight = bitmap.height();

    const xOffset = Math.floor((width - textWidth) / 2);
    const yOffset = Math.floor((height - textHeight) / 2) + (config.yOffset || 0);

    for (let row = 0; row < textHeight; row++) {
      const rowData = bindata[row] || '';
      for (let col = 0; col < rowData.length; col++) {
        const px = xOffset + col;
        const py = yOffset + row;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const idx = py * width + px;
          pixels[idx] = rowData[col] === '1' ? fgColor : bgColor;
        }
      }
    }
  } catch (e) {
    console.warn('PixelDisplay BDF: Error rendering text:', e);
    return null;
  }

  return pixels;
}

/**
 * Render text for scrolling (extended width for seamless loop).
 */
export function textToScrollPixelsBdf(
  text: string,
  displayWidth: number,
  height: number,
  fgColor: HexColor = '#ff6600',
  bgColor: HexColor = '#111',
  fontName = 'VCR_OSD_MONO'
): ScrollPixelsResult | null {
  const heightKey = getHeightKey(height);
  const cacheKey = `${fontName}_${heightKey}`;
  const cached = fontCache.get(cacheKey);

  if (!cached) {
    loadBdfFont(fontName, heightKey);
    return null;
  }

  const { font, config } = cached;

  if (!text || text.trim() === '') {
    const extendedWidth = displayWidth * 3;
    const pixels: PixelArray = new Array(extendedWidth * height).fill(bgColor);
    return { pixels, width: extendedWidth };
  }

  try {
    const bitmap = font.draw(text, { direction: 'lrtb', mode: 1 });
    const bindata = bitmap.bindata;
    const textWidth = bitmap.width();
    const textHeight = bitmap.height();

    const extendedWidth = displayWidth + textWidth + displayWidth;
    const pixels: PixelArray = new Array(extendedWidth * height).fill(bgColor);

    const xStart = displayWidth;
    const yOffset = Math.floor((height - textHeight) / 2) + (config.yOffset || 0);

    for (let row = 0; row < textHeight; row++) {
      const rowData = bindata[row] || '';
      for (let col = 0; col < rowData.length; col++) {
        const px = xStart + col;
        const py = yOffset + row;
        if (px >= 0 && px < extendedWidth && py >= 0 && py < height) {
          const idx = py * extendedWidth + px;
          pixels[idx] = rowData[col] === '1' ? fgColor : bgColor;
        }
      }
    }

    return { pixels, width: extendedWidth };
  } catch (e) {
    console.warn('PixelDisplay BDF: Error rendering scroll text:', e);
    return null;
  }
}

/**
 * Preload all BDF fonts for common heights.
 */
export async function preloadBdfFonts(resolver?: FontResolver): Promise<void> {
  const fonts = Object.keys(BDF_FONT_CONFIG);
  const heights = [16, 24, 32];

  const promises: Promise<unknown>[] = [];
  for (const fontName of fonts) {
    for (const height of heights) {
      if (BDF_FONT_CONFIG[fontName][height]) {
        promises.push(loadBdfFont(fontName, height, resolver));
      }
    }
  }

  await Promise.all(promises);
}

/**
 * Get list of available BDF fonts.
 */
export function getAvailableBdfFonts(): string[] {
  return Object.keys(BDF_FONT_CONFIG);
}
