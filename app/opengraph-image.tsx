import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BugReport — Track bugs, ship better software'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
            }}
          >
            🐛
          </div>
          <span style={{ fontSize: 56, fontWeight: 700, color: '#f4f4f5', letterSpacing: '-1px' }}>
            BugReport
          </span>
        </div>

        {/* Headline */}
        <p
          style={{
            fontSize: 34,
            color: '#a1a1aa',
            margin: 0,
            textAlign: 'center',
            maxWidth: 760,
            lineHeight: 1.4,
          }}
        >
          Track bugs, ship better software
        </p>

        {/* Pill tags */}
        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          {['Simple REST API', 'Free to start', 'Works with any app'].map((tag) => (
            <div
              key={tag}
              style={{
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: 999,
                padding: '10px 22px',
                fontSize: 18,
                color: '#a5b4fc',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
