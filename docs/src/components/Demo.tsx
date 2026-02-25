import { PixelDisplay } from 'react-pixel-display';
import type { PixelDisplayProps } from 'react-pixel-display';

/**
 * Thin wrapper around PixelDisplay for use in MDX with Astro's client:load directive.
 * Adds sensible defaults and a container with rounded corners.
 */
export default function Demo(props: PixelDisplayProps) {
  return (
    <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
      <PixelDisplay
        width={64}
        height={16}
        scale={6}
        glow
        {...props}
      />
    </div>
  );
}
