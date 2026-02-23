import { PixelDisplay } from 'react-pixel-display';
import type { EffectName } from 'react-pixel-display';

interface Props {
  type?: 'info' | 'success' | 'warning' | 'error';
}

const config: Record<string, { text: string; color: string; effect: EffectName }> = {
  info: { text: 'INFO: System online', color: '#00ccff', effect: 'scroll_rtl' },
  success: { text: 'OK: Deploy complete', color: '#00ff66', effect: 'breeze' },
  warning: { text: 'WARN: Disk 90%', color: '#ffcc00', effect: 'blink' },
  error: { text: 'ERR: Connection lost', color: '#ff0033', effect: 'blink' },
};

/**
 * Simulates different notification styles (info/success/warning/error).
 * Shows how to build a notification ticker with PixelDisplay.
 */
export default function NotificationDemo({ type = 'info' }: Props) {
  const { text, color, effect } = config[type] ?? config.info;

  return (
    <div style={{ margin: '1rem 0', borderRadius: '8px', overflow: 'hidden', display: 'inline-block' }}>
      <PixelDisplay
        text={text}
        effect={effect}
        speed={35}
        foregroundColor={color}
        backgroundColor="#111"
        width={96}
        height={16}
        scale={4}
        glow
      />
    </div>
  );
}
