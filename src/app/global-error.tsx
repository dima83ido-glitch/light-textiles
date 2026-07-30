"use client";

import { useEffect } from "react";

// Catches errors thrown by the ROOT layout itself (src/app/layout.tsx) — the one case
// app/[locale]/error.tsx can't cover, since that boundary lives *inside* the root layout.
// Next.js requires this file to render its own <html>/<body> because the layout that
// would normally provide them is the thing that failed. No next-intl, no design-system
// components — kept deliberately minimal/self-contained so it can't itself fail to render.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="uk">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: 600 }}>Щось пішло не так</h1>
          <p style={{ color: "#6b7280" }}>Сталася непередбачена помилка. Спробуйте ще раз.</p>
        </div>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: "9999px",
            padding: "0.75rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            background: "#10161f",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Спробувати ще раз
        </button>
      </body>
    </html>
  );
}
