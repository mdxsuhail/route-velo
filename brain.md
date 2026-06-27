# RouteVelo App - Core Architecture Brain Documentation

This document provides a complete technical blueprint of the RouteVelo codebase. It is designed to help any AI agent (like Codexit, CodeRabbit, or others) immediately understand the application flow, state management, schemas, and security controls without reading every line of code.

---

## 1. High-Level Overview
RouteVelo is a gamified, peer-to-transit bus logistics simulation platform designed for public transport routes in Karnataka, India (e.g., KSRTC routes connecting Bengaluru, Mysuru, Mangaluru, and Hubballi). It simulates cargo shipping, conductor transit tasks, geofenced lockers, real-time telemetry fault troubleshooting, and carbon offset tracking.

The application is built on **React**, **Vite**, **Tailwind CSS / Vanilla CSS**, **Framer Motion**, and **Leaflet.js** (for real-time maps).

---

## 2. Core Directory Structure
```text
routevelo-app/
├── index.html                  # Global Leaflet scripts and stylesheet loads
├── src/
│   ├── App.jsx                 # Router Layout & Dev Simulation Panel
│   ├── index.css               # Main styling system, themes, and animations
│   ├── main.jsx                # React Entrypoint
│   ├── context/
│   │   └── SimulationContext.jsx  # Global state, helpers, handlers, and TTS
│   └── components/
│       ├── Header.jsx          # Top Navigation Bar & Toast alerts
│       ├── AuthPage.jsx        # Login Gate (Customer / Conductor / Admin)
│       ├── CustomerDashboard.jsx  # Wallet balance, lockers, shop, kiosk map
│       ├── BookingFlow.jsx     # Waybill generation, fare surcharges
│       ├── OrderHistoryView.jsx# Invoice manifest lists & printable waybill
│       ├── TrackingView.jsx    # Live transit timeline, milestones, conductor chat
│       ├── UserProfileView.jsx # Localizations, profile settings, unlocked themes
│       ├── DriverDashboard.jsx # Conductor Console, QR simulator, engine/tire fixes
│       ├── AdminDashboard.jsx  # Stats, global fleet map, custom dispatcher form
│       ├── LiveVectorTrackingMap.jsx # Interactive Leaflet map for customer tracking
│       └── AdminFleetMap.jsx   # Interactive Leaflet map for Admin command center
```

---

## 3. State Management & Context (`SimulationContext.jsx`)
All shared application states, constants, event triggers, audio assets, text-to-speech engine controls, and utility functions are managed inside the `SimulationProvider` and accessed via the `useSimulation()` hook.

### Key Global States:
- **`currentUser`**: `'Customer' | 'Driver' | 'Admin' | null` (Active role session).
- **`activeTab`**: `'dashboard' | 'booking' | 'history' | 'tracking' | 'profile'` (View Router tab).
- **`parcels`**: Array of parcel items.
- **`buses`**: Array of active bus logs with telemetry (fuel, speed, RPM, temp, tire pressure).
- **`lockers`**: Geofenced digital parcel lockers (`Empty` | `Occupied` | `Reserved`).
- **`walletBalance`**: Customer digital wallet funds.
- **`driverCashBalance`**: Shift cash ledger collected by conductor.
- **`appLanguage`**: `'English' | 'Kannada' | 'Hindi'` (Localizations).
- **`accentColor`**: Active CSS variable theme override.

### Primary Event Handlers:
- **`advanceSimulationTime()`**: Moves buses forward along coordinates, updates speeds, ticks fuel usage, fluctuates RPM, simulates weather shifts, and triggers geofence arrivals.
- **`injectAlert(type)`**: Triggers vehicle engine overheading or low tire PSI incidents.
- **`deliverParcel(parcelId)`**: Marks a package as Delivered and issues RouteCoin/XP rewards.
- **`depositParcelInLocker(parcelId, lockerId)`**: Reserves a geofenced depot locker for secure customer pick-up.
- **`speakText(text, language)`**: Web Speech Synthesis engine (TTS) supporting Kannada, Hindi, and English announcements.

---

## 4. Key Data Schemas

### Bus Object Schema
```json
{
  "id": "AW-102",
  "route": "Bengaluru - Mysuru",
  "type": "Airavat Club Class",
  "category": "Express",
  "location": "Bengaluru Majestic",
  "progress": 0,
  "speed": 55,
  "rpm": 1500,
  "temp": 85,
  "fuel": 100,
  "tirePressure": { "fl": 35, "fr": 35, "rl": 36, "rr": 36 },
  "eta": "Scheduled",
  "status": "En Route"
}
```

