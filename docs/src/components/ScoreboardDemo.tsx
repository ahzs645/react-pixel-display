import { useState } from 'react';
import { PixelDisplay } from 'react-pixel-display';

/**
 * Interactive scoreboard demonstrating dynamic text updates.
 */
export default function ScoreboardDemo() {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);

  const text = `${String(home).padStart(2, '0')} - ${String(away).padStart(2, '0')}`;

  const btnBase: React.CSSProperties = {
    width: '32px',
    height: '32px',
    border: '1px solid #444',
    borderRadius: '6px',
    background: '#1a1a2e',
    color: '#ddd',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease, border-color 0.15s ease',
  };

  const resetStyle: React.CSSProperties = {
    padding: '6px 16px',
    border: '1px solid #444',
    borderRadius: '6px',
    background: '#1a1a2e',
    color: '#999',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    transition: 'background 0.15s ease, color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontFamily: 'system-ui, -apple-system, sans-serif',
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
      <div style={{ display: 'flex', gap: '20px', marginTop: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={labelStyle}>Home</span>
          <button onClick={() => setHome(h => Math.max(0, h - 1))} style={btnBase}>−</button>
          <button onClick={() => setHome(h => Math.min(99, h + 1))} style={btnBase}>+</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={labelStyle}>Away</span>
          <button onClick={() => setAway(a => Math.max(0, a - 1))} style={btnBase}>−</button>
          <button onClick={() => setAway(a => Math.min(99, a + 1))} style={btnBase}>+</button>
        </div>
        <button onClick={() => { setHome(0); setAway(0); }} style={resetStyle}>Reset</button>
      </div>
    </div>
  );
}
