import React from 'react';

export default function OpenCodeWorkspace() {
  // Use the exact working root URL without a trailing slash
  const hfSpaceUrl = "https://oliverch-my-opencode-agent.hf.space";

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#111',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ marginBottom: '15px', color: '#fff', fontFamily: 'sans-serif' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>💻 AI Agent Workspace</h1>
      </div>

      <div style={{
        flex: 1,
        width: '100%',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid #333'
      }}>
        <iframe
          src={hfSpaceUrl}
          title="OpenCode AI Space Portal"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          // Ensures the session doesn't fail due to origin token blocks
          allow="clipboard-read; clipboard-write; cross-origin-isolated"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
