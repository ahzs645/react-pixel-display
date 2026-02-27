import React, { useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { usePixelDisplay } from './usePixelDisplay';
import { useTextRenderer } from './useTextRenderer';
import { EFFECTS } from '../core/effects';
import type { PixelDisplayProps, PixelDisplayRef } from '../core/types';

export const PixelDisplay = forwardRef<PixelDisplayRef, PixelDisplayProps>(
  (props, ref) => {
    const {
      width = 64,
      height = 16,
      pixels: propPixels,
      text,
      font = 'legacy',
      fontName = 'VCR_OSD_MONO',
      foregroundColor = '#ff6600',
      backgroundColor = '#111',
      effect = 'fixed',
      speed = 100,
      renderer: rendererType = 'imagedata',
      glow = true,
      scale = 8,
      pixelGap = 0.15,
      fontResolver,
      onReady,
      className,
      style,
    } = props;

    const isAmbient = EFFECTS[effect]?.category === 'ambient';

    const needsScroll =
      (effect === 'scroll_ltr' || effect === 'scroll_rtl' || effect === 'bounce') &&
      !!text &&
      !isAmbient;

    const { containerRef, rendererRef, setData, setEffect, start, stop, renderStatic } =
      usePixelDisplay({ width, height, renderer: rendererType, glow, scale, pixelGap });

    const textOptions = useMemo(
      () => ({
        width,
        height,
        text: text || '',
        font: font as 'legacy' | 'canvas' | 'bdf',
        fontName,
        foregroundColor,
        backgroundColor,
        fontResolver,
        needsScroll,
      }),
      [width, height, text, font, fontName, foregroundColor, backgroundColor, fontResolver, needsScroll]
    );

    const { pixels: textPixels, scrollData, fontReady } = useTextRenderer(textOptions);

    // Feed pixel data to renderer
    useEffect(() => {
      if (!rendererRef.current) return;

      if (isAmbient) {
        setData([], [], width);
      } else if (propPixels) {
        setData(propPixels);
      } else if (textPixels) {
        if (needsScroll && scrollData) {
          setData(textPixels, scrollData.pixels, scrollData.width);
        } else {
          setData(textPixels);
        }
      }

      // For fixed effect, re-render immediately after data changes
      // (animated effects handle this via their animation loop)
      if (effect === 'fixed') {
        renderStatic();
      }
    }, [propPixels, textPixels, scrollData, isAmbient, needsScroll, width, setData, rendererRef, effect, renderStatic]);

    // Update effect
    useEffect(() => {
      if (!rendererRef.current) return;

      setEffect(effect, speed);

      if (effect === 'fixed') {
        stop();
        renderStatic();
      } else {
        start();
      }
    }, [effect, speed, setEffect, start, stop, renderStatic, rendererRef]);

    // Imperative API
    useImperativeHandle(
      ref,
      () => ({
        start: () => rendererRef.current?.start(),
        stop: () => rendererRef.current?.stop(),
        getRenderer: () => rendererRef.current,
        isRunning: () => rendererRef.current?.isRunning ?? false,
      }),
      [rendererRef]
    );

    // Ready callback
    useEffect(() => {
      if (rendererRef.current && (propPixels || textPixels || isAmbient)) {
        onReady?.();
      }
    }, [rendererRef, propPixels, textPixels, isAmbient, onReady]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          maxWidth: '100%',
          background: '#0a0a0a',
          borderRadius: '4px',
          overflow: 'hidden',
          width: width * scale,
          aspectRatio: `${width} / ${height}`,
          ...style,
        }}
      />
    );
  }
);

PixelDisplay.displayName = 'PixelDisplay';
