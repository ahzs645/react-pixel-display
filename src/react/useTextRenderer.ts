import { useState, useEffect, useMemo } from 'react';
import { textToPixels, textToScrollPixels } from '../core/fonts/legacy-font';
import {
  textToPixelsCanvas, textToScrollPixelsCanvas,
  loadFont, isFontLoaded,
} from '../core/fonts/canvas-font';
import {
  textToPixelsBdf, textToScrollPixelsBdf,
  loadBdfFont, isBdfFontLoaded, getHeightKey,
} from '../core/fonts/bdf-font';
import type { FontType, FontResolver, PixelArray, HexColor, ScrollPixelsResult } from '../core/types';

interface UseTextRendererOptions {
  width: number;
  height: number;
  text: string;
  font?: FontType | string;
  fontName?: string;
  foregroundColor?: HexColor;
  backgroundColor?: HexColor;
  fontResolver?: FontResolver;
  needsScroll?: boolean;
}

export function useTextRenderer(options: UseTextRendererOptions) {
  const {
    width, height, text,
    font = 'legacy',
    fontName = 'VCR_OSD_MONO',
    foregroundColor = '#ff6600',
    backgroundColor = '#111',
    fontResolver,
    needsScroll = false,
  } = options;

  const [fontReady, setFontReady] = useState(font === 'legacy');

  // Font loading
  useEffect(() => {
    if (font === 'legacy') {
      setFontReady(true);
      return;
    }

    const heightKey = getHeightKey(height);

    if (font === 'bdf') {
      if (isBdfFontLoaded(fontName, heightKey)) {
        setFontReady(true);
      } else {
        setFontReady(false);
        loadBdfFont(fontName, heightKey, fontResolver).then((result) => {
          setFontReady(!!result);
        });
      }
    } else {
      // canvas / TTF
      if (isFontLoaded(fontName)) {
        setFontReady(true);
      } else {
        setFontReady(false);
        loadFont(fontName, fontResolver).then((result) => {
          setFontReady(result);
        });
      }
    }
  }, [font, fontName, height, fontResolver]);

  // Generate pixels
  const { pixels, scrollData } = useMemo(() => {
    if (!fontReady) return { pixels: null, scrollData: null };

    let result: PixelArray | null = null;

    if (font === 'bdf') {
      result = textToPixelsBdf(text, width, height, foregroundColor, backgroundColor, fontName);
    } else if (font === 'canvas') {
      result = textToPixelsCanvas(text, width, height, foregroundColor, backgroundColor, fontName);
    }

    if (!result) {
      result = textToPixels(text, width, height, foregroundColor, backgroundColor);
    }

    let scroll: ScrollPixelsResult | null = null;
    if (needsScroll) {
      if (font === 'bdf') {
        scroll = textToScrollPixelsBdf(text, width, height, foregroundColor, backgroundColor, fontName);
      } else if (font === 'canvas') {
        scroll = textToScrollPixelsCanvas(text, width, height, foregroundColor, backgroundColor, fontName);
      }
      if (!scroll) {
        scroll = textToScrollPixels(text, width, height, foregroundColor, backgroundColor);
      }
    }

    return { pixels: result, scrollData: scroll };
  }, [fontReady, width, height, text, font, fontName, foregroundColor, backgroundColor, needsScroll]);

  return { pixels, scrollData, fontReady };
}
