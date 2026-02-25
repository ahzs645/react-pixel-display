import { useMemo } from 'react';
import { PixelDisplay } from 'react-pixel-display';

interface Props {
  width?: number;
  height?: number;
  scale?: number;
}

/**
 * Generates a horizontal gradient from red to blue using raw pixel data.
 * Demonstrates building custom pixel arrays.
 */
export default function GradientDemo({
  width = 32,
  height = 16,
  scale = 6,
}: Props) {
  const pixels = useMemo(() => {
    const data: string[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const t = x / (width - 1);
        const r = Math.round(255 * (1 - t));
        const g = Math.round(80 * Math.sin(t * Math.PI));
        const b = Math.round(255 * t);
        data.push(
          '#' +
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0'),
        );
      }
    }
    return data;
  }, [width, height]);

  return (
    <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
      <PixelDisplay pixels={pixels} width={width} height={height} scale={scale} glow />
    </div>
  );
}
