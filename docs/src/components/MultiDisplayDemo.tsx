import { PixelDisplay } from 'react-pixel-display';

/**
 * Shows multiple PixelDisplays arranged as a mini dashboard.
 */
export default function MultiDisplayDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '1.5rem 0' }}>
      <div style={{ borderRadius: '6px', overflow: 'hidden' }}>
        <PixelDisplay
          text="CPU 42%"
          foregroundColor="#00ff88"
          width={64}
          height={12}
          scale={4}
          glow
        />
      </div>
      <div style={{ borderRadius: '6px', overflow: 'hidden' }}>
        <PixelDisplay
          text="MEM 78%"
          foregroundColor="#ffcc00"
          width={64}
          height={12}
          scale={4}
          glow
        />
      </div>
      <div style={{ borderRadius: '6px', overflow: 'hidden' }}>
        <PixelDisplay
          text="DISK OK"
          foregroundColor="#00ccff"
          width={64}
          height={12}
          scale={4}
          glow
        />
      </div>
      <div style={{ borderRadius: '6px', overflow: 'hidden' }}>
        <PixelDisplay
          text="NET ERR"
          effect="blink"
          speed={30}
          foregroundColor="#ff0033"
          width={64}
          height={12}
          scale={4}
          glow
        />
      </div>
    </div>
  );
}
