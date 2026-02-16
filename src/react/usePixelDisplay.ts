import { useRef, useEffect, useCallback } from 'react';
import { ImageDataLEDRenderer } from '../core/renderers/imagedata-renderer';
import { CanvasLEDRenderer } from '../core/renderers/canvas-renderer';
import { SVGLEDMatrixRenderer } from '../core/renderers/svg-renderer';
import type { PixelArray, RendererType } from '../core/types';

type AnyRenderer = ImageDataLEDRenderer | CanvasLEDRenderer | SVGLEDMatrixRenderer;

interface UsePixelDisplayOptions {
  width?: number;
  height?: number;
  renderer?: RendererType;
  glow?: boolean;
  scale?: number;
  pixelGap?: number;
}

export function usePixelDisplay(options: UsePixelDisplayOptions) {
  const {
    width = 64,
    height = 16,
    renderer: type = 'imagedata',
    glow = true,
    scale = 8,
    pixelGap = 0.15,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<AnyRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Destroy previous renderer
    rendererRef.current?.destroy();

    const opts = { width, height, glow, scale, pixelGap };

    if (type === 'canvas') {
      rendererRef.current = new CanvasLEDRenderer(container, opts);
    } else if (type === 'svg') {
      rendererRef.current = new SVGLEDMatrixRenderer(container, { width, height, pixelGap });
    } else {
      rendererRef.current = new ImageDataLEDRenderer(container, opts);
    }

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [width, height, type, glow, scale, pixelGap]);

  const setData = useCallback(
    (pixels: PixelArray, extended?: PixelArray | null, extW?: number | null) => {
      rendererRef.current?.setData(pixels, extended, extW);
    },
    []
  );

  const setEffect = useCallback((effect: string, speed?: number) => {
    rendererRef.current?.setEffect(effect, speed);
  }, []);

  const start = useCallback(() => rendererRef.current?.start(), []);
  const stop = useCallback(() => rendererRef.current?.stop(), []);
  const renderStatic = useCallback(() => rendererRef.current?.renderStatic(), []);

  return { containerRef, rendererRef, setData, setEffect, start, stop, renderStatic };
}
