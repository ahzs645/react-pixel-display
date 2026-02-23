import { useMemo } from 'react';
import { PixelDisplay } from 'react-pixel-display';

interface Props {
  color?: string;
  bg?: string;
  scale?: number;
}

// 10x9 heart pattern (1 = filled, 0 = background)
const HEART = [
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
];

/**
 * Renders a heart shape using raw pixel data.
 * Demonstrates pixel art with the `pixels` prop.
 */
export default function PixelArtDemo({
  color = '#ff0044',
  bg = '#111111',
  scale = 10,
}: Props) {
  const width = HEART[0].length;
  const height = HEART.length;

  const pixels = useMemo(() => {
    const data: string[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        data.push(HEART[y][x] ? color : bg);
      }
    }
    return data;
  }, [color, bg]);

  return (
    <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', display: 'inline-block' }}>
      <PixelDisplay
        pixels={pixels}
        width={width}
        height={height}
        scale={scale}
        glow
        backgroundColor={bg}
      />
    </div>
  );
}
