# 🚀 Running RouteVelo - Step-by-Step Instructions

This document provides a guide to launching RouteVelo in both **Development** and **Production** modes.

---

## 🛠️ Prerequisites

Before running the application, make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (Version `18.x` or higher is recommended)
- `npm` (packaged with Node.js)

---

## ⚡ Quick Start (Windows Only)

We have created double-clickable batch scripts in the project root to automate dependency installation and server execution with one click.

### 1. Run Development Version (With Simulation Console)
- Double-click **[run-dev.bat](file:///c:/Users/ADMIN/Desktop/routevelo%20app/run-dev.bat)** in the project root.
- This will install any missing dependencies and start the Vite development server.
- Open the address displayed in the terminal (usually `http://localhost:5173`) in your browser.
- **Includes:** The **Developer Simulation Deck** panel on the right side of the screen is visible to test live tracking, time advance, and sensor overrides.

### 2. Run Production Version (Without Simulation Console - Clean Demo)
- Double-click **[run-prod.bat](file:///c:/Users/ADMIN/Desktop/routevelo%20app/run-prod.bat)** in the project root.
- This compiles the optimized assets into the `/dist` folder and starts a local web server hosting the static assets.
- Open the address displayed in the terminal (usually `http://localhost:4173` or similar) in your browser.
- **Includes:** The **Developer Simulation Deck** is **completely hidden**, showing only the clean, centered mobile phone frame. This is perfect for client/management presentations!

---

## 🖥️ Manual Execution (All Operating Systems)

If you are running on macOS, Linux, or prefer using your terminal directly:

### 1. Running in Development Mode
Run the following commands in the project root directory:
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

### 2. Running in Production Mode
Run the following commands in the project root directory:
```bash
# Install dependencies
npm install

# Compile production-ready assets
npm run build

# Host the production build locally
npm run preview
```

---

## 🎓 Showcase features for Presentation

We added special enhancements to make your presentation flawless:

### 1. Auto OTP Transition
- On the **Customer login tab**, as soon as you enter a **10-digit number**, RouteVelo immediately triggers the transition to the **OTP Verification step**. You do not need to click "Get Verification OTP" manually!

### 2. Presentation / Demo Bypass Panel
- At the bottom of the login card under **"Presentation / Demo Bypass"**, you will find direct links for **Customer**, **Conductor**, and **Admin**. 
- Clicking any of these links logs you directly into the respective dashboards with preset mock states. This is extremely helpful during presentations to switch views quickly without typing passwords or badge IDs.

### 3. Conditional Developer Sidebar
- In development mode (`npm run dev`), the sidebar console is displayed next to the mobile frame.
- In production mode (`npm run build && npm run preview`), the sidebar console is **completely removed**, letting you present the interface as a clean, standalone web application.
