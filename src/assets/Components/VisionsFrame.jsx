import React from 'react'

export default function VisionsFrame() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#fff' }}>
      <iframe
        title="Visions Project"
        src="/Visions/index.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  )
}
