# 🚌 RouteVelo — KSRTC Smart Logistics Platform

> **Digitizing informal KSRTC bus package deliveries via a secure, real-time, peer-to-transit logistics network.**

![RouteVelo Banner](https://img.shields.io/badge/RouteVelo-KSRTC%20Smart%20Logistics-dc2626?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMCA4aC0zVjRIN2MtMS4xIDAtMiAuOS0yIDJ2MTRIMWM0LjQxIDMuMTIgNS41OSAzLjEyIDEwIDAiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10.16-0055FF?style=for-the-badge)
![KSRTC](https://img.shields.io/badge/KSRTC-Karnataka-fbbf24?style=for-the-badge)

---

## 📖 Overview

RouteVelo is a premium React SPA that modernizes the informal KSRTC bus conductor parcel delivery system across **Karnataka, India**. It connects **Customers**, **Drivers (Conductors)**, and **Admins** in a unified real-time simulation sandbox, complete with a state-of-the-art glassmorphic UI, KSRTC signature red & yellow branding, dual interactive Leaflet.js real GPS maps, live diagnostics, and an AI assistant (VeloBot).

The app features **dark & light mode**, a **dynamic ride scheduling system** where admins can schedule bus rides and assign drivers, and a **driver login system** that routes each conductor directly to their assigned bus console.

---

## ✨ Features

### 🎨 KSRTC Branding & Theming
- **Signature KSRTC Colors** — Red (`#dc2626`) and Yellow (`#fbbf24`) brand palette applied across the entire UI
- **Dark / Light Mode Toggle** — ☀️/🌙 button in the status bar for instant theme switching
- **Glassmorphism Design** — premium frosted-glass cards with smooth gradients and micro-animations
- **Google Fonts** — Outfit + JetBrains Mono for a modern, readable interface

### 🔐 Premium Auth Gate
- **Tabbed Login options** for Customer, Conductor, and Admin credentials
- **OTP Verification Flow** for customer simulation (animated digit boxes with focus shifting)
- **Assigned Bus Selector** — Drivers/Conductors select their specific KSRTC Bus ID on login and are routed directly to that bus's console
- **Badge/Passkey Verification** for drivers (e.g. `DRV-9932`) and admins (`KSRTC-ADMIN-2026`)
- **Developer Bypass Shortcuts** (Google/Apple login simulations and immediate role switch)
- **Session Termination** — fully functional Sign Out capability from all views

### 👤 Customer Dashboard
- **Journey Node** — shows `BLR` (Kempegowda Majestic) → `MYS` (Mysuru Central) with KSRTC Karnataka stop names
- **Wallet** with UPI top-up simulation and full transaction history
- **Active Orders** with live filtering (All / Sending / Receiving) and real-time search
- **Interactive Leaflet.js GPS Route Map** — real-world dark-mode map centering on the active bus, with route stop depot markers and geodesic path polylines
- **Live Bus Availability** — customers can see dynamically scheduled buses including admin-dispatched ones before booking
- **VeloBot AI Chat** — responds to `/status`, `/eta`, `/driver`, `/otp` queries using live state
- **Booking Flow** (4-step) — destination, contacts, pricing tier (Express / Standard / Economy), fare breakdown with GST
- **Loyalty Streak** rewards system with RouteCoins
- **Nearby Kiosks** simulated map overlay

### 🚌 Driver / Conductor Console
- **Assigned Bus Routing** — logging in with a Bus ID auto-loads that specific bus manifest and route details
- **Pre-Shift Safety Verification** — bus selector + 4-point safety checklist before shift starts; conductor name shown dynamically in header
- **Diagnostics Cockpit HUD** — Engine Temp, Fuel %, RPM, Tire PSI gauges (with color-coded warnings)
- **Cargo Inventory Manifest** — all parcels assigned to the selected bus
- **Simulated QR/Barcode Scanner** — animated green laser line + audio beep on scan success
- **Ad-Hoc Bypass Snap** — camera evidence UI for absent receivers
- **OTP Delivery Verification** — manual 4-digit entry or scan to mark delivered
- **Geofence Scheduler** — 2-minute mandatory countdown timer on stop arrival

### 🛠 Admin Command Center
- **Dynamic Ride Scheduling** — full form to schedule a new bus ride with:
  - Bus ID / License Plate
  - Bus Service Tier (Airavat Volvo, Rajahamsa, Karnataka Sarige)
  - Assigned Driver/Conductor name
  - Departure Time
  - Destination — choose from existing Karnataka stops **or** add a new Karnataka stop (auto-propagates to customer booking flow)
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

## 🗺 Karnataka Stop Network

The app is focused exclusively on **Karnataka KSRTC routes** originating from Bengaluru:

| Route | Key Stops |
|---|---|
| Bengaluru – Mysuru | Kengeri Transit Hub, Bidadi, Ramanagara, Mandya Hub, Mysuru Central Bus Stand |
| Bengaluru – Mangaluru | Yeshwanthpur, Hassan KSRTC Bus Stand, Mangaluru Bus Depot |
| Bengaluru – Hubli | Nelamangala Toll, Tumakuru Stand, Davangere KSRTC Stand, Hubli KSRTC Bus Stand |

> **Admins can also add a new Karnataka stop** through the scheduling form — the new stop dynamically appears in customer booking options.

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 8 |
| Animations | Framer Motion 10 |
| Icons | Lucide React |
| Styling | Vanilla CSS (CSS Variables, Glassmorphism, Dark/Light mode) |
| Audio | Web Audio API (synthesized beeps/chimes) |
| Maps | Leaflet.js, OpenStreetMap, CartoDB Dark Matter / Positron tiles |
| Charts | Hand-crafted SVG bar & donut charts |
| State | React Context API & `useContext` Hook |
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

```text
routevelo-app/
├── index.html                  # Global Leaflet scripts and stylesheet loads
├── src/
│   ├── App.jsx                 # Router Layout, status bar with theme toggle & Dev Simulation Panel
│   ├── index.css               # Main styling system, KSRTC brand tokens, themes, animations
│   ├── main.jsx                # React Entrypoint
│   ├── context/
│   │   └── SimulationContext.jsx  # Global state: buses, stopsList, driverBusId, theme, TTS
│   └── components/
│       ├── Header.jsx          # Top Navigation Bar & Toast alerts
│       ├── AuthPage.jsx        # Login Gate (Customer / Conductor with Bus Selector / Admin)
│       ├── CustomerDashboard.jsx  # Journey node (BLR→MYS), wallet, orders, kiosk map
│       ├── BookingFlow.jsx     # Waybill generation, dynamic stopsList, fare surcharges
│       ├── OrderHistoryView.jsx# Invoice manifest lists & printable waybill
│       ├── TrackingView.jsx    # Live transit timeline, milestones, conductor chat
│       ├── UserProfileView.jsx # Localizations, profile settings, unlocked themes
│       ├── DriverDashboard.jsx # Bus selector, safety checklist, QR scanner, engine/tire fixes
│       ├── AdminDashboard.jsx  # Stats, fleet map, dynamic ride scheduling & custom Karnataka stop form
│       ├── LiveVectorTrackingMap.jsx # Theme-reactive Leaflet map for customer tracking
│       └── AdminFleetMap.jsx   # Interactive Leaflet map for Admin command center
```

---

## 🎮 How to Use the Simulator

1. **Open the app** — starts on the Customer dashboard by default
2. **Toggle Dark / Light Mode** — tap the ☀️/🌙 icon next to the clock in the top status bar
3. **Use the Developer Simulation Deck** (right sidebar on desktop) to:
   - Switch between Customer / Driver / Admin roles instantly
   - Click **"Advance Time (+15m)"** to move buses along routes and update ETAs
   - Inject faults like **engine overheat** or **low tire pressure**
4. **As Admin** — use the **"Schedule & Dispatch Bus Ride"** form to create a new bus run:
   - Enter Bus ID, choose service type, assign a driver, set departure time
   - Pick a Karnataka destination or click **"Add Custom City"** to create a new stop
5. **As Customer** — book a shipment, pick a bus (including newly scheduled ones), pay from wallet, track on the GPS map, chat with VeloBot
6. **As Driver/Conductor** — select your assigned bus, complete the safety checklist, scan packages via the QR scanner, trigger geofence arrival

---

## 🌐 Supported Languages

| Language | Status |
|---|---|
| English | ✅ Full |
| Kannada (ಕನ್ನಡ) | ✅ Full |
| Hindi (हिंदी) | ✅ Full |

Change language in **Profile → Localization Language**.

---

## 📋 Changelog

### v2.0.0 — KSRTC Karnataka Edition
- 🔴🟡 **KSRTC Red & Yellow branding** applied across all UI theme variables
- ☀️🌙 **Dark / Light mode toggle** in the status bar
- 🗺️ **Karnataka-only stop network** — PITX/Cubao replaced with BLR (Kempegowda Majestic) and MYS (Mysuru Central)
- 📅 **Dynamic ride scheduling** in Admin — set Bus ID, driver, departure time, and destination
- ➕ **New Karnataka stop creator** — admins can add new Karnataka stops that instantly appear in customer booking
- 🚌 **Driver Bus ID selector** on login — conductors pick their bus and land on that specific console
- 🔄 **Reactive stopsList** — global state shared across Admin, Customer, and Driver views
- 🔁 Pre-shift bus selector in Driver Console for re-assignment

### v1.0.0 — Initial Release
- Core Customer, Driver, Admin dashboards
- Leaflet.js GPS maps with Karnataka routes
- Booking flow with fare tiers
- QR scanner simulation
- VeloBot AI assistant
- Multi-language support (EN / KN / HI)

---

## 📄 License

This project is for demonstration and educational purposes.

---

<div align="center">
  <strong>Built with ❤️ for the KSRTC Logistics Ecosystem</strong><br/>
  <sub>RouteVelo — Moving Karnataka, One Package at a Time.</sub>
</div>
