import type { ReactElement } from "react";

export const socialImageAlt =
  "RemixOS as a mythic atomic god forging AI websites from nuclear code, live deployments, and Web3 infrastructure.";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";

const providers = ["OPENAI", "ANTHROPIC", "GROK", "GEMINI"];
const outputs = ["LANDING", "SAAS", "PORTFOLIO", "ECOMMERCE"];
const signals = ["100% UPTIME", "SMARTBRAIN", "GXQS", "JWT", "RATE LIMITING"];
const rings = ["PNPM", "NEXT.JS", "DOCKER", "VERCEL", "NETLIFY", "SOLANA"];

function Badge({ label, tone = "cyan" }: { label: string; tone?: "cyan" | "gold" | "green" }) {
  const colors = {
    cyan: {
      background: "rgba(56, 189, 248, 0.12)",
      border: "1px solid rgba(125, 211, 252, 0.42)",
      color: "#dbeafe",
      boxShadow: "0 0 24px rgba(56, 189, 248, 0.18)",
    },
    gold: {
      background: "rgba(250, 204, 21, 0.14)",
      border: "1px solid rgba(253, 224, 71, 0.44)",
      color: "#fef3c7",
      boxShadow: "0 0 24px rgba(234, 179, 8, 0.2)",
    },
    green: {
      background: "rgba(74, 222, 128, 0.12)",
      border: "1px solid rgba(134, 239, 172, 0.42)",
      color: "#dcfce7",
      boxShadow: "0 0 24px rgba(34, 197, 94, 0.18)",
    },
  } as const;

  return (
    <div
      style={{
        ...colors[tone],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 16px",
        borderRadius: 9999,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

export function SocialImage(): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #02050d 0%, #07131d 34%, #08121a 62%, #010306 100%)",
        color: "#f8fafc",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "radial-gradient(circle at 20% 25%, rgba(16, 185, 129, 0.32), transparent 28%), radial-gradient(circle at 75% 18%, rgba(59, 130, 246, 0.24), transparent 24%), radial-gradient(circle at 70% 78%, rgba(245, 158, 11, 0.24), transparent 22%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 24,
          borderRadius: 28,
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -90,
          width: 420,
          height: 420,
          borderRadius: 9999,
          border: "1px solid rgba(250, 204, 21, 0.24)",
          boxShadow: "0 0 120px rgba(250, 204, 21, 0.18)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -130,
          left: -50,
          width: 340,
          height: 340,
          borderRadius: 9999,
          border: "1px solid rgba(59, 130, 246, 0.18)",
          boxShadow: "0 0 120px rgba(59, 130, 246, 0.14)",
          display: "flex",
        }}
      />

      <div
        style={{
          width: "54%",
          height: "100%",
          padding: "52px 0 44px 58px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 20,
              letterSpacing: 3.6,
              color: "#a5f3fc",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                background: "#34d399",
                boxShadow: "0 0 24px rgba(52, 211, 153, 0.8)",
                display: "flex",
              }}
            />
            Supreme Atomic Builder
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontSize: 80,
                lineHeight: 0.95,
                fontWeight: 900,
                letterSpacing: -2.5,
                color: "#f8fafc",
                textTransform: "uppercase",
              }}
            >
              RemixOS
            </div>
            <div
              style={{
                fontSize: 34,
                lineHeight: 1.15,
                fontWeight: 700,
                maxWidth: 520,
                color: "#fde68a",
              }}
            >
              The Atomic God of AI website production, nuclear uptime, and Web3-ready deployment mastery.
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              lineHeight: 1.45,
              maxWidth: 560,
              color: "rgba(226, 232, 240, 0.88)",
            }}
          >
            Living TypeScript architecture. Multi-provider AI plasma. Self-healing pipelines. Professional websites
            forged directly from prompt energy.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, maxWidth: 580 }}>
            {signals.map((signal, index) => (
              <Badge
                key={signal}
                label={signal}
                tone={index === 0 ? "gold" : index % 2 === 0 ? "green" : "cyan"}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 580 }}>
          {outputs.map((output, index) => (
            <Badge key={output} label={output} tone={index === 3 ? "gold" : "cyan"} />
          ))}
        </div>
      </div>

      <div
        style={{
          width: "46%",
          height: "100%",
          padding: "38px 46px 34px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 470,
            height: 560,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 124,
              width: 220,
              height: 220,
              borderRadius: 9999,
              border: "3px solid rgba(248, 250, 252, 0.12)",
              boxShadow: "0 0 48px rgba(59, 130, 246, 0.16)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 152,
              width: 164,
              height: 164,
              borderRadius: 9999,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.78) 18%, rgba(59,130,246,0.5) 42%, rgba(59,130,246,0.08) 70%, transparent 100%)",
              boxShadow: "0 0 80px rgba(255,255,255,0.22)",
              display: "flex",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 50,
              left: 62,
              display: "flex",
              gap: 10,
              transform: "rotate(-8deg)",
            }}
          >
            {rings.map((ring) => (
              <div
                key={ring}
                style={{
                  padding: "8px 12px",
                  borderRadius: 9999,
                  border: "1px solid rgba(248, 250, 252, 0.14)",
                  background: "rgba(15, 23, 42, 0.78)",
                  color: ring === "SOLANA" ? "#86efac" : "#e2e8f0",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 1,
                  boxShadow: "0 0 24px rgba(59, 130, 246, 0.12)",
                  display: "flex",
                }}
              >
                {ring}
              </div>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              top: 152,
              width: 246,
              height: 316,
              borderRadius: 124,
              background:
                "linear-gradient(180deg, rgba(226,232,240,0.9) 0%, rgba(120,113,108,0.2) 18%, rgba(15,23,42,0.98) 40%, rgba(2,6,23,0.98) 100%)",
              border: "1px solid rgba(226, 232, 240, 0.18)",
              boxShadow: "0 24px 80px rgba(2, 132, 199, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 24,
                borderRadius: 110,
                border: "1px solid rgba(96, 165, 250, 0.18)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 52,
                left: 82,
                width: 82,
                height: 24,
                borderRadius: 9999,
                background: "rgba(59,130,246,0.2)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 132,
                left: 68,
                width: 112,
                height: 8,
                borderRadius: 9999,
                background: "rgba(245, 158, 11, 0.5)",
                boxShadow: "0 0 22px rgba(245, 158, 11, 0.4)",
                display: "flex",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                width: 170,
              }}
            >
              <div
                style={{
                  height: 3,
                  borderRadius: 9999,
                  background:
                    "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.8) 30%, rgba(250,204,21,0.95) 50%, rgba(59,130,246,0.8) 70%, rgba(59,130,246,0) 100%)",
                  display: "flex",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#67e8f9",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {providers.map((provider) => (
                  <span key={provider}>{provider.slice(0, 2)}</span>
                ))}
              </div>
              <div
                style={{
                  height: 3,
                  borderRadius: 9999,
                  background:
                    "linear-gradient(90deg, rgba(250,204,21,0) 0%, rgba(250,204,21,0.85) 50%, rgba(250,204,21,0) 100%)",
                  display: "flex",
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: 236,
              right: -4,
              width: 176,
              padding: "18px 18px 16px",
              borderRadius: 20,
              background: "rgba(7, 18, 32, 0.94)",
              border: "1px solid rgba(250, 204, 21, 0.32)",
              boxShadow: "0 0 38px rgba(250, 204, 21, 0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "#cbd5e1" }}>
              <span>Admin Core</span>
              <span style={{ color: "#86efac" }}>LIVE</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#fef08a" }}>100%</div>
            <div style={{ fontSize: 18, color: "#67e8f9" }}>Uptime • Auto Deploy • Health OK</div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 88,
              left: 8,
              width: 194,
              padding: "18px 18px 16px",
              borderRadius: 22,
              background: "rgba(7, 18, 32, 0.92)",
              border: "1px solid rgba(34, 197, 94, 0.28)",
              boxShadow: "0 0 38px rgba(34, 197, 94, 0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 16, color: "#cbd5e1" }}>Generated from prompt energy</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#dcfce7" }}>Landing • SaaS • Store</div>
            <div style={{ fontSize: 17, color: "#86efac" }}>Wallet-ready • Audit logs • Sandboxed</div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 10,
              width: 360,
              height: 80,
              borderRadius: 9999,
              background:
                "radial-gradient(circle, rgba(245,158,11,0.34) 0%, rgba(245,158,11,0.12) 38%, rgba(245,158,11,0) 72%)",
              display: "flex",
            }}
          />
        </div>
      </div>
    </div>
  );
}