### Parcel Object Schema
```json
{
  "id": "RV-8492",
  "type": "Sending" | "Receiving",
  "status": "Pending" | "In_Transit" | "Locker" | "Delivered" | "Ad_Hoc_Dropped",
  "bus": "AW-102",
  "pickupOtp": "4982",
  "deliveryOtp": "8371",
  "origin": "Bengaluru Majestic",
  "destination": "Mysuru Central Bus Stand",
  "senderName": "Jane Doe",
  "senderPhone": "9876543210",
  "receiverName": "John Doe",
  "receiverPhone": "9845112233",
  "totalFare": 120,
  "insurance": true,
  "fragile": false,
  "rating": 0,
  "tier": "Express" | "Standard" | "Economy",
  "cargoClass": "Standard Box" | "Document" | "Large Crate" | "Heavy Sack",
  "parcelCount": 1,
  "history": [
    { "time": "12:00 PM", "msg": "Cargo booked." }
  ]
}
```

---

## 5. Security & Input Protection Controls
To safeguard the simulation sandbox against malicious inputs, the following security filters are strictly implemented across all user input boundaries (defined in `SimulationContext.jsx`):

1. **`sanitizeInput(text, maxLength)`**:
   - Strips dangerous HTML tag signatures using Regex: `/<[^>]*>/g`.
   - Escapes specific special characters: `&`, `<`, `>`, `"`, `'`.
   - Enforces string-length truncation to prevent buffer overflows or memory leaks in states.
2. **OTP Handovers**:
   - Secure randomly generated 4-digit codes are required for dispatches and final handovers.
   - For absent receivers, conductors can submit photo evidence via the camera bypass to override and register drop-offs securely.

---

## 6. Leaflet Map Coordinates & Highways
Real-time coordinates are calculated using high-fidelity multi-point linear interpolation (`getRealRouteCoordinates(route, progress)`) to track buses along actual National Highway routes:

*   **NH-275 (Mysuru Route)**: Bengaluru Majestic (`[12.97787, 77.57124]`) → Kengeri (`[12.9177, 77.4839]`) → Bidadi (`[12.7226, 77.3874]`) → Ramanagara (`[12.7214, 77.2801]`) → Channapatna (`[12.6518, 77.2006]`) → Maddur (`[12.5843, 77.0450]`) → Mandya (`[12.5222, 76.8970]`) → Srirangapatna (`[12.4221, 76.6953]`) → Mysuru (`[12.3117, 76.6570]`)
*   **NH-75 (Mangaluru Route)**: Bengaluru Majestic → Kunigal (`[13.0232, 77.0298]`) → Channarayapatna (`[12.9009, 76.3898]`) → Hassan (`[13.0063, 76.1026]`) → Sakleshpur (`[12.9427, 75.7865]`) → Gundya (`[12.8338, 75.5684]`) → Uppinangady (`[12.8398, 75.2530]`) → Bantwal (`[12.8988, 75.0392]`) → Mangaluru (`[12.8751, 74.8427]`)
*   **NH-48 (Hubballi Route)**: Bengaluru Majestic → Tumakuru (`[13.3402, 77.1006]`) → Sira (`[13.7431, 76.9056]`) → Hiriyur (`[13.9439, 76.6186]`) → Chitradurga (`[14.2251, 76.4006]`) → Davanagere (`[14.4644, 75.9218]`) → Harihar (`[14.5098, 75.8034]`) → Ranebennur (`[14.6231, 75.6212]`) → Haveri (`[14.7958, 75.3998]`) → Hubballi (`[15.3524, 75.1381]`)
*   **NH-69 (Shivamogga Route)**: Bengaluru Majestic → Tumakuru → Gubbi (`[13.3101, 76.9402]`) → Tiptur (`[13.2638, 76.4784]`) → Arsikere (`[13.3151, 76.2570]`) → Kadur (`[13.5532, 76.0123]`) → Birur (`[13.5938, 75.9784]`) → Tarikere (`[13.7118, 75.8142]`) → Shivamogga (`[13.9299, 75.5681]`)
*   **NH-48 (Belagavi Route Extension)**: Bengaluru Majestic → Tumakuru → Davanagere → Hubballi → Dharwad (`[15.4589, 75.0078]`) → Kittur (`[15.5984, 74.7890]`) → Belagavi (`[15.8497, 74.4977]`)
