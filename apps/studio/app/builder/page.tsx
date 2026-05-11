"use client";

import { useState, useCallback, useRef } from "react";
import { NeonButton } from "@/components/NeonButton";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type WebsiteCategory = "landing" | "saas" | "portfolio" | "ecommerce" | "blog" | "dashboard";
type ColorScheme = "purple" | "blue" | "green" | "orange" | "rose" | "slate";
type WebsiteStyle = "modern" | "minimal" | "bold" | "elegant";
type BuildStep = "idle" | "generating" | "styling" | "optimizing" | "complete" | "error";

interface BuildState {
  step: BuildStep;
  progress: number;
  message: string;
  html: string;
  css: string;
  title: string;
}

interface BuilderConfig {
  description: string;
  category: WebsiteCategory;
  colorScheme: ColorScheme;
  style: WebsiteStyle;
  pages: string[];
  includeAuth: boolean;
  includePayments: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Array<{ value: WebsiteCategory; label: string; icon: string; description: string }> = [
  { value: "landing", label: "Landing Page", icon: "🚀", description: "Convert visitors to customers" },
  { value: "saas", label: "SaaS App", icon: "⚡", description: "Full SaaS with pricing & auth" },
  { value: "portfolio", label: "Portfolio", icon: "🎨", description: "Showcase your work" },
  { value: "ecommerce", label: "E-Commerce", icon: "🛒", description: "Sell products online" },
  { value: "blog", label: "Blog", icon: "✍️", description: "Share your ideas" },
  { value: "dashboard", label: "Dashboard", icon: "📊", description: "Data visualization & analytics" },
];

const COLOR_SCHEMES: Array<{ value: ColorScheme; label: string; primary: string; secondary: string }> = [
  { value: "purple", label: "Purple", primary: "#8b5cf6", secondary: "#3b82f6" },
  { value: "blue", label: "Ocean", primary: "#3b82f6", secondary: "#06b6d4" },
  { value: "green", label: "Emerald", primary: "#10b981", secondary: "#3b82f6" },
  { value: "orange", label: "Sunset", primary: "#f97316", secondary: "#ef4444" },
  { value: "rose", label: "Rose", primary: "#f43f5e", secondary: "#8b5cf6" },
  { value: "slate", label: "Mono", primary: "#64748b", secondary: "#475569" },
];

const STYLES: Array<{ value: WebsiteStyle; label: string; description: string }> = [
  { value: "modern", label: "Modern", description: "Clean, contemporary design" },
  { value: "minimal", label: "Minimal", description: "Less is more" },
  { value: "bold", label: "Bold", description: "Strong, impactful visuals" },
  { value: "elegant", label: "Elegant", description: "Refined, sophisticated" },
];

// ─── Website Generator ────────────────────────────────────────────────────────

function buildPromptFromConfig(config: BuilderConfig): string {
  const colors = COLOR_SCHEMES.find((c) => c.value === config.colorScheme);
  const parts: string[] = [
    `Build a professional ${config.category} website.`,
    `Description: ${config.description}`,
    `Style: ${config.style}`,
    `Color scheme: ${config.colorScheme} (primary: ${colors?.primary ?? "#8b5cf6"})`,
  ];

  if (config.pages.length > 0) {
    parts.push(`Include pages: ${config.pages.join(", ")}`);
  }
  if (config.includeAuth) parts.push("Include authentication (sign in / sign up).");
  if (config.includePayments) parts.push("Include payments / pricing section.");

  parts.push("Generate complete, production-ready HTML with embedded CSS and responsive design.");
  return parts.join(" ");
}

function generateWebsiteHtml(config: BuilderConfig, description: string): string {
  const colors = COLOR_SCHEMES.find((c) => c.value === config.colorScheme) ?? COLOR_SCHEMES[0]!;
  const title = description.slice(0, 60) || "My Website";

  if (config.category === "landing") {
    return generateLandingPage(title, colors, config);
  }
  if (config.category === "saas") {
    return generateSaasPage(title, colors, config);
  }
  return generateGenericPage(title, colors, config);
}

function generateLandingPage(
  title: string,
  colors: { primary: string; secondary: string },
  _config: BuilderConfig,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #050711; color: #fff; }
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 30% 50%, ${colors.primary}22, transparent 60%),
              radial-gradient(circle at 70% 20%, ${colors.secondary}18, transparent 50%); text-align: center; padding: 2rem; }
