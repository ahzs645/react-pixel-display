import { useState, useRef, useCallback } from 'react';
import { PixelDisplay } from 'react-pixel-display';
import type { PixelDisplayRef, EffectName, RendererType } from 'react-pixel-display';

// ── Effect catalogue ────────────────────────────────────────────────
const textEffects: { name: EffectName; label: string }[] = [
  { name: 'fixed', label: 'Fixed' },
  { name: 'scroll_rtl', label: 'Scroll RTL' },
  { name: 'scroll_ltr', label: 'Scroll LTR' },
  { name: 'scroll_up', label: 'Scroll Up' },
  { name: 'scroll_down', label: 'Scroll Down' },
  { name: 'scroll_up_left', label: 'Up-Left' },
  { name: 'scroll_up_right', label: 'Up-Right' },
  { name: 'scroll_down_left', label: 'Down-Left' },
  { name: 'scroll_down_right', label: 'Down-Right' },
  { name: 'blink', label: 'Blink' },
  { name: 'breeze', label: 'Breeze' },
  { name: 'snow', label: 'Snow' },
  { name: 'laser', label: 'Laser' },
  { name: 'fade', label: 'Fade' },
  { name: 'typewriter', label: 'Typewriter' },
  { name: 'bounce', label: 'Bounce' },
  { name: 'sparkle', label: 'Sparkle' },
  { name: 'dissolve', label: 'Dissolve' },
  { name: 'blinds', label: 'Blinds' },
  { name: 'wipe', label: 'Wipe' },
  { name: 'scan_horiz', label: 'Scan H' },
  { name: 'scan_vert', label: 'Scan V' },
  { name: 'grow_up', label: 'Grow Up' },
  { name: 'grow_down', label: 'Grow Down' },
  { name: 'opening', label: 'Opening' },
  { name: 'closing', label: 'Closing' },
  { name: 'slice', label: 'Slice' },
  { name: 'mesh', label: 'Mesh' },
  { name: 'random', label: 'Random' },
];

const ambientEffects: { name: EffectName; label: string }[] = [
  { name: 'rainbow', label: 'Rainbow' },
  { name: 'matrix', label: 'Matrix' },
  { name: 'plasma', label: 'Plasma' },
  { name: 'gradient', label: 'Gradient' },
  { name: 'fire', label: 'Fire' },
  { name: 'water', label: 'Water' },
  { name: 'stars', label: 'Stars' },
  { name: 'confetti', label: 'Confetti' },
  { name: 'plasma_wave', label: 'Plasma Wave' },
  { name: 'radial_pulse', label: 'Radial Pulse' },
  { name: 'hypnotic', label: 'Hypnotic' },
  { name: 'lava', label: 'Lava' },
  { name: 'aurora', label: 'Aurora' },
  { name: 'starfield', label: 'Starfield' },
  { name: 'fireworks', label: 'Fireworks' },
  { name: 'rain_storm', label: 'Rain Storm' },
  { name: 'munch', label: 'Munch' },
  { name: 'bouncing', label: 'Bouncing' },
  { name: 'flow_field', label: 'Flow Field' },
  { name: 'attract', label: 'Attract' },
  { name: 'snake', label: 'Snake' },
  { name: 'pendulum_wave', label: 'Pendulum Wave' },
  { name: 'radar', label: 'Radar' },
];

const colorEffects: { name: EffectName; label: string }[] = [
  { name: 'color_cycle', label: 'Color Cycle' },
  { name: 'rainbow_text', label: 'Rainbow Text' },
  { name: 'neon', label: 'Neon' },
];

