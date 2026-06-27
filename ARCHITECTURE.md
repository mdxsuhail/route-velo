# RouteVelo Platform Architecture & Features

This document provides a comprehensive overview of the RouteVelo logistics application, detailing every major feature, its internal workings, and state management, divided by the main user interfaces.

---

## 1. Modular Context Architecture
RouteVelo uses the React Context API (`SimulationContext.jsx`) to centralize all states and side effects. This solves the performance bottlenecks of the initial monolithic design:
- **Zero Sub-Tree Re-mounting**: Sub-views are declared outside of `App.jsx` as standalone modular files in `src/components/`, ensuring component reconciliation is preserved.
- **Consistent Input Focus**: Input fields do not lose focus during telemetry/simulation updates.
- **Synchronized Audio & Voice (TTS)**: Any component can issue synthesized speech commands or audio pings using centralized `speakText` and `playSound` handles.

---

## 2. Front Page (Auth / Welcome Screen)
The front page serves as the entry point and role-selector for the application.

### Features
- **Role-Based Login**: Users can toggle between "Customer", "Driver", and "Admin" roles.
- **OTP Verification**: Simulates a secure login using a 10-digit phone number and a 4-digit OTP.
- **Social Logins**: Integrated Google and Apple buttons for one-click frictionless authentication.
- **Glassmorphic UI**: High-end styling using CSS variables to achieve a modern, premium KSRTC aesthetic.

### Internal Working
- **State**: Consumes `currentUser` and `activeTab` from `SimulationContext`.
- **Flow**: Upon submitting the OTP or clicking a Social Login button, the context session is updated, rendering the appropriate dashboard view.

---

## 3. Customers Page (Customer Dashboard)
The Customer Dashboard is the primary hub for end-users to book shipments, track parcels, and manage their wallet.

### Features
- **Wallet & Transaction History**: Shows available funds, UPI deposit simulation, and transaction logs.
- **Daily Streaks**: Rewards users with RouteCoins for consecutive daily logins.
- **Insights & FAQ**: Provides context on public transit courier regulations and benefits.
- **Booking Flow**: A 4-step wizard calculating fare classes (Express/Standard/Economy), weight classes, and cargo multipliers, applying surge pricing (weather/traffic) and GST.
- **Nearby Kiosks**: Interactive overlays pointing to Majestic and Shanthi Hub depot depots.

---

## 4. Live Vector Tracking Map
A Leaflet.js-backed dark-theme map showing real-time bus positions, route stop markers, and animated vehicle telemetry tooltips. Real-world coordinates of major Karnataka hubs (Bengaluru Majestic, Kengeri, Hassan, Mysuru, Mangaluru, Hubballi) are linearly interpolated based on simulation ticks.

---

## 5. Drivers Page (Driver Console)
An operational console for bus conductors:
- **Pre-Shift Safety Checklist**: Enforces radiator, brake, tire pressure, and cargo lock verifications.
- **HUD Diagnostics Cockpit**: Live telemetry gauges monitoring Engine Temperature, Fuel %, RPM, and PSI.
- **OTP Validation & Camera Bypass**: Handover verification using secure OTP codes, with ad-hoc photo bypass uploads for absent receivers.
- **Geofence countdowns**: Simulates KSRTC bus station arrivals.

---

## 6. Admin Page (Command Center)
A "God-view" console for logistics managers:
- **KPI Metrics**: Real-time revenue trackers and active manifest logs.
- **Analytics Charts**: Custom hand-crafted SVGs showing volume trends and classification splits.
- **Incident Troubleshooting**: Interactively triggers coolant flushes or tire inflation procedures to resolve telemetry warning alerts.
- **Fleet Dispatcher**: Forms to schedule and dispatch new fleet buses on active routes.

---

## 7. Telemetry & Simulation Engine
The `advanceSimulationTime` loop updates buses along coordinate paths:
- Ticks speed and fuel levels dynamically.
- Triggers environmental weather alterations (Rain/Fog overlays).
- Injects telemetry errors (engine overheat, low tire pressure) to simulate emergency operational workflows.
