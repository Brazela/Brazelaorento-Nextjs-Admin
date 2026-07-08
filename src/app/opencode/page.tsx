
import React from 'react';

export default function OpenCodeWorkspace() {
  // Replace this with your actual direct Hugging Face subdomain URL
// 1. Define your secure credentials matching your Hugging Face secrets
  const username = "opencode"; // Or your custom OPENCODE_SERVER_USERNAME
  const password = "Kingisr912312."; // Your exact OPENCODE_SERVER_PASSWORD

  // 2. Format the URL to inject basic authentication natively
  const hfSpaceUrl = `https://${username}:${password}@oliverch-my-opencode-agent2.hf.space?__theme=dark`;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#111', // Matches standard terminal dashboard dark themes
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Header Panel */}
      <div style={{ marginBottom: '15px', color: '#fff', fontFamily: 'sans-serif' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>💻 AI Agent Workspace</h1>
      </div>

      {/* Embedded Terminal Frame Area */}
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
          // Crucial attributes to allow token transfers and interactions
          // Ensures the session doesn't fail due to origin token blocks
          allow="clipboard-read; clipboard-write; cross-origin-isolated"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}