import { useMemo } from 'react';
import { PixelDisplay } from 'react-pixel-display';

interface Props {
  size?: number;
  colorA?: string;
  colorB?: string;
  scale?: number;
}

/**
 * Generates and renders a checkerboard pixel pattern.
 * Demonstrates using the `pixels` prop with custom data.
 */
export default function CheckerboardDemo({
  size = 16,
  colorA = '#ff6600',
  colorB = '#000000',
  scale = 8,
}: Props) {
  const pixels = useMemo(() => {
    const data: string[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        data.push((x + y) % 2 === 0 ? colorA : colorB);
      }
    }
    return data;
  }, [size, colorA, colorB]);

  return (
    <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
      <PixelDisplay
        pixels={pixels}
        width={size}
        height={size}
        scale={scale}
        glow
      />
    </div>
  );
}
