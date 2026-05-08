# RemixOS — Desktop App Guide

## Overview

RemixOS Studio can be packaged as a native desktop application for Windows, macOS, and Linux using [Tauri](https://tauri.app) or [Electron](https://electronjs.org).

---

## Tauri (Recommended)

Tauri produces smaller, more secure desktop apps by leveraging the OS webview instead of bundling Chromium.

### Setup

```bash
# Prerequisites: Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
cargo install tauri-cli

# Add Tauri to the Studio app
cd apps/studio
pnpm add @tauri-apps/api
pnpm add -D @tauri-apps/cli
```

### Initialise Tauri

```bash
cd apps/studio
pnpm tauri init
```

Set `distDir` in `src-tauri/tauri.conf.json` to `../.next/out` (static export) or point to the dev server for development.

### Development

```bash
# Start Studio dev server + Tauri window
pnpm tauri dev
```

### Build Desktop App

```bash
# Build for current platform
pnpm tauri build

# Output: src-tauri/target/release/bundle/
#   .dmg  (macOS)
#   .exe / .msi  (Windows)
#   .AppImage / .deb  (Linux)
```

### Native Features via Tauri

| Feature | Tauri API | Usage |
|---------|-----------|-------|
| Filesystem | `@tauri-apps/api/fs` | Save/load workspace files |
| Notifications | `@tauri-apps/api/notification` | Build complete, deployment alerts |
| Shell | `@tauri-apps/api/shell` | Open terminal, run CLI commands |
| Window | `@tauri-apps/api/window` | Resize, fullscreen, always-on-top |
| Global shortcut | `@tauri-apps/api/globalShortcut` | ⌘K palette from any app |
| Auto-update | `@tauri-apps/api/updater` | OTA updates |
| System tray | `@tauri-apps/api/systemTray` | Background task indicator |

---

## Electron (Alternative)

For apps that need more platform access or npm ecosystem compatibility.

### Setup

```bash
pnpm add -D electron electron-builder
```

### Main Process (`apps/studio/electron/main.ts`)

```typescript
import { app, BrowserWindow } from "electron";
import path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",   // macOS
    backgroundMaterial: "acrylic",  // Windows 11
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const isDev = process.env["NODE_ENV"] === "development";
  if (isDev) {
    void win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    void win.loadFile(path.join(__dirname, "../out/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
```

### Build Desktop App

```bash
electron-builder --mac --win --linux
```

---

## Platform-Specific Notes

### macOS

- Native window chrome with `titleBarStyle: "hiddenInset"`
- Vibrancy effect for translucent panel backgrounds
- Touch Bar support via Electron's `TouchBar` API
- Notarisation required for distribution outside App Store

### Windows

- Acrylic / Mica material support (Windows 11)
- Custom title bar with drag region
- Snap layouts support via `electron-window-snap`
- Code signing required for Windows SmartScreen

### Linux

- `.AppImage` (universal), `.deb` (Debian/Ubuntu), `.rpm` (Fedora)
- System tray via `electron-tray-window`
- Wayland support via `ELECTRON_OZONE_PLATFORM_HINT=auto`

---

## GPU Acceleration

By default, Electron uses GPU acceleration for smooth animations:

```typescript
// Disable for headless/VMs
app.disableHardwareAcceleration();
```

Tauri uses the OS webview which is always GPU-accelerated.

---

## Native Filesystem Access

With Tauri's `fs` API, users can open and save workspace files directly:

```typescript
import { readTextFile, writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";

// Save generated website to downloads
await writeTextFile("website.html", generatedHtml, {
  dir: BaseDirectory.Download,
});
```

---

## Auto-Updates

Tauri updater configuration in `tauri.conf.json`:

```json
{
  "updater": {
    "active": true,
    "endpoints": ["https://releases.remixos.app/{{target}}/{{arch}}/{{current_version}}"],
    "dialog": true,
    "pubkey": "YOUR_PUBLIC_KEY"
  }
}
```

Generate keypair: `pnpm tauri signer generate`

---

## Build Pipeline

Add desktop builds to CI:

```yaml
# .github/workflows/desktop.yml
- name: Build Desktop (macOS)
  run: pnpm tauri build
  env:
    APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
    APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
    APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
```