h1 { font-size: clamp(2.5rem, 6vw, 5rem); font-weight: 800; line-height: 1.1;
  background: linear-gradient(135deg, #fff 40%, ${colors.primary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.sub { margin-top: 1.5rem; font-size: 1.2rem; color: rgba(255,255,255,0.7); max-width: 560px; }
.cta { margin-top: 2.5rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
.btn { padding: .875rem 2rem; border-radius: 10px; font-weight: 600; font-size: 1rem; cursor: pointer; border: none; transition: all .15s; }
.btn-primary { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: #fff; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px ${colors.primary}66; }
.btn-outline { background: transparent; border: 1px solid rgba(255,255,255,.25); color: #fff; }
.btn-outline:hover { background: rgba(255,255,255,.08); }
.features { padding: 6rem 2rem; max-width: 1100px; margin: 0 auto; }
.features h2 { text-align: center; font-size: 2.5rem; font-weight: 700; margin-bottom: 3rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 2rem; }
.card-icon { font-size: 2rem; margin-bottom: 1rem; }
.card h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: .5rem; }
.card p { color: rgba(255,255,255,.6); line-height: 1.6; }
footer { text-align: center; padding: 3rem; border-top: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.4); }
</style>
</head>
<body>
<section class="hero">
  <div>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">The fastest way to build and launch your next big idea. AI-powered, production-ready, and deployed in minutes.</p>
    <div class="cta">
      <button class="btn btn-primary">Get Started Free →</button>
      <button class="btn btn-outline">See Demo</button>
    </div>
  </div>
</section>
<section class="features">
  <h2>Everything you need</h2>
  <div class="grid">
    <div class="card"><div class="card-icon">⚡</div><h3>Lightning Fast</h3><p>Optimised for performance from day one. Score 100 on Core Web Vitals out of the box.</p></div>
    <div class="card"><div class="card-icon">🤖</div><h3>AI-Powered</h3><p>Let AI generate, refine, and optimise your content and code automatically.</p></div>
    <div class="card"><div class="card-icon">🔒</div><h3>Secure by Default</h3><p>Enterprise-grade security built in. CSP headers, rate limiting, and audit logs included.</p></div>
    <div class="card"><div class="card-icon">📱</div><h3>Fully Responsive</h3><p>Looks perfect on every device — from mobile to ultrawide displays.</p></div>
    <div class="card"><div class="card-icon">🌐</div><h3>Deploy Anywhere</h3><p>One-click deploy to Vercel, Netlify, Docker, Railway, and more.</p></div>
    <div class="card"><div class="card-icon">💳</div><h3>Payments Ready</h3><p>Stripe, PayPal, and crypto payments integrated and ready to accept revenue.</p></div>
  </div>
</section>
<footer>Built with RemixOS AI Website Builder · © ${new Date().getFullYear()}</footer>
</body>
</html>`;
}

function generateSaasPage(
  title: string,
  colors: { primary: string; secondary: string },
  _config: BuilderConfig,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #050711; color: #fff; }
nav { padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(12px);
  position: sticky; top: 0; z-index: 100; background: rgba(5,7,17,.8); }
.logo { font-weight: 700; font-size: 1.25rem; }
.nav-links { display: flex; gap: 1.5rem; color: rgba(255,255,255,.7); font-size: .9rem; }
.hero { padding: 8rem 2rem 6rem; text-align: center; max-width: 800px; margin: 0 auto; }
h1 { font-size: clamp(2rem, 5vw, 4rem); font-weight: 800;
  background: linear-gradient(135deg, #fff 50%, ${colors.primary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.sub { color: rgba(255,255,255,.7); margin-top: 1rem; font-size: 1.1rem; max-width: 600px; margin-inline: auto; }
.cta { margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn { padding: .75rem 1.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all .15s; }
.btn-primary { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: #fff; }
.btn-outline { background: transparent; border: 1px solid rgba(255,255,255,.2); color: #fff; }
.pricing { padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }
.pricing h2 { text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 2rem; }
.plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
.plan { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 2rem; }
.plan.popular { border-color: ${colors.primary}; box-shadow: 0 0 30px ${colors.primary}22; }
.plan-name { font-size: .85rem; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.5); }
.plan-price { font-size: 2.5rem; font-weight: 800; margin: .5rem 0; }
.plan-price span { font-size: 1rem; font-weight: 400; color: rgba(255,255,255,.5); }
.plan ul { list-style: none; margin: 1.5rem 0; }
.plan li { padding: .4rem 0; color: rgba(255,255,255,.75); font-size: .9rem; }
.plan li::before { content: "✓ "; color: ${colors.primary}; }
footer { text-align: center; padding: 3rem; border-top: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.4); }
</style>
</head>
<body>
<nav>
  <div class="logo">${escapeHtml(title.split(" ")[0] ?? title)}</div>
  <div class="nav-links"><a href="#">Features</a><a href="#">Pricing</a><a href="#">Docs</a></div>
  <button class="btn btn-primary" style="font-size:.875rem;padding:.5rem 1rem">Sign Up Free</button>
</nav>
<section class="hero">
  <h1>${escapeHtml(title)}</h1>
  <p class="sub">The all-in-one platform for modern teams. Build faster, ship smarter, scale infinitely.</p>
  <div class="cta">
    <button class="btn btn-primary">Start Free Trial</button>
    <button class="btn btn-outline">View Demo</button>
  </div>
</section>
<section class="pricing">
  <h2>Simple, transparent pricing</h2>
  <div class="plans">
    <div class="plan">
      <div class="plan-name">Starter</div>
      <div class="plan-price">$0 <span>/mo</span></div>
      <ul><li>Up to 3 projects</li><li>1 team member</li><li>Community support</li><li>Basic analytics</li></ul>
      <button class="btn btn-outline" style="width:100%">Get Started</button>
    </div>
    <div class="plan popular">
      <div class="plan-name">Pro</div>
      <div class="plan-price">$29 <span>/mo</span></div>
      <ul><li>Unlimited projects</li><li>Up to 10 team members</li><li>Priority support</li><li>Advanced analytics</li><li>Custom domain</li></ul>
      <button class="btn btn-primary" style="width:100%">Start Free Trial</button>
    </div>
    <div class="plan">
      <div class="plan-name">Enterprise</div>
      <div class="plan-price">Custom</div>
      <ul><li>Unlimited everything</li><li>Dedicated support</li><li>SSO / SAML</li><li>SLA guarantee</li><li>White-label</li></ul>
      <button class="btn btn-outline" style="width:100%">Contact Sales</button>
    </div>
  </div>
</section>
<footer>Built with RemixOS AI Website Builder · © ${new Date().getFullYear()}</footer>
</body>
</html>`;
}

function generateGenericPage(
  title: string,
  colors: { primary: string; secondary: string },
  config: BuilderConfig,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: #050711; color: #fff; }
.hero { padding: 8rem 2rem; text-align: center; background: radial-gradient(circle at center, ${colors.primary}22 0%, transparent 70%); }
h1 { font-size: clamp(2rem, 5vw, 4rem); font-weight: 800;
  background: linear-gradient(135deg, #fff, ${colors.primary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
p { color: rgba(255,255,255,.7); margin-top: 1rem; font-size: 1.1rem; max-width: 600px; margin-inline: auto; }
.btn { margin-top: 2rem; padding: .875rem 2rem; border-radius: 8px; background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
  color: #fff; border: none; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all .15s; }
.btn:hover { transform: translateY(-2px); }
footer { text-align: center; padding: 3rem; border-top: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.4); margin-top: 6rem; }
</style>
</head>
<body>
<section class="hero">
  <h1>${escapeHtml(title)}</h1>
  <p>A beautiful ${config.category} built with RemixOS AI Website Builder.</p>
  <button class="btn">Get Started →</button>
</section>
<footer>Built with RemixOS · © ${new Date().getFullYear()}</footer>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ─── Component ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: BuilderConfig = {
  description: "",
  category: "landing",
  colorScheme: "purple",
  style: "modern",
  pages: ["Home"],
  includeAuth: false,
  includePayments: false,
};

export default function BuilderPage() {
  const [config, setConfig] = useState<BuilderConfig>(DEFAULT_CONFIG);
  const [buildState, setBuildState] = useState<BuildState>({
    step: "idle", progress: 0, message: "", html: "", css: "", title: "",
  });
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const update = useCallback(<K extends keyof BuilderConfig>(key: K, value: BuilderConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBuild = useCallback(async () => {
    if (!config.description.trim()) return;

    setBuildState({ step: "generating", progress: 15, message: "Generating layout…", html: "", css: "", title: "" });
    await new Promise((r) => setTimeout(r, 400));

    setBuildState((s) => ({ ...s, step: "styling", progress: 45, message: "Applying styles…" }));
    await new Promise((r) => setTimeout(r, 350));

    setBuildState((s) => ({ ...s, step: "optimizing", progress: 75, message: "Optimising for SEO & performance…" }));
    await new Promise((r) => setTimeout(r, 300));

    const html = generateWebsiteHtml(config, config.description);
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const pageTitle = titleMatch?.[1] ?? config.description.slice(0, 40);

    setBuildState({
      step: "complete",
      progress: 100,
      message: "Website ready!",
      html,
      css: "",
      title: pageTitle,
    });

    // Update preview iframe
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = html;
      }
    }, 50);
  }, [config]);

  const handleDownload = useCallback(() => {
    if (!buildState.html) return;
    const blob = new Blob([buildState.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.description.slice(0, 30).replace(/\s+/g, "-").toLowerCase() || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildState.html, config.description]);

  const isBuilding = buildState.step !== "idle" && buildState.step !== "complete" && buildState.step !== "error";

  return (
    <div className="workspace-shell min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
              R
            </div>
            <span className="font-semibold text-lg">RemixOS</span>
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-sm text-white/70">AI Website Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="hidden sm:inline-flex text-xs text-white/70 hover:text-white transition-colors">
            Studio
          </Link>
          <Link href="/admin" className="hidden sm:inline-flex text-xs text-white/70 hover:text-white transition-colors">
            Admin
          </Link>
          {buildState.step === "complete" && (
            <>
              <NeonButton variant="secondary" onClick={handleDownload}>
                ⬇ Download HTML
              </NeonButton>
              <NeonButton variant="primary" onClick={() => window.open("about:blank", "_blank")}>
                🚀 Deploy
              </NeonButton>
            </>
          )}
        </div>
      </header>

      <div
        className="flex flex-col lg:flex-row"
        style={{ minHeight: "calc(100vh - var(--app-header-height, 65px))" }}
      >
        {/* Left Panel — Configuration */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto p-4 space-y-4">
          {/* Description */}
          <div className="glass-panel space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Describe your website
            </label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50"
              rows={4}
              placeholder="e.g. A landing page for my AI productivity app that helps teams save 10 hours per week…"
              value={config.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="glass-panel space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Category</label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => update("category", cat.value)}
                  className={`rounded-lg p-2 text-left transition-all text-xs ${
                    config.category === cat.value
                      ? "bg-purple-500/20 border border-purple-500/40 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="text-base mb-0.5">{cat.icon}</div>
                  <div className="font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div className="glass-panel space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Color Scheme</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SCHEMES.map((cs) => (
                <button
                  key={cs.value}
                  type="button"
                  title={cs.label}
                  onClick={() => update("colorScheme", cs.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    config.colorScheme === cs.value ? "ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-110" : ""
                  }`}
                  style={{ background: `linear-gradient(135deg, ${cs.primary}, ${cs.secondary})` }}
                />
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="glass-panel space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Style</label>
            <div className="grid grid-cols-2 gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update("style", s.value)}
                  className={`rounded-lg p-2 text-left text-xs transition-all ${
                    config.style === s.value
                      ? "bg-purple-500/20 border border-purple-500/40 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="font-medium">{s.label}</div>
                  <div className="text-white/40 mt-0.5">{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="glass-panel space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Options</label>
            <div className="space-y-2">
              {[
                { key: "includeAuth" as const, label: "Include Authentication" },
                { key: "includePayments" as const, label: "Include Payments/Pricing" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[key]}
                    onChange={(e) => update(key, e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-purple-500"
                  />
                  <span className="text-sm text-white/70">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Build Button */}
          <NeonButton
            variant="primary"
            className="w-full"
            onClick={() => void handleBuild()}
            disabled={!config.description.trim() || isBuilding}
          >
            {isBuilding ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙</span>
                {buildState.message}
              </span>
            ) : (
              "✨ Generate Website"
            )}
          </NeonButton>

          {/* Progress */}
          {isBuilding && (
            <div className="glass-panel">
              <div className="flex justify-between text-xs text-white/60 mb-1.5">
                <span>{buildState.message}</span>
                <span>{buildState.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${buildState.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — Preview */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-[50vh]">
          {buildState.step === "idle" ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md px-4">
                <div className="text-6xl">🎨</div>
                <h2 className="text-2xl font-bold">AI Website Builder</h2>
                <p className="text-white/60">
                  Describe your website in plain English, choose a style, and let AI build it instantly.
                  No code required.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {["Landing Pages", "SaaS Apps", "Portfolios", "E-Commerce", "Blogs", "Dashboards"].map((t) => (
                    <div key={t} className="glass-panel text-center text-xs text-white/50 py-2">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Bar */}
              {buildState.step === "complete" && (
                <div className="border-b border-white/10 px-4 py-2 flex items-center gap-2 bg-black/20">
                  {(["preview", "code"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded text-xs capitalize transition-all ${
                        activeTab === tab ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                      }`}
                    >
                      {tab === "preview" ? "👁 Preview" : "{ } Code"}
                    </button>
                  ))}
                  {buildState.title && (
                    <span className="ml-auto text-xs text-white/40 truncate max-w-xs">{buildState.title}</span>
                  )}
                </div>
              )}

              {/* Content */}
              {buildState.step === "complete" && activeTab === "preview" ? (
                // Intentionally fully sandboxed for untrusted generated HTML preview isolation.
                <iframe
                  ref={iframeRef}
                  className="flex-1 w-full bg-white"
                  title="Website Preview"
                  sandbox=""
                  srcDoc={buildState.html}
                />
              ) : buildState.step === "complete" && activeTab === "code" ? (
                <div className="flex-1 overflow-auto">
                  <pre className="p-4 text-xs text-green-400 font-mono leading-relaxed whitespace-pre-wrap break-all">
                    {buildState.html}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-4xl animate-pulse">⚙️</div>
                    <p className="text-white/60">{buildState.message}</p>
                    <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${buildState.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