// ── Preset configurations ───────────────────────────────────────────
const presets: { label: string; config: Partial<PlaygroundState> }[] = [
  {
    label: 'News Ticker',
    config: {
      text: 'BREAKING NEWS: React Pixel Display v2 released!',
      effect: 'scroll_rtl' as EffectName,
      speed: 40,
      foregroundColor: '#ff0000',
      backgroundColor: '#111111',
      width: 128,
      height: 16,
      glow: true,
    },
  },
  {
    label: 'Retro Arcade',
    config: {
      text: 'INSERT COIN',
      effect: 'blink' as EffectName,
      speed: 50,
      foregroundColor: '#00ff66',
      backgroundColor: '#000000',
      width: 96,
      height: 16,
      glow: true,
    },
  },
  {
    label: 'Neon Sign',
    config: {
      text: 'OPEN 24/7',
      effect: 'neon' as EffectName,
      speed: 35,
      foregroundColor: '#ff00ff',
      backgroundColor: '#0a0a1a',
      width: 96,
      height: 16,
      glow: true,
    },
  },
  {
    label: 'Stock Ticker',
    config: {
      text: 'AAPL +2.4%  GOOG -0.8%  TSLA +5.1%  AMZN +1.2%',
      effect: 'scroll_rtl' as EffectName,
      speed: 50,
      foregroundColor: '#00ccff',
      backgroundColor: '#111111',
      width: 128,
      height: 16,
      glow: false,
    },
  },
  {
    label: 'Fireplace',
    config: {
      text: '',
      effect: 'fire' as EffectName,
      speed: 60,
      foregroundColor: '#ff6600',
      backgroundColor: '#000000',
      width: 64,
      height: 32,
      glow: true,
    },
  },
  {
    label: 'Matrix Rain',
    config: {
      text: '',
      effect: 'matrix' as EffectName,
      speed: 55,
      foregroundColor: '#00ff41',
      backgroundColor: '#000000',
      width: 64,
      height: 32,
      glow: true,
    },
  },
];

// ── State type ──────────────────────────────────────────────────────
interface PlaygroundState {
  text: string;
  effect: EffectName;
  speed: number;
  foregroundColor: string;
  backgroundColor: string;
  width: number;
  height: number;
  scale: number;
  pixelGap: number;
  glow: boolean;
  renderer: RendererType;
}

const defaults: PlaygroundState = {
  text: 'HELLO WORLD!',
  effect: 'scroll_rtl',
  speed: 100,
  foregroundColor: '#ff6600',
  backgroundColor: '#111111',
  width: 96,
  height: 16,
  scale: 5,
  pixelGap: 0.15,
  glow: true,
  renderer: 'imagedata',
};

// ── Styles ──────────────────────────────────────────────────────────
const panel: React.CSSProperties = {
  background: '#12122a',
  border: '1px solid #2a2a4a',
  borderRadius: '10px',
  padding: '16px',
  marginBottom: '12px',
};

const labelStyle: React.CSSProperties = {
  color: '#999',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #2a2a4a',
  borderRadius: '6px',
  background: '#0a0a1e',
  color: '#e0e0e0',
  fontSize: '13px',
  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  padding: '7px 10px',
  border: '1px solid #2a2a4a',
  borderRadius: '6px',
  background: '#0a0a1e',
  color: '#e0e0e0',
  fontSize: '13px',
  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  boxSizing: 'border-box',
  cursor: 'pointer',
  appearance: 'auto',
};

const chipBase: React.CSSProperties = {
  padding: '3px 10px',
  border: '1px solid #333',
  borderRadius: '4px',
  background: '#1a1a2e',
  color: '#bbb',
  cursor: 'pointer',
  fontSize: '11px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
};

const inlineRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const sliderLabel: React.CSSProperties = {
  ...labelStyle,
  minWidth: '90px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '4px',
};

const sliderValue: React.CSSProperties = {
  color: '#ff6600',
  fontVariantNumeric: 'tabular-nums',
  fontSize: '11px',
  fontWeight: 700,
};

