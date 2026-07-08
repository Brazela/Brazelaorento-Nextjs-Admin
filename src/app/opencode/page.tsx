'use client';

import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'opencode_auth';

export default function OpenCodeWorkspace() {
  const [authB64, setAuthB64] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // On mount, restore saved auth (if any)
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAuthB64(saved);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both username and password are required.');
      return;
    }
    setError('');
    const encoded = btoa(`${username}:${password}`);
    sessionStorage.setItem(STORAGE_KEY, encoded);
    setAuthB64(encoded);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthB64('');
    setUsername('');
    setPassword('');
  }

  // If no auth saved, show login form
  if (!authB64) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d0d0d',
        padding: '20px',
        boxSizing: 'border-box',
      }}>
        <form onSubmit={handleLogin} style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          fontFamily: 'sans-serif',
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '1.5rem',
            color: '#fff',
            textAlign: 'center',
          }}>
            🔐 OpenCode Login
          </h1>
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '0.85rem',
            color: '#888',
            textAlign: 'center',
          }}>
            Enter your OpenCode server credentials
          </p>

          {error && (
            <div style={{
              backgroundColor: '#3a1212',
              color: '#ff6b6b',
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              color: '#ccc',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="opencode"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #444',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              color: '#ccc',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #444',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button type="submit" style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Connect
          </button>
        </form>
      </div>
    );
  }

  // Authenticated — show the iframe
  const iframeSrc = `/api/proxy/opencode?__theme=dark&__auth=${encodeURIComponent(authB64)}`;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#111',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        marginBottom: '15px',
        color: '#fff',
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ margin: '0', fontSize: '1.5rem' }}>💻 AI Agent Workspace</h1>
        <button onClick={handleLogout} style={{
          padding: '6px 16px',
          borderRadius: '6px',
          border: '1px solid #555',
          backgroundColor: 'transparent',
          color: '#ccc',
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}>
          Logout
        </button>
      </div>

      <div style={{
        flex: 1,
        width: '100%',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid #333',
      }}>
        <iframe
          src={iframeSrc}
          title="OpenCode AI Space Portal"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="clipboard-read; clipboard-write; cross-origin-isolated"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
