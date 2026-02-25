import { useState, useCallback, useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  code: string;
}

/**
 * Wraps a live demo with an animated Preview / Code toggle and a copy button.
 * Uses a segmented-control pill with a sliding indicator for the active state.
 */
export default function LiveExample({ children, code }: Props) {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  // Inject keyframe animation once
  useEffect(() => {
    if (document.getElementById('live-example-styles')) return;
    const style = document.createElement('style');
    style.id = 'live-example-styles';
    style.textContent = `
      @keyframes liveExFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const isPreview = view === 'preview';

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '4px 14px',
    border: 'none',
    borderRadius: '5px',
    background: 'transparent',
    color: active ? '#e0e0e0' : '#666',
    cursor: 'pointer',
    fontSize: '12.5px',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: active ? 600 : 400,
    position: 'relative',
    zIndex: 1,
    transition: 'color 0.2s ease',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div
        style={{
          border: '1px solid #333',
          borderRadius: '10px',
          background: '#1a1a2e',
          overflow: 'hidden',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid #333',
            background: '#12122a',
          }}
        >
          {/* Segmented toggle */}
          <div
            style={{
              display: 'flex',
              background: '#0a0a1e',
              borderRadius: '7px',
              padding: '2px',
              position: 'relative',
              border: '1px solid #2a2a40',
            }}
          >
            {/* Sliding pill indicator */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                width: 'calc(50% - 2px)',
                height: 'calc(100% - 4px)',
                background: '#2d2d5e',
                borderRadius: '5px',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isPreview ? 'translateX(0)' : 'translateX(100%)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            />
            <button onClick={() => setView('preview')} style={toggleBtnStyle(isPreview)}>
              Preview
            </button>
            <button onClick={() => setView('code')} style={toggleBtnStyle(!isPreview)}>
              Code
            </button>
          </div>

          {/* Copy button — visible only in code view */}
          <button
            onClick={handleCopy}
            style={{
              padding: '4px 10px',
              border: '1px solid #2a2a40',
              borderRadius: '6px',
              background: copied ? '#1a3a1a' : '#0a0a1e',
              color: copied ? '#4ade80' : '#888',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'system-ui, sans-serif',
              opacity: !isPreview ? 1 : 0,
              pointerEvents: !isPreview ? 'auto' : 'none',
              transition: 'opacity 0.2s ease, background 0.15s ease, color 0.15s ease',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Content area */}
        <div style={{ padding: '1rem', minHeight: '60px', overflow: 'hidden' }}>
          <div key={view} style={{ animation: 'liveExFadeIn 0.2s ease' }}>
            {view === 'preview' ? (
              <div style={{ maxWidth: '100%', overflow: 'hidden' }}>{children}</div>
            ) : (
              <pre
                style={{
                  margin: 0,
                  padding: '0.75rem',
                  background: '#0d0d1a',
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: '#c9d1d9',
                  fontFamily:
                    "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                }}
              >
                <code>{code}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
