export default function OfflinePage() {
  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>BONZO_media_HUB — Offline</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #0a0a12;
            color: #e1e1e8;
            font-family: 'JetBrains Mono', monospace, monospace;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .container {
            max-width: 480px;
            width: 100%;
            border: 1px solid #1e1e2e;
            padding: 40px;
          }
          .badge {
            display: inline-block;
            background: #00d4aa22;
            border: 1px solid #00d4aa44;
            color: #00d4aa;
            font-size: 10px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            padding: 4px 10px;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #00d4aa;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 11px;
            color: #6b6b8a;
            letter-spacing: 0.05em;
            margin-bottom: 32px;
          }
          .status-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
            color: #6b6b8a;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #ef4444;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          .info {
            border-left: 2px solid #00d4aa44;
            padding-left: 16px;
            margin: 24px 0;
            font-size: 12px;
            color: #9999b8;
            line-height: 1.7;
          }
          .btn {
            display: inline-block;
            margin-top: 24px;
            padding: 10px 24px;
            background: #00d4aa;
            color: #0a0a12;
            font-family: inherit;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            border: none;
            cursor: pointer;
            text-decoration: none;
          }
          .btn:hover { background: #00b894; }
          .terminal {
            margin-top: 32px;
            font-size: 10px;
            color: #3d3d5c;
            line-height: 1.8;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="badge">BONZO_media_HUB</div>
          <h1>{">"} NO_CONNECTION</h1>
          <p className="subtitle">Brak połączenia z internetem</p>

          <div className="status-row">
            <span className="dot" />
            STATUS: OFFLINE
          </div>
          <div className="status-row" style={{ color: '#00d4aa', gap: '8px' }}>
            <span style={{ color: '#00d4aa' }}>✓</span>
            PWA_CACHE: AKTYWNY
          </div>

          <div className="info">
            Aplikacja jest zainstalowana i działa lokalnie.<br />
            Twoja muzyka, playlists i filmy z biblioteki są dostępne offline.<br />
            <br />
            Połącz się z internetem aby korzystać ze Streams,<br />
            wyszukiwania tekstów i okładek.
          </div>

          <a href="/" className="btn">POWRÓT DO APLIKACJI</a>

          <div className="terminal">
            <div>[SYS] service_worker: running</div>
            <div>[SYS] cache_storage: available</div>
            <div>[SYS] media_library: local_only</div>
            <div>[SYS] waiting_for_network...</div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // Auto-reload gdy połączenie wróci
            window.addEventListener('online', function() {
              document.querySelector('.dot').style.background = '#00d4aa';
              document.querySelector('.dot').style.animation = 'none';
              setTimeout(function() { window.location.reload(); }, 800);
            });
          `
        }} />
      </body>
    </html>
  )
}
