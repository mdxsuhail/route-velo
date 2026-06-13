# 🚌 RouteVelo — KSRTC Smart Logistics Platform

> **Digitizing informal KSRTC bus package deliveries via a secure, real-time, peer-to-transit logistics network.**

![RouteVelo Banner](https://img.shields.io/badge/RouteVelo-KSRTC%20Logistics-dc2626?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMCA4aC0zVjRIN2MtMS4xIDAtMiAuOS0yIDJ2MTRIMWM0LjQxIDMuMTIgNS41OSAzLjEyIDEwIDAiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10.16-0055FF?style=for-the-badge)

---

## 📖 Overview

RouteVelo is a premium React SPA that modernizes the informal KSRTC bus conductor parcel delivery system. It connects **Customers**, **Drivers (Conductors)**, and **Admins** in a unified real-time simulation sandbox, complete with a state-of-the-art glassmorphic authentication gate, dual interactive Leaflet.js real GPS maps (for both Admin dispatchers and Customers tracking their packages), a live diagnostics cockpit, and an AI assistant (VeloBot).

---

## ✨ Features

### 🔐 Premium Auth Gate
- **Tabbed Login options** for Customer, Conductor, and Admin credentials
- **OTP Verification Flow** for customer simulation (animated digit boxes with focus shifting)
- **Badge/Passkey Verification** for drivers (e.g. `DRV-9932`) and admins (`KSRTC-ADMIN-2026`)
- **Developer Bypass Shortcuts** (Google/Apple login simulations and immediate role switch)
- **Session Termination** — fully functional Sign Out capability from all views

### 👤 Customer Dashboard
- **Wallet** with UPI top-up simulation and full transaction history
- **Active Orders** with live filtering (All / Sending / Receiving) and real-time search
- **Interactive Leaflet.js GPS Route Map** — real-world dark-mode map centering on the active bus, with route stop depot markers and geodesic path polylines
- **VeloBot AI Chat** — responds to `/status`, `/eta`, `/driver`, `/otp` queries using live state
- **Booking Flow** (4-step) — destination, contacts, pricing tier (Express / Standard / Economy), fare breakdown with GST
- **Loyalty Streak** rewards system with RouteCoins
- **Nearby Kiosks** simulated map overlay
- **Web Audio API** — subtle click, beep, and chime sound effects throughout

### 🚌 Driver Console
- **Diagnostics Cockpit HUD** — Engine Temp, Fuel %, RPM, Tire PSI gauges (with color-coded warnings)
- **Cargo Inventory Manifest** — all parcels assigned to the selected bus
- **Simulated QR/Barcode Scanner** — animated green laser line + audio beep on scan success
- **Ad-Hoc Bypass Snap** — camera evidence UI for absent receivers
- **OTP Delivery Verification** — manual 4-digit entry or scan to mark delivered
- **Geofence Scheduler** — 2-minute mandatory countdown timer on stop arrival

### 🛠 Admin Command Center
- **Live KPI Dashboard** — Total Revenue & Active Load counts
- **Global Fleet Tracker Map** — integrated dark-mode CartoDB Leaflet map displaying South/Central Karnataka routes with live pulsing bus markers and diagnostic tooltip popups
- **SVG Bar Chart** — Daily revenue trend (Mon–Sun), clickable bars
- **SVG Donut Chart** — Cargo classification split (Express / Standard / Economy)
- **Fleet Monitor Table** — All buses with live status, speed, fuel
- **Critical Alert Feed** — Operational alarms (engine overheat, low PSI, delays)
- **Backup Dispatch** — One-click backup bus dispatch that transfers all cargo

### 🖥 Developer Simulation Deck (Sidebar)
- **Instant Role Switcher** — Jump between Customer / Driver / Admin
- **Time Progression** — Advance all buses +15 minutes, update ETAs, auto-trigger arrivals
- **Incident Injectors** — Engine overheat on AW-102, traffic jam on RJ-205, low tire PSI on KS-442
- **Telemetry Log Terminal** — Retro monospace activity log stream

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 8 |
| Animations | Framer Motion 10 |
| Icons | Lucide React |
| Styling | Vanilla CSS (CSS Variables, Glassmorphism) |
| Audio | Web Audio API (synthesized beeps/chimes) |
| Maps | Leaflet.js, OpenStreetMap, CartoDB Dark Matter tiles |
| Charts | Hand-crafted SVG bar & donut charts |
| State | React `useState` / `useEffect` (no external store) |
| Font | Outfit + JetBrains Mono (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/mdxsuhail/route-velo.git
cd route-velo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 🗂 Project Structure

```
routevelo-app/
├── src/
│   ├── App.jsx          # Main application (all components, state, simulation logic)
│   └── index.css        # Design system (CSS variables, glassmorphism, utilities)
├── index.html           # Root HTML with Google Fonts preload
├── vite.config.js       # Vite configuration
└── package.json
```

---

## 🎮 How to Use the Simulator

1. **Open the app** — you start on the Customer dashboard by default
2. **Use the Developer Simulation Deck** (right sidebar on desktop) to:
   - Switch between Customer / Driver / Admin roles instantly
   - Click **"Advance Time (+15m)"** to move buses along routes and update ETAs
   - Inject faults like **engine overheat** or **low tire pressure**
3. **As Customer** — book a shipment, pick a bus, pay from wallet, track on the SVG map, chat with VeloBot
4. **As Driver** — switch to your assigned bus, scan packages via the QR scanner (listen for the beep!), trigger geofence arrival
5. **As Admin** — view the revenue charts, resolve the overheating alarm by dispatching a backup bus

---

## 🌐 Supported Languages

| Language | Status |
|---|---|
| English | ✅ Full |
| Kannada (ಕನ್ನಡ) | ✅ Full |
| Hindi (हिंदी) | ✅ Full |

Change language in **Profile → Localization Language**.

---

## 📸 Key Screens

| Screen | Description |
|---|---|
| Auth | Role-based login (Customer / Driver / Admin) with OTP flow |
| Customer Dashboard | Wallet, active parcels, SVG map, VeloBot |
| Booking Flow | 4-step parcel booking with fare calculator |
| Tracking View | Full-screen SVG route tracker + delivery milestones |
| Driver Console | Cockpit HUD, QR scanner, geofence timer |
| Admin Center | Revenue charts, fleet monitors, alert resolution |

---

## 📄 License

This project is for demonstration and educational purposes.

---

<div align="center">
  <strong>Built with ❤️ for the KSRTC Logistics Ecosystem</strong><br/>
  <sub>RouteVelo — Moving Karnataka, One Package at a Time.</sub>
</div>
