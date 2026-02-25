import { useState } from 'react';
import { PixelDisplay } from 'react-pixel-display';
import type { EffectName } from 'react-pixel-display';

const effects: { name: EffectName; label: string }[] = [
  { name: 'scroll_rtl', label: 'Scroll' },
  { name: 'breeze', label: 'Breeze' },
  { name: 'rainbow_text', label: 'Rainbow' },
  { name: 'neon', label: 'Neon' },
  { name: 'typewriter', label: 'Typewriter' },
  { name: 'sparkle', label: 'Sparkle' },
];

/**
 * Interactive effect switcher — pick an effect to see it applied in real-time.
 */
export default function EffectSwitcherDemo() {
  const [effect, setEffect] = useState<EffectName>('scroll_rtl');

  const buttonBase: React.CSSProperties = {
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
          text="SWITCH EFFECTS"
          effect={effect}
          speed={40}
          foregroundColor="#ff6600"
          width={96}
          height={16}
          scale={5}
          glow
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
        {effects.map(({ name, label }) => (
          <button
            key={name}
            onClick={() => setEffect(name)}
            style={{
              ...buttonBase,
              background: effect === name ? '#ff6600' : '#222',
              color: effect === name ? '#000' : '#eee',
              borderColor: effect === name ? '#ff6600' : '#555',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
