import { useRef, useState } from 'react';
import { PixelDisplay } from 'react-pixel-display';
import type { PixelDisplayRef } from 'react-pixel-display';

/**
 * Interactive demo showing the ref API with play/pause controls.
 */
export default function PlaybackDemo() {
  const ref = useRef<PixelDisplayRef>(null);
  const [playing, setPlaying] = useState(true);

  const toggle = () => {
    if (ref.current?.isRunning()) {
      ref.current.stop();
      setPlaying(false);
    } else {
      ref.current?.start();
      setPlaying(true);
    }
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 16px',
    border: '1px solid #555',
    borderRadius: '4px',
    background: '#222',
    color: '#eee',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '8px',
  };

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{ borderRadius: '8px', overflow: 'hidden', display: 'inline-block' }}>
        <PixelDisplay
          ref={ref}
          text="PLAY / PAUSE ME"
          effect="scroll_rtl"
          speed={40}
          foregroundColor="#ff6600"
          width={64}
          height={16}
          scale={6}
          glow
        />
      </div>
      <div>
        <button onClick={toggle} style={buttonStyle}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
    </div>
  );
}
