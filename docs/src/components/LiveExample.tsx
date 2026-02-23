import { useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  code: string;
}

/**
 * Wraps a live demo with a Preview / Code tab toggle.
 * Preview shows the rendered component; Code shows the source snippet.
 */
export default function LiveExample({ children, code }: Props) {
  const [view, setView] = useState<'preview' | 'code'>('preview');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 14px',
    border: '1px solid #444',
    borderBottom: active ? '1px solid transparent' : '1px solid #444',
    borderRadius: '6px 6px 0 0',
    background: active ? '#1a1a2e' : 'transparent',
    color: active ? '#e0e0e0' : '#888',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'system-ui, sans-serif',
    marginRight: '2px',
    position: 'relative' as const,
    bottom: '-1px',
  });

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        <button onClick={() => setView('preview')} style={tabStyle(view === 'preview')}>
          Preview
        </button>
        <button onClick={() => setView('code')} style={tabStyle(view === 'code')}>
          Code
        </button>
      </div>
      <div
        style={{
          border: '1px solid #444',
          borderRadius: '0 8px 8px 8px',
          padding: '1rem',
          background: '#1a1a2e',
          minHeight: '60px',
        }}
      >
        {view === 'preview' ? (
          <div>{children}</div>
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
              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            }}
          >
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
