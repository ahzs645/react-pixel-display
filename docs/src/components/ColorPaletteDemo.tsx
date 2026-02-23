import { useMemo } from 'react';
import { PixelDisplay } from 'react-pixel-display';

/**
 * Renders a hue palette using raw pixel data — each column is a different hue.
 */
export default function ColorPaletteDemo() {
  const width = 48;
  const height = 12;

  const pixels = useMemo(() => {
    const data: string[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const hue = (x / width) * 360;
        const lightness = 0.35 + 0.3 * (1 - y / height);
        // Simple HSL to hex
        const c = (1 - Math.abs(2 * lightness - 1)) * 1;
        const hh = hue / 60;
        const xx = c * (1 - Math.abs((hh % 2) - 1));
        let r = 0, g = 0, b = 0;
        if (hh < 1) { r = c; g = xx; }
        else if (hh < 2) { r = xx; g = c; }
        else if (hh < 3) { g = c; b = xx; }
        else if (hh < 4) { g = xx; b = c; }
        else if (hh < 5) { r = xx; b = c; }
        else { r = c; b = xx; }
        const m = lightness - c / 2;
        const R = Math.round((r + m) * 255);
        const G = Math.round((g + m) * 255);
        const B = Math.round((b + m) * 255);
        data.push(
          '#' +
            R.toString(16).padStart(2, '0') +
            G.toString(16).padStart(2, '0') +
            B.toString(16).padStart(2, '0'),
        );
      }
    }
    return data;
  }, []);

  return (
    <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', display: 'inline-block' }}>
      <PixelDisplay pixels={pixels} width={width} height={height} scale={6} glow pixelGap={0.1} />
    </div>
  );
}
