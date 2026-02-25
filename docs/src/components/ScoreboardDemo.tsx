import { useState } from 'react';
import { PixelDisplay } from 'react-pixel-display';

/**
 * Interactive scoreboard demonstrating dynamic text updates.
 */
export default function ScoreboardDemo() {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);

  const text = `${String(home).padStart(2, '0')} - ${String(away).padStart(2, '0')}`;

  const buttonStyle: React.CSSProperties = {
    padding: '4px 12px',
    border: '1px solid #555',
    borderRadius: '4px',
    background: '#222',
    color: '#eee',
    cursor: 'pointer',
    fontSize: '13px',
  };

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{ borderRadius: '8px', overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
        <PixelDisplay
          text={text}
          foregroundColor="#ffcc00"
          backgroundColor="#111"
          width={64}
          height={16}
          scale={6}
          glow
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
        <button onClick={() => setHome(h => h + 1)} style={buttonStyle}>Home +1</button>
        <button onClick={() => setAway(a => a + 1)} style={buttonStyle}>Away +1</button>
        <button onClick={() => { setHome(0); setAway(0); }} style={buttonStyle}>Reset</button>
      </div>
    </div>
  );
}