// ── Component ───────────────────────────────────────────────────────
export default function TickerPlayground() {
  const ref = useRef<PixelDisplayRef>(null);
  const [state, setState] = useState<PlaygroundState>(defaults);
  const [playing, setPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = useCallback(
    <K extends keyof PlaygroundState>(key: K, value: PlaygroundState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const applyPreset = useCallback((config: Partial<PlaygroundState>) => {
    setState((prev) => ({ ...prev, ...config }));
  }, []);

  const togglePlayback = () => {
    if (ref.current?.isRunning()) {
      ref.current.stop();
      setPlaying(false);
    } else {
      ref.current?.start();
      setPlaying(true);
    }
  };

  // Build a copyable code snippet reflecting the current configuration
  const codeSnippet = [
    '<PixelDisplay',
    state.text ? `  text="${state.text}"` : null,
    `  effect="${state.effect}"`,
    state.speed !== 100 ? `  speed={${state.speed}}` : null,
    state.foregroundColor !== '#ff6600' ? `  foregroundColor="${state.foregroundColor}"` : null,
    state.backgroundColor !== '#111111' ? `  backgroundColor="${state.backgroundColor}"` : null,
    state.width !== 64 ? `  width={${state.width}}` : null,
    state.height !== 16 ? `  height={${state.height}}` : null,
    state.scale !== 8 ? `  scale={${state.scale}}` : null,
    state.pixelGap !== 0.15 ? `  pixelGap={${state.pixelGap}}` : null,
    state.glow ? '  glow' : null,
    state.renderer !== 'imagedata' ? `  renderer="${state.renderer}"` : null,
    '/>',
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = codeSnippet;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAmbient = (ambientEffects as { name: EffectName }[]).some(
    (e) => e.name === state.effect,
  );

  // Find current effect label for display
  const allEffects = [...textEffects, ...colorEffects, ...ambientEffects];
  const currentEffectLabel = allEffects.find((e) => e.name === state.effect)?.label ?? state.effect;

  return (
    <div style={{ margin: '1.5rem 0' }}>
      {/* ── Live display ─────────────────────────────────── */}
      <div style={{ ...panel, textAlign: 'center', background: '#0a0a1a', position: 'relative' }}>
        <div
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'inline-block',
            maxWidth: '100%',
          }}
        >
          <PixelDisplay
            ref={ref}
            text={isAmbient ? '' : state.text}
            effect={state.effect}
            speed={state.speed}
            foregroundColor={state.foregroundColor}
            backgroundColor={state.backgroundColor}
            width={state.width}
            height={state.height}
            scale={state.scale}
            pixelGap={state.pixelGap}
            glow={state.glow}
            renderer={state.renderer}
          />
        </div>
      </div>

      {/* ── Presets ───────────────────────────────────────── */}
      <div style={panel}>
        <span style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Presets</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.config)}
              style={{
                ...chipBase,
                background: '#1e1e3a',
                borderColor: '#3a3a6e',
                color: '#c9b0ff',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Text + playback ──────────────────────────────── */}
      <div style={panel}>
        <span style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>Text</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={state.text}
            onChange={(e) => set('text', e.target.value)}
            placeholder={isAmbient ? '(ambient effects ignore text)' : 'Enter ticker text...'}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={togglePlayback}
            style={{
              ...chipBase,
              padding: '8px 14px',
              fontSize: '13px',
              background: playing ? '#1a2a1a' : '#2a1a1a',
              borderColor: playing ? '#3a6a3a' : '#6a3a3a',
              color: playing ? '#4ade80' : '#f87171',
              flexShrink: 0,
            }}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      {/* ── Effect + Speed ───────────────────────────────── */}
      <div style={{ ...panel, display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ ...inlineRow, flex: '1 1 280px', minWidth: 0 }}>
          <span style={labelStyle}>Effect</span>
          <select
            value={state.effect}
            onChange={(e) => set('effect', e.target.value as EffectName)}
            style={{ ...selectStyle, flex: 1, minWidth: 0 }}
          >
            <optgroup label="Text Effects">
              {textEffects.map(({ name, label }) => (
                <option key={name} value={name}>{label}</option>
              ))}
            </optgroup>
            <optgroup label="Color Effects">
              {colorEffects.map(({ name, label }) => (
                <option key={name} value={name}>{label}</option>
              ))}
            </optgroup>
            <optgroup label="Ambient Effects (no text)">
              {ambientEffects.map(({ name, label }) => (
                <option key={name} value={name}>{label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div style={{ ...inlineRow, flex: '1 1 200px', minWidth: 0 }}>
          <span style={sliderLabel}>
            Speed <span style={sliderValue}>{state.speed}</span>
          </span>
          <input
            type="range"
            min={1}
            max={100}
            value={state.speed}
            onChange={(e) => set('speed', Number(e.target.value))}
            style={{ flex: 1, accentColor: '#ff6600', minWidth: 0 }}
          />
        </div>
      </div>

      {/* ── Colors ───────────────────────────────────────── */}
      <div style={{ ...panel, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ ...inlineRow, flex: '1 1 200px' }}>
          <span style={labelStyle}>Foreground</span>
          <input
            type="color"
            value={state.foregroundColor}
            onChange={(e) => set('foregroundColor', e.target.value)}
            style={{
              width: '28px',
              height: '28px',
              border: '1px solid #2a2a4a',
              borderRadius: '4px',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            value={state.foregroundColor}
            onChange={(e) => set('foregroundColor', e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: '70px' }}
          />
        </div>
        <div style={{ ...inlineRow, flex: '1 1 200px' }}>
          <span style={labelStyle}>Background</span>
          <input
            type="color"
            value={state.backgroundColor}
            onChange={(e) => set('backgroundColor', e.target.value)}
            style={{
              width: '28px',
              height: '28px',
              border: '1px solid #2a2a4a',
              borderRadius: '4px',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            value={state.backgroundColor}
            onChange={(e) => set('backgroundColor', e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: '70px' }}
          />
        </div>
      </div>

      {/* ── Dimensions ───────────────────────────────────── */}
      <div style={{ ...panel, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {([
          { key: 'width' as const, label: 'Width', suffix: 'px', min: 16, max: 192, step: 8 },
          { key: 'height' as const, label: 'Height', suffix: 'px', min: 8, max: 64, step: 4 },
          { key: 'scale' as const, label: 'Scale', suffix: 'x', min: 1, max: 12, step: 1 },
          { key: 'pixelGap' as const, label: 'Pixel Gap', suffix: '', min: 0, max: 0.5, step: 0.01 },
        ] as const).map(({ key, label, suffix, min, max, step }) => (
          <div key={key} style={inlineRow}>
            <span style={{ ...sliderLabel, minWidth: '100px' }}>
              {label}{' '}
              <span style={sliderValue}>
                {key === 'pixelGap' ? state[key].toFixed(2) : state[key]}{suffix}
              </span>
            </span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={state[key]}
              onChange={(e) => set(key, Number(e.target.value))}
              style={{ flex: 1, accentColor: '#ff6600', minWidth: 0 }}
            />
          </div>
        ))}
      </div>

      {/* ── Options ──────────────────────────────────────── */}
      <div style={{ ...panel, display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={state.glow}
            onChange={(e) => set('glow', e.target.checked)}
            style={{ accentColor: '#ff6600' }}
          />
          <span style={{ color: '#ccc', fontSize: '13px' }}>Glow</span>
        </label>

        <div style={inlineRow}>
          <span style={labelStyle}>Renderer</span>
          <select
            value={state.renderer}
            onChange={(e) => set('renderer', e.target.value as RendererType)}
            style={selectStyle}
          >
            <option value="imagedata">imagedata</option>
            <option value="canvas">canvas</option>
            <option value="svg">svg</option>
          </select>
        </div>
      </div>

      {/* ── Generated code ───────────────────────────────── */}
      <div style={panel}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span style={{ ...labelStyle, margin: 0 }}>Generated Code</span>
          <button
            onClick={handleCopy}
            style={{
              ...chipBase,
              background: copied ? '#1a3a1a' : '#1a1a2e',
              color: copied ? '#4ade80' : '#999',
              borderColor: copied ? '#3a6a3a' : '#2a2a4a',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '12px',
            background: '#0a0a1e',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#c9d1d9',
            fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          }}
        >
          <code>{codeSnippet}</code>
        </pre>
      </div>
    </div>
  );
}
