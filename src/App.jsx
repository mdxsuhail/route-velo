import React, { useState, useEffect, useRef } from 'react'
import { 
  Package, 
  Truck, 
  User, 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  ChevronRight,
  XCircle,
  PlusCircle,
  QrCode,
  Info,
  LogOut,
  ShieldCheck,
  Search,
  Activity,
  History,
  Bell,
  ScanLine,
  Receipt,
  PhoneCall,
  Share2,
  MessageSquare,
  CreditCard,
  Wifi,
  Star,
  Wrench,
  Hammer
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Web Audio API Synthesizer ---
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'beep') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'chime') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Fail silently if audio context is blocked
  }
}

// --- Constants & Translations ---
const STOPS = [
  "Kempegowda Bus Station (Majestic), Bengaluru",
  "Kengeri Transit Hub, Bengaluru",
  "Mandya KSRTC Bus Stand",
  "Mysuru Central Bus Stand",
  "Mangaluru KSRTC Depot",
  "Shivamogga Bus Stand",
  "Hassan Bus Stand",
  "Tumakuru Bus Stand",
  "Davanagere Bus Stand",
  "Hubballi Central Stand",
  "Belagavi Bus Depot"
];

const PRICING_TIERS = {
  busType: {
    'Express': 120,    // Airavat
    'Standard': 80,    // Rajahamsa
    'Economy': 40      // Sarige
  },
  weight: [
    { label: 'Light (<1kg)', rate: 20 },
    { label: 'Medium (1-5kg)', rate: 50 },
    { label: 'Heavy (5kg+)', rate: 100 },
  ]
}

const TRANSLATIONS = {
  English: {
    dashboardTitle: "My Shipments",
    wallet: "RouteVelo Wallet",
    topUp: "Top Up",
    viewHistory: "View History",
    activeOrders: "Active Orders",
    trackShipment: "Search parcel or destination...",
    active: "Active",
    book: "Book",
    history: "History",
    profile: "Profile",
    insightsTitle: "Time Saved",
    streakTitle: "Day 4 Streak!"
  },
  Kannada: {
    dashboardTitle: "ನನ್ನ ಸಾಗಣೆಗಳು",
    wallet: "ರೂಟ್‌ವೆಲೊ ವಾಲೆಟ್",
    topUp: "ಟಾಪ್ ಅಪ್",
    viewHistory: "ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ",
    activeOrders: "ಸಕ್ರಿಯ ಆದೇಶಗಳು",
    trackShipment: "ಪಾರ್ಸೆಲ್ ಅಥವಾ ಗಮ್ಯಸ್ಥಾನ ಹುಡುಕಿ...",
    active: "ಸಕ್ರಿಯ",
    book: "ಬುಕ್",
    history: "ಇತಿಹಾಸ",
    profile: "ಪ್ರೊಫೈಲ್",
    insightsTitle: "ಉಳಿಸಿದ ಸಮಯ",
    streakTitle: "ದಿನ 4 ಸ್ಟ್ರೀಕ್!"
  },
  Hindi: {
    dashboardTitle: "मेरे शिपमेंट",
    wallet: "रूटवेलो वॉलेट",
    topUp: "टॉप अप",
    viewHistory: "इतिहास देखें",
    activeOrders: "सक्रिय आदेश",
    trackShipment: "पार्सल या गंतव्य खोजें...",
    active: "सक्रिय",
    book: "बुक",
    history: "इतिहास",
    profile: "प्रोफ़ाइल",
    insightsTitle: "बचाया गया समय",
    streakTitle: "दिन 4 स्ट्रीक!"
  }
}

// Map coordinate interpolation helper (Lerps coordinate along the route stops)
const getRouteCoordinates = (route, progress) => {
  let stops = [];
  if (route.includes('Mysuru')) {
    stops = [
      { name: 'Bengaluru Majestic', x: 50, y: 40 },
      { name: 'Kengeri Hub', x: 140, y: 90 },
      { name: 'Mandya Stand', x: 250, y: 130 },
      { name: 'Mysuru Stand', x: 350, y: 190 }
    ];
  } else if (route.includes('Mangaluru')) {
    stops = [
      { name: 'Bengaluru Majestic', x: 50, y: 40 },
      { name: 'Hassan Depot', x: 200, y: 100 },
      { name: 'Mangaluru Depot', x: 350, y: 160 }
    ];
  } else if (route.includes('Hubli')) {
    stops = [
      { name: 'Bengaluru Majestic', x: 50, y: 190 },
      { name: 'Tumakuru Stand', x: 130, y: 140 },
      { name: 'Davanagere Depot', x: 240, y: 90 },
      { name: 'Hubballi Stand', x: 350, y: 40 }
    ];
  } else {
    stops = [
      { name: 'Origin Depot', x: 50, y: 50 },
      { name: 'Midpoint Transit', x: 200, y: 120 },
      { name: 'Destination Kiosk', x: 350, y: 190 }
    ];
  }
  
  const segmentCount = stops.length - 1;
  const progressPerSegment = 100 / segmentCount;
  const segmentIdx = Math.min(Math.floor(progress / progressPerSegment), segmentCount - 1);
  const segmentProgress = (progress % progressPerSegment) / progressPerSegment;
  
  const start = stops[segmentIdx];
  const end = stops[segmentIdx + 1];
  
  const x = Math.round(start.x + (end.x - start.x) * segmentProgress);
  const y = Math.round(start.y + (end.y - start.y) * segmentProgress);
  
  return { x, y, stops };
}

// --- Primary Workspace Wrapper ---
export default function App() {
  // Global Simulation State
  const [buses, setBuses] = useState([
    { id: 'AW-102', route: 'Bengaluru - Mysuru', type: 'Airavat Club Class', category: 'Express', eta: '12 mins', location: 'Kengeri Stop', status: 'En Route', progress: 85, speed: 54, rpm: 1620, temp: 92, fuel: 64, tirePressure: { fl: 34, fr: 34, rl: 36, rr: 36 } },
    { id: 'RJ-205', route: 'Mysuru - Bengaluru', type: 'Rajahamsa', category: 'Standard', eta: '45 mins', location: 'Mandya Hub', status: 'En Route', progress: 30, speed: 48, rpm: 1450, temp: 88, fuel: 52, tirePressure: { fl: 32, fr: 32, rl: 34, rr: 34 } },
    { id: 'AW-007', route: 'Bengaluru - Mangaluru', type: 'Airavat Multi-Axle', category: 'Express', eta: '2 mins', location: 'Entering Yeshwanthpur', status: 'Arriving', progress: 95, speed: 12, rpm: 980, temp: 90, fuel: 75, tirePressure: { fl: 35, fr: 35, rl: 38, rr: 38 } },
    { id: 'KS-442', route: 'Bengaluru - Hubli', type: 'Karnataka Sarige', category: 'Economy', eta: '1 hr 12m', location: 'Nelamangala Toll', status: 'En Route', progress: 70, speed: 58, rpm: 1840, temp: 94, fuel: 42, tirePressure: { fl: 28, fr: 33, rl: 35, rr: 35 } },
  ]);

  const [parcels, setParcels] = useState([
    { 
      id: 'RV-9932', 
      type: 'Sending',
      status: 'In_Transit', 
      bus: 'AW-102', 
      pickupOtp: '4521', 
      deliveryOtp: '8812',
      origin: 'Bengaluru Majestic',
      destination: 'Mysuru Central Bus Stand',
      senderName: 'You',
      senderPhone: '9876543210',
      receiverName: 'Suhail Ahmed',
      receiverPhone: '9845123456',
      totalFare: 140,
      insurance: false,
      fragile: false,
      rating: 4,
      history: [
        { time: '10:30 AM', msg: 'Cargo booked and processed' },
        { time: '11:15 AM', msg: 'Received at Majestic Kiosk' },
        { time: '11:40 AM', msg: 'Loaded on Airavat Bus AW-102' }
      ]
    },
    { 
      id: 'RV-4411', 
      type: 'Receiving',
      status: 'Pending', 
      bus: 'AW-007', 
      pickupOtp: null, 
      deliveryOtp: '2981',
      origin: 'Mangaluru KSRTC Depot',
      destination: 'Kempegowda Bus Station (Majestic), Bengaluru',
      senderName: 'Priya K',
      senderPhone: '9008877665',
      receiverName: 'You',
      receiverPhone: '9876543210',
      totalFare: 210,
      insurance: true,
      fragile: true,
      rating: 0,
      history: [
        { time: '09:00 AM', msg: 'Cargo registered at Mangaluru' }
      ]
    }
  ]);

  const [walletBalance, setWalletBalance] = useState(1450);
  const [transactions, setTransactions] = useState([
    { id: 'TXN-901', type: 'Deposit', amount: 500, date: 'Today, 10:30 AM', status: 'Success' },
    { id: 'TXN-902', type: 'Payment', amount: -140, date: 'Oct 14, 2026', desc: 'Fare for RV-9932', status: 'Success' },
  ]);

  const [logs, setLogs] = useState([
    'SYSTEM: Server diagnostics loaded. Theme dark.',
    'LOGISTICS: 4 Buses online and tracking on route lines.'
  ]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 15));
  };

  // General App Settings
  const [currentUser, setCurrentUser] = useState('Customer'); // Customer, Driver, Admin
  const [appLanguage, setAppLanguage] = useState('English');
  const [theme, setTheme] = useState('dark');
  const [isOffline, setIsOffline] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bus Entering Geofence', message: 'AW-102 is 2 mins away. Be ready.', type: 'alert', time: 'Just now' },
    { id: 2, title: 'Delivery Successful', message: 'Parcel RV-0021 was handed over.', type: 'success', time: '1 hr ago' }
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Tabs / Navigation
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, booking, history, profile, tracking
  const [selectedParcel, setSelectedParcel] = useState(null);

  // Driver Console Specifics
  const [driverBusId, setDriverBusId] = useState('AW-102');
  const [driverScannerOpen, setDriverScannerOpen] = useState(false);
  const [driverScannerStage, setDriverScannerStage] = useState('idle'); // idle, scanning, success
  const [scannedParcelId, setScannedParcelId] = useState('');
  const [bypassCameraOpen, setBypassCameraOpen] = useState(false);
  const [geofenceActive, setGeofenceActive] = useState(false);
  const [geofenceTimer, setGeofenceTimer] = useState(120);

  // System Alerts (Admin / Dashboard)
  const [systemAlerts, setSystemAlerts] = useState([
    { id: 'ALT-1', busId: 'KS-442', title: 'Low Tire Pressure', desc: 'Front left tire at 28 PSI. Drive with caution.', severity: 'medium' }
  ]);

  const t = TRANSLATIONS[appLanguage] || TRANSLATIONS.English;

  // Sync Data Theme Attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Geofence countdown timer
  useEffect(() => {
    let interval;
    if (geofenceActive && geofenceTimer > 0) {
      interval = setInterval(() => {
        setGeofenceTimer(prev => prev - 1);
      }, 1000);
    } else if (geofenceTimer === 0) {
      setGeofenceActive(false);
      addLog(`DRIVER: Completed mandatory 2-minute geofence wait for ${driverBusId}.`);
    }
    return () => clearInterval(interval);
  }, [geofenceActive, geofenceTimer]);

  // Toast Timer Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Contextual initial notification
  useEffect(() => {
    if (currentUser === 'Customer') {
      const timer = setTimeout(() => {
        playSound('chime');
        setToast({ title: 'Streak Reward', message: 'You have unclaimed rewards from your Daily streak!' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // --- Environmental Time Simulation Logic ---
  const advanceSimulationTime = () => {
    playSound('click');
    addLog(`SIMULATOR: Time advanced. Route progress updated.`);
    
    // Update buses coordinates
    setBuses(prevBuses => prevBuses.map(bus => {
      const newProgress = Math.min(bus.progress + Math.floor(Math.random() * 8) + 4, 100);
      const isArrivedNow = newProgress === 100 && bus.progress < 100;
      
      // Update vehicle variables randomly
      const newSpeed = newProgress === 100 ? 0 : Math.max(30, Math.min(80, bus.speed + Math.floor(Math.random() * 11) - 5));
      const newRPM = newProgress === 100 ? 800 : Math.max(1000, Math.min(2200, bus.rpm + Math.floor(Math.random() * 201) - 100));
      const newFuel = Math.max(10, bus.fuel - (newProgress - bus.progress) * 0.1);
      
      if (isArrivedNow) {
        addLog(`ALERT: Bus ${bus.id} has arrived at destination depot.`);
        playSound('chime');
        // Push notification
        setNotifications(prev => [
          { id: Date.now(), title: `Arrival: Bus ${bus.id}`, message: `Arrived at ${bus.route.split('-')[1].trim()}`, type: 'success', time: 'Just now' },
          ...prev
        ]);
        setHasUnread(true);
      }

      return {
        ...bus,
        progress: newProgress,
        status: newProgress === 100 ? 'Arrived' : 'En Route',
        eta: newProgress === 100 ? 'Arrived' : `${Math.round((100 - newProgress) * 1.5)} mins`,
        location: newProgress === 100 ? bus.route.split('-')[1].trim() : bus.location,
        speed: newSpeed,
        rpm: newRPM,
        fuel: Math.round(newFuel * 10) / 10
      };
    }));

    // Update parcel statuses accordingly
    setParcels(prevParcels => prevParcels.map(p => {
      const relatedBus = buses.find(b => b.id === p.bus);
      if (!relatedBus) return p;

      // Automatically move pending to transit if advanced
      if (p.status === 'Pending' && relatedBus.progress > 0 && relatedBus.progress < 100) {
        addLog(`LOGISTICS: Parcel ${p.id} state updated to In Transit on Bus ${p.bus}.`);
        return {
          ...p,
          status: 'In_Transit',
          history: [...p.history, { time: 'Now', msg: `In transit via KSRTC bus ${p.bus}` }]
        };
      }
      return p;
    }));
  };

  // Trigger bus emergency simulation
  const injectAlert = (type) => {
    playSound('beep');
    if (type === 'engine_heat') {
      setBuses(prev => prev.map(b => b.id === 'AW-102' ? { ...b, temp: 118, speed: 20, rpm: 1200, status: 'Warning' } : b));
      // Add Admin Alert
      setSystemAlerts(prev => [
        { id: 'ALT-102', busId: 'AW-102', title: 'Critical Engine Heat', desc: 'Engine temperature critical (118°C) near Mandya.', severity: 'high' },
        ...prev
      ]);
      addLog(`ALERT: Injecting engine overheat (118°C) warning on Bus AW-102.`);
    } else if (type === 'traffic') {
      setBuses(prev => prev.map(b => b.id === 'RJ-205' ? { ...b, eta: 'Delayed +30m', speed: 10, rpm: 1000, status: 'Delayed' } : b));
      addLog(`ALERT: Traffic congestion injected on Mysuru Road for bus RJ-205.`);
    } else if (type === 'tire_low') {
      setBuses(prev => prev.map(b => b.id === 'KS-442' ? { ...b, tirePressure: { ...b.tirePressure, fl: 22 }, status: 'Warning' } : b));
      setSystemAlerts(prev => [
        { id: 'ALT-442', busId: 'KS-442', title: 'Low Tire Pressure', desc: 'Front Left tire pressure critical at 22 PSI.', severity: 'medium' },
        ...prev
      ]);
      addLog(`ALERT: Low tire pressure alert (22 PSI) injected on Bus KS-442.`);
    } else if (type === 'clear') {
      setBuses(prev => prev.map(b => {
        if (b.id === 'AW-102') return { ...b, temp: 92, speed: 52, rpm: 1600, status: 'En Route' };
        if (b.id === 'RJ-205') return { ...b, eta: '15 mins', speed: 50, rpm: 1500, status: 'En Route' };
        if (b.id === 'KS-442') return { ...b, tirePressure: { fl: 34, fr: 34, rl: 36, rr: 36 }, status: 'En Route' };
        return b;
      }));
      setSystemAlerts([]);
      addLog(`SIMULATOR: Cleared all operational alarms and telemetry errors.`);
    }
  };

  // Dispatch backup replacement bus (Admin action)
  const dispatchBackupBus = (busId) => {
    playSound('chime');
    addLog(`ADMIN: Dispatched backup bus for ${busId}. Transferring cargo...`);
    
    setBuses(prev => prev.map(b => {
      if (b.id === busId) {
        return {
          ...b,
          id: `${busId}-B`,
          temp: 85,
          speed: 55,
          rpm: 1550,
          status: 'En Route',
          type: b.type + ' (Backup)',
          tirePressure: { fl: 35, fr: 35, rl: 36, rr: 36 }
        };
      }
      return b;
    }));

    // Update active cargo bus allocations
    setParcels(prev => prev.map(p => p.bus === busId ? { ...p, bus: `${busId}-B` } : p));
    
    // Clear high severity heat alert
    setSystemAlerts(prev => prev.filter(a => a.busId !== busId));
  };

  // Helper functions for Parcel Updates
  const deliverParcel = (parcelId) => {
    playSound('chime');
    setParcels(prev => prev.map(p => p.id === parcelId ? {
      ...p,
      status: 'Delivered',
      history: [...p.history, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg: 'Cargo handed over to recipient (OTP Verified)' }]
    } : p));
    addLog(`LOGISTICS: Parcel ${parcelId} successfully delivered via OTP.`);
  };

  const adHocDropParcel = (parcelId) => {
    playSound('chime');
    setParcels(prev => prev.map(p => p.id === parcelId ? {
      ...p,
      status: 'Ad_Hoc_Dropped',
      history: [...p.history, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg: 'Conductor completed ad-hoc kiosk drop' }]
    } : p));
    addLog(`LOGISTICS: Parcel ${parcelId} marked Ad-Hoc Kiosk drop.`);
  };

  const startOtpGeofence = () => {
    playSound('click');
    setGeofenceActive(true);
    setGeofenceTimer(120);
    addLog(`DRIVER: Approaching geofence boundary. Commencing wait period.`);
  };

  // --- Sub-Components inside App ---

  // 1. App Header Component
  const Header = ({ title }) => (
    <header style={{ padding: '16px 0', marginBottom: 12, borderBottom: '1px solid var(--glass-border)', position: 'relative' }}>
      {isOffline && (
        <div style={{ background: 'var(--error)', color: 'white', padding: '4px 10px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 800, position: 'absolute', top: -10, left: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
           Offline Simulation Mode
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{title}</h2>
        <div className="flex items-center gap-sm">
          {/* Light/Dark Toggle */}
          <button 
             onClick={() => { playSound('click'); setTheme(t => t === 'dark' ? 'light' : 'dark') }} 
             style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}
          >
             {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {/* Connectivity toggle */}
          <button 
             onClick={() => { playSound('click'); setIsOffline(!isOffline) }} 
             style={{ background: isOffline ? 'var(--error)' : 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isOffline ? 'white' : 'var(--text-main)' }}
          >
             <Wifi size={16} />
          </button>

          {/* Notifications Hub */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { playSound('click'); setNotificationsOpen(!notificationsOpen); setHasUnread(false); setMenuOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, position: 'relative' }}
            >
              <Bell size={22} color={notificationsOpen ? 'var(--primary)' : 'var(--text-main)'} />
              {hasUnread && <div style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--background)' }} />}
            </button>
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="card" style={{ position: 'absolute', top: 50, right: -40, zIndex: 100, width: 290, padding: 16, maxHeight: 350, overflowY: 'auto' }}
                >
                  <h4 style={{ fontWeight: 800, marginBottom: 12, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6 }}>Operational Alerts</h4>
                  {notifications.map(n => (
                    <div key={n.id} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex justify-between items-start">
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: n.type === 'alert' ? 'var(--accent)' : 'var(--success)' }}>{n.title}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User badge */}
          <div style={{ position: 'relative' }}>
            <button 
              className="glass" 
              onClick={() => { playSound('click'); setMenuOpen(!menuOpen); setNotificationsOpen(false); }}
              style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <User size={16} color="var(--primary)" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="card" style={{ position: 'absolute', top: 46, right: 0, zIndex: 100, minWidth: 180, padding: 16 }}
                >
                  <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--glass-border)' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '0.9rem' }}>{currentUser} Role</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Session</p>
                  </div>
                  <button 
                    onClick={() => { playSound('click'); setCurrentUser('Customer'); setMenuOpen(false); setActiveTab('dashboard'); }}
                    className="btn btn-secondary w-full" style={{ padding: '8px 12px', fontSize: '0.8rem', marginBottom: 6 }}
                  >
                    Switch Role
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );

  // 2. Interactive SVG Tracking Map Component
  const LiveVectorTrackingMap = ({ parcel }) => {
    const bus = buses.find(b => b.id === parcel.bus);
    const progress = bus ? bus.progress : 50;
    const { x, y, stops } = getRouteCoordinates(bus ? bus.route : 'Bengaluru - Mysuru', progress);

    const [activeStopTooltip, setActiveStopTooltip] = useState(null);

    return (
      <div className="card" style={{ padding: 12, background: 'var(--input-bg)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Live Route Visualizer</h4>
          <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }} className="flex items-center gap-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {bus ? `${bus.speed} km/h` : 'Awaiting dispatch'}
          </span>
        </div>

        {/* Vector SVG Map Layout */}
        <div style={{ height: 210, background: '#070a13', borderRadius: '12px', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
          <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }}>
            {/* Background grid */}
            <defs>
              <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />

            {/* Dotted Route Line path */}
            <path 
              d={`M ${stops.map(s => `${s.x} ${s.y}`).join(' L ')}`}
              fill="none" 
              stroke="rgba(220, 38, 38, 0.15)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d={`M ${stops.map(s => `${s.x} ${s.y}`).join(' L ')}`}
              fill="none" 
              stroke="var(--primary)" 
              strokeWidth="2" 
              strokeDasharray="4,6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Stop nodes */}
            {stops.map((stop, i) => (
              <g key={i} cursor="pointer" onClick={() => { playSound('click'); setActiveStopTooltip(stop); }}>
                <circle 
                  cx={stop.x} 
                  cy={stop.y} 
                  r="6" 
                  fill="#111827" 
                  stroke="var(--accent)" 
                  strokeWidth="2" 
                />
                <text 
                  x={stop.x} 
                  y={stop.y - 12} 
                  textAnchor="middle" 
                  fill="var(--text-muted)" 
                  fontSize="7" 
                  fontWeight="600"
                >
                  {stop.name}
                </text>
              </g>
            ))}

            {/* Active Bus Icon Overlay */}
            {bus && (
              <g transform={`translate(${x - 9}, ${y - 9})`}>
                <circle cx="9" cy="9" r="14" fill="var(--primary-glow)" className="animate-pulse" />
                <rect width="18" height="18" rx="4" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                <path d="M 4 9 L 14 9 M 10 5 L 14 9 L 10 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </svg>

          {/* Map Tooltip Box */}
          {activeStopTooltip && (
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(17, 24, 39, 0.95)', border: '1px solid var(--accent)', padding: '8px 12px', borderRadius: 8, fontSize: '0.75rem', zIndex: 100 }}>
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{activeStopTooltip.name.toUpperCase()} DEPOT</span>
                <button onClick={() => setActiveStopTooltip(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>Secure digital KSRTC lockers available. Congestions level: Normal.</p>
            </div>
          )}
        </div>

        {/* Live diagnostics banner */}
        {bus && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px 0 12px', fontSize: '0.72rem', fontFamily: 'monospace', color: bus.status === 'Warning' ? 'var(--error)' : 'var(--success)' }}>
            <span>TELEMETRY: S:{bus.speed}km/h | T:{bus.temp}°C | F:{bus.fuel}%</span>
            <span>GPS LOCK: {x}°N, {y}°E</span>
          </div>
        )}
      </div>
    );
  };

  // 3. Upgraded VeloBot Chat Component
  const VeloBotChat = ({ parcel }) => {
    const [messages, setMessages] = useState([
      { sender: 'bot', text: 'Namaskara! I am VeloBot, your KSRTC Logistics assistant. How can I assist you with parcel ' + parcel.id + '?' }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (textToSend) => {
      const msgText = textToSend || input;
      if (!msgText.trim()) return;

      playSound('click');
      const updated = [...messages, { sender: 'user', text: msgText }];
      setMessages(updated);
      setInput('');

      // Dynamic AI Response based on state
      setTimeout(() => {
        playSound('chime');
        let reply = "I'm checking the logs. Your cargo is currently stored safely in transit.";
        const busObj = buses.find(b => b.id === parcel.bus);

        const lower = msgText.toLowerCase();
        if (lower.includes('status') || lower.includes('where')) {
          reply = `Parcel ${parcel.id} is currently ${parcel.status.replace('_', ' ')} on Bus ${parcel.bus || 'Unassigned'}. Route: ${busObj ? busObj.route : 'Pending'}.`;
        } else if (lower.includes('eta') || lower.includes('arrive') || lower.includes('time')) {
          reply = busObj 
            ? `Bus ${busObj.id} is currently near ${busObj.location}. Estimated arrival is ${busObj.eta} (Progress: ${busObj.progress}%).`
            : `Conductor allocation is pending. We will notify you once departure commences.`;
        } else if (lower.includes('conductor') || lower.includes('driver') || lower.includes('contact')) {
          reply = `Conductor Manjunath K. is operating the bus. For secure handovers, please keep your OTP (${parcel.deliveryOtp}) ready.`;
        } else if (lower.includes('otp') || lower.includes('code')) {
          reply = `Your secure delivery confirmation passcode is ${parcel.deliveryOtp}. Present this code to verify delivery.`;
        } else if (lower.includes('policy') || lower.includes('cancel')) {
          reply = `Cancellations can be made up to 20 minutes before arrival. Standard terms limit recovery liability unless insured.`;
        }

        setMessages([...updated, { sender: 'bot', text: reply }]);
      }, 800);
    };

    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 350, padding: 16 }}>
        <div className="flex items-center gap-sm" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>VeloBot AI Assistant</h4>
        </div>

        {/* Message Panel */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4, marginBottom: 12 }}>
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              style={{ 
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                background: m.sender === 'user' ? 'var(--primary)' : 'var(--input-bg)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '12px',
                maxWidth: '85%',
                fontSize: '0.8rem',
                border: m.sender === 'bot' ? '1px solid var(--glass-border)' : 'none'
              }}
            >
              {m.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggest Chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
          {['Check ETA', 'Driver Contact', 'Delivery OTP'].map(chip => (
            <button 
              key={chip} 
              onClick={() => handleSend(chip)}
              className="badge" 
              style={{ background: 'var(--surface-secondary)', color: 'var(--text-main)', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Panel */}
        <div className="flex gap-sm">
          <input 
            type="text" 
            placeholder="Ask VeloBot status..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{ padding: '8px 12px', borderRadius: 20, fontSize: '0.8rem' }}
          />
          <button onClick={() => handleSend()} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 20, fontSize: '0.8rem' }}>Send</button>
        </div>
      </div>
    );
  };

  // --- main dashboard interfaces ---

  // Customer Panel
  const CustomerDashboard = () => {
    const [showTopUp, setShowTopUp] = useState(false);
    const [showTransactions, setShowTransactions] = useState(false);
    const [showStreak, setShowStreak] = useState(false);
    const [showKiosks, setShowKiosks] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const activeOrdersList = parcels
      .filter(p => filter === 'All' || p.type === filter)
      .filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.destination.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="animate-fade-in pb-32">
         <Header title="RouteVelo Logistics" />
         
         {/* Search Filter */}
         <div className="card flex items-center justify-between" style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--input-bg)' }}>
           <div className="flex items-center gap-sm w-full">
             <Search color="var(--text-muted)" size={18} />
             <input 
               type="text" 
               placeholder={t.trackShipment} 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', width: '100%', outline: 'none' }} 
             />
           </div>
         </div>

         {/* Streaks and Savings widgets */}
         <div className="flex gap-md" style={{ marginBottom: 16 }}>
           {/* Streak Widget */}
           <div className="card flex-1 flex flex-col justify-center items-center" style={{ border: '1.5px solid var(--accent)', background: 'var(--accent-glow)', cursor: 'pointer', padding: '12px' }} onClick={() => { playSound('click'); setShowStreak(true); }}>
              <Star color="var(--accent)" fill="var(--accent)" size={20} style={{ marginBottom: 4 }} />
              <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--accent)', fontSize: '0.8rem' }}>{t.streakTitle}</h4>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Claim rewards</span>
           </div>

           {/* Insights Analytics Widget */}
           <div className="card flex-1 flex flex-col justify-center items-center" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 }}>
                 <h2 style={{ margin: 0, color: 'var(--success)', fontSize: '1.4rem' }}>14</h2>
                 <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>hours</span>
              </div>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.75rem' }}>{t.insightsTitle}</h4>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>This Month</span>
           </div>
         </div>

         {/* Wallet Widget */}
         <div className="card mb-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', marginBottom: 20, minHeight: 120 }}>
           <div style={{ position: 'absolute', right: -15, top: -15, opacity: 0.08 }}><Package size={110} /></div>
           <div className="flex justify-between items-start relative z-10">
             <div>
               <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 600 }}>{t.wallet}</p>
               <h1 style={{ color: 'white', margin: 0, fontSize: '2.1rem', fontWeight: 800 }}>₹{walletBalance.toLocaleString()}</h1>
             </div>
             <div className="flex flex-col gap-sm">
                <button className="btn" onClick={() => { playSound('click'); setShowTopUp(true); }} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>{t.topUp}</button>
                <button onClick={() => { playSound('click'); setShowTransactions(true); }} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer', opacity: 0.9 }}>{t.viewHistory}</button>
             </div>
           </div>
         </div>

         {/* Navigation to Kiosk */}
         <button className="btn w-full" style={{ background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', marginBottom: 16 }} onClick={() => { playSound('click'); setShowKiosks(true); }}>
            <MapPin size={18} /> Find Nearby KSRTC Kiosk
         </button>

         {/* Filter Selector */}
         <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
           {['All', 'Sending', 'Receiving'].map(f => (
             <button key={f} className="badge" style={{ padding: '6px 12px', background: filter === f ? 'var(--primary)' : 'var(--input-bg)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }} onClick={() => { playSound('click'); setFilter(f); }}>
               {f}
             </button>
           ))}
         </div>

         {/* Order items lists */}
         <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 12 }} className="flex items-center gap-sm"><Activity size={16} /> Active Cargo Manifest</h3>
         
         <div className="flex flex-col gap-sm">
           {activeOrdersList.length === 0 ? (
             <p style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No shipments found matching filters.</p>
           ) : (
             activeOrdersList.map(p => {
               const b = buses.find(bus => bus.id === p.bus);
               return (
                 <div key={p.id} className="card" style={{ padding: 16, borderLeft: `5px solid ${p.type === 'Sending' ? 'var(--primary)' : 'var(--accent)'}`, cursor: 'pointer' }} onClick={() => { playSound('click'); setSelectedParcel(p); setActiveTab('tracking'); }}>
                   <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                     <div>
                       <span className={`badge ${p.status === 'Delivered' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>{p.status.replace('_', ' ').toUpperCase()}</span>
                       <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: 4 }}>{p.id} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>• {p.type}</span></h4>
                     </div>
                     <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Conductor Bus: <strong>{p.bus}</strong></span>
                   </div>
                   <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} className="flex flex-col gap-xs">
                     <div>Dest: <strong style={{ color: 'var(--text-main)' }}>{p.destination.split(',')[0]}</strong></div>
                     {b && <div>ETA: <strong style={{ color: 'var(--primary-light)' }}>{b.eta}</strong> (Progress: {b.progress}%)</div>}
                   </div>
                 </div>
               );
             })
           )}
         </div>

         {/* Streak Modals */}
         <AnimatePresence>
           {showStreak && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
                <div className="card w-full flex flex-col items-center" style={{ padding: 24, textAlign: 'center' }}>
                   <Star color="var(--accent)" fill="var(--accent)" size={48} style={{ marginBottom: 12, filter: 'drop-shadow(0 0 12px var(--accent))' }} />
                   <h2 style={{ fontSize: '1.5rem' }}>Loyalty Streak!</h2>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>You have booked log entries on 4 consecutive days.</p>
                   <button className="btn btn-primary w-full" onClick={() => { playSound('chime'); setShowStreak(false); setWalletBalance(w => w + 50); addLog('REWARD: Claimed 50 RouteCoins (Added to wallet)'); }} style={{ background: 'var(--accent)' }}>Claim ₹50 RouteCoins</button>
                   <button className="btn w-full" onClick={() => setShowStreak(false)} style={{ background: 'transparent', color: 'var(--text-muted)', marginTop: 8 }}>Close</button>
                </div>
             </motion.div>
           )}

           {/* Kiosks map Modal */}
           {showKiosks && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div className="card" style={{ borderRadius: '24px 24px 0 0', height: '65vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                   <div className="flex justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
                     <h3 style={{ fontWeight: 800 }}>Nearby Drop-off Kiosks</h3>
                     <button onClick={() => setShowKiosks(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>&times;</button>
                   </div>
                   
                   <div style={{ flex: 1, position: 'relative', background: '#0a0d14' }}>
                     <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                     
                     {/* Current location */}
                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6', border: '2px solid white', boxShadow: '0 0 8px #3b82f6' }} />
                        <span style={{ fontSize: '0.6rem', color: 'white', marginTop: 2, fontWeight: 700 }}>Your Location</span>
                     </div>

                     {/* Majestic */}
                     <div style={{ position: 'absolute', top: '25%', left: '35%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <MapPin size={24} color="var(--accent)" fill="var(--surface)" />
                        <span style={{ fontSize: '0.65rem', background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, marginTop: 2, fontWeight: 700, border: '1px solid var(--glass-border)' }}>Majestic (0.8km)</span>
                     </div>

                     {/* Shanthinagara */}
                     <div style={{ position: 'absolute', top: '65%', left: '65%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <MapPin size={24} color="var(--accent)" fill="var(--surface)" />
                        <span style={{ fontSize: '0.65rem', background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, marginTop: 2, fontWeight: 700, border: '1px solid var(--glass-border)' }}>Shanthi Hub (2.4km)</span>
                     </div>
                   </div>
                   
                   <div style={{ padding: 16, background: 'var(--surface)' }}>
                     <button className="btn btn-primary w-full" style={{ background: 'var(--accent)' }} onClick={() => setShowKiosks(false)}>Navigate to Majestic Depot</button>
                   </div>
                </div>
             </motion.div>
           )}

           {/* Wallet Top-up Modal */}
           {showTopUp && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center' }}>
               <div className="card w-full" style={{ maxWidth: 350 }}>
                 <div className="flex items-center gap-sm" style={{ marginBottom: 16 }}>
                   <CreditCard size={24} color="var(--primary)" />
                   <h3 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Deposit Funds</h3>
                 </div>
                 <div className="input-group" style={{ marginBottom: 16 }}>
                   <label className="input-label">Deposit Amount (INR)</label>
                   <input type="number" placeholder="₹500" id="depositAmt" defaultValue="500" style={{ fontSize: '1.1rem', fontWeight: 700 }} />
                 </div>
                 <button 
                   className="btn btn-primary w-full" 
                   onClick={() => { 
                     playSound('chime');
                     let val = parseInt(document.getElementById('depositAmt').value || 0);
                     setWalletBalance(walletBalance + val); 
                     setTransactions(prev => [{ id: 'TXN-' + Math.floor(100 + Math.random()*900), type: 'Deposit', amount: val, date: 'Just now', status: 'Success' }, ...prev]);
                     addLog(`FINANCIAL: Deposited ₹${val} via simulator gateway.`);
                     setShowTopUp(false); 
                   }}
                 >
                   Process Simulator UPI
                 </button>
                 <button className="btn btn-secondary w-full" style={{ marginTop: 8 }} onClick={() => setShowTopUp(false)}>Cancel</button>
               </div>
             </motion.div>
           )}

           {/* Transactions Modal */}
           {showTransactions && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div className="card" style={{ borderRadius: '24px 24px 0 0', height: '65vh', display: 'flex', flexDirection: 'column' }}>
                   <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                     <h3 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><History size={18}/> Wallet history logs</h3>
                     <button onClick={() => setShowTransactions(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>&times;</button>
                   </div>
                   <div style={{ overflowY: 'auto', flex: 1 }}>
                      {transactions.map(t => (
                         <div key={t.id} className="card" style={{ padding: 14, marginBottom: 8, borderLeft: `3px solid ${t.type === 'Deposit' ? 'var(--success)' : 'var(--text-muted)'}` }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: 2 }}>
                               <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.type}</span>
                               <span style={{ fontWeight: 800, fontSize: '1rem', color: t.type === 'Deposit' ? 'var(--success)' : 'var(--text-main)' }}>{t.amount > 0 ? '+' : ''}₹{t.amount}</span>
                            </div>
                            <div className="flex justify-between items-center" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                               <span>{t.desc || t.id}</span>
                               <span>{t.date}</span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    );
  };

  // Booking Flow Panel
  const BookingFlow = () => {
    const [step, setStep] = useState(1);
    const [searchStop, setSearchStop] = useState('');
    const [pricing, setPricing] = useState({ weight: 0, tier: 'Express', fragile: false, insurance: false });
    const [showWaybill, setShowWaybill] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);
    const [bookingRef, setBookingRef] = useState('');
    const [details, setDetails] = useState({ sName: 'Jane Doe', sPhone: '9876543210', rName: '', rPhone: '', origin: 'Bengaluru Majestic' });

    // Filter available buses departing from Bangalore for the route selection
    const availableBuses = buses.filter(b => b.route.includes(searchStop.replace(' KSRTC Bus Stand', '').replace(' Central Bus Stand', '').replace(' Bus Depot', '')));

    const calculateTotal = () => {
      const baseFare = PRICING_TIERS.busType[pricing.tier];
      const weightSurcharge = PRICING_TIERS.weight[pricing.weight].rate;
      const addOns = (pricing.fragile ? 30 : 0) + (pricing.insurance ? 50 : 0);
      const subtotal = baseFare + weightSurcharge + addOns;
      const gst = Math.round(subtotal * 0.18);
      return { baseFare, weightSurcharge, addOns, subtotal, gst, total: subtotal + gst };
    };

    const handlePayment = () => {
      const { total } = calculateTotal();
      if (walletBalance < total) {
        playSound('beep');
        alert("Insufficient wallet balance. Please top up funds.");
        return;
      }
      
      const ref = `RV-${Math.floor(1000 + Math.random() * 9000)}`;
      playSound('chime');
      setWalletBalance(w => w - total);
      setTransactions(prev => [
        { id: 'TXN-' + Math.floor(100 + Math.random()*900), type: 'Payment', amount: -total, date: 'Just now', desc: `Booking ${ref}`, status: 'Success' },
        ...prev
      ]);
      setBookingRef(ref);
      setShowWaybill(true);
    };

    const confirmBookingAllocation = (assignedBusId) => {
      const { total } = calculateTotal();
      
      // Inject new parcel into global state
      const newParcel = {
        id: bookingRef,
        type: 'Sending',
        status: 'Pending',
        bus: assignedBusId,
        pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        origin: details.origin,
        destination: searchStop,
        senderName: details.sName,
        senderPhone: details.sPhone,
        receiverName: details.rName,
        receiverPhone: details.rPhone,
        totalFare: total,
        insurance: pricing.insurance,
        fragile: pricing.fragile,
        rating: 0,
        history: [
          { time: 'Now', msg: `Cargo booked. Assigned to conductor on Bus ${assignedBusId}.` }
        ]
      };

      setParcels(prev => [newParcel, ...prev]);
      addLog(`LOGISTICS: Registered package ${bookingRef} allocated to Bus ${assignedBusId}.`);
      
      setShowWaybill(false);
      setActiveTab('dashboard');
    };

    return (
      <div className="animate-slide-up pb-32">
        <Header title="New Cargo Booking" />
        
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ height: 4, flex: 1, background: step >= s ? 'var(--primary)' : 'var(--input-bg)', borderRadius: 2 }} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-md">
            <div className="input-group">
              <label className="input-label">Destination Stop</label>
              <select value={searchStop} onChange={e => { playSound('click'); setSearchStop(e.target.value); }} style={{ width: '100%' }}>
                <option value="">Select destination stand...</option>
                {STOPS.filter(s => s !== "Kempegowda Bus Station (Majestic), Bengaluru" && s !== "Kengeri Transit Hub, Bengaluru").map(stop => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" disabled={!searchStop} onClick={() => setStep(2)}>Add Contact Details <ChevronRight size={16} /></button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-md animate-fade-in">
            <h4 style={{ fontWeight: 800 }}>Sender & Receiver Contacts</h4>
            <div className="card flex flex-col gap-md" style={{ padding: 16 }}>
              <div className="input-group">
                <label className="input-label">Origin Kiosk</label>
                <input type="text" value={details.origin} onChange={e => setDetails({ ...details, origin: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="input-group flex-1">
                  <label className="input-label">Sender Name</label>
                  <input type="text" value={details.sName} onChange={e => setDetails({ ...details, sName: e.target.value })} />
                </div>
                <div className="input-group flex-1">
                  <label className="input-label">Sender Phone</label>
                  <input type="text" value={details.sPhone} onChange={e => setDetails({ ...details, sPhone: e.target.value })} />
                </div>
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />

              <div style={{ display: 'flex', gap: 10 }}>
                <div className="input-group flex-1">
                  <label className="input-label">Receiver Name</label>
                  <input type="text" placeholder="John Doe" value={details.rName} onChange={e => setDetails({ ...details, rName: e.target.value })} />
                </div>
                <div className="input-group flex-1">
                  <label className="input-label">Receiver Phone</label>
                  <input type="text" placeholder="9845******" value={details.rPhone} onChange={e => setDetails({ ...details, rPhone: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-sm">
              <button className="btn btn-secondary flex-1" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary flex-[2]" disabled={!details.rName || !details.rPhone} onClick={() => setStep(3)}>Select Transit Speed <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-md animate-fade-in">
            <h4 style={{ fontWeight: 800 }}>Delivery Speed & Bus allocation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Express', 'Standard', 'Economy'].map(tier => (
                <div 
                  key={tier}
                  onClick={() => { playSound('click'); setPricing({ ...pricing, tier }); }}
                  className="card flex justify-between items-center"
                  style={{ padding: 12, cursor: 'pointer', border: pricing.tier === tier ? '2px solid var(--primary)' : '1px solid var(--glass-border)', background: pricing.tier === tier ? 'var(--primary-glow)' : 'var(--surface-card)' }}
                >
                  <div>
                    <h4 style={{ fontWeight: 800 }}>{tier} Class</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tier === 'Express' ? 'Airavat Volvo Club' : tier === 'Standard' ? 'Rajahamsa Express' : 'Karnataka Sarige'}</p>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: '1.1rem' }}>₹{PRICING_TIERS.busType[tier]}</span>
                </div>
              ))}
            </div>

            <div className="input-group">
              <label className="input-label">Package Weight Class</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {PRICING_TIERS.weight.map((w, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => { playSound('click'); setPricing({ ...pricing, weight: idx }); }}
                    className="btn btn-secondary flex-1"
                    style={{ 
                      padding: 10, 
                      fontSize: '0.75rem',
                      border: pricing.weight === idx ? '2.5px solid var(--primary)' : '1px solid var(--glass-border)',
                      background: pricing.weight === idx ? 'var(--primary-glow)' : 'var(--input-bg)'
                    }}
                  >
                    {w.label} (+₹{w.rate})
                  </button>
                ))}
              </div>
            </div>

            <div className="card flex flex-col gap-sm" style={{ padding: 12 }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Premium Care Add-ons</h4>
              <div className="flex justify-between items-center">
                <label htmlFor="fragileCheck" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Specialized Fragile Handling (+₹30)</label>
                <input 
                  type="checkbox" 
                  id="fragileCheck"
                  checked={pricing.fragile}
                  onChange={e => { playSound('click'); setPricing({ ...pricing, fragile: e.target.checked }); }}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                />
              </div>
              <div className="flex justify-between items-center" style={{ marginTop: 6 }}>
                <label htmlFor="insuranceCheck" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Cargo Liability Insurance (+₹50)</label>
                <input 
                  type="checkbox" 
                  id="insuranceCheck"
                  checked={pricing.insurance}
                  onChange={e => { playSound('click'); setPricing({ ...pricing, insurance: e.target.checked }); }}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                />
              </div>
            </div>

            <div className="flex gap-sm">
              <button className="btn btn-secondary flex-1" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary flex-[2]" onClick={() => setStep(4)}>Fare Breakdown <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 4 && (() => {
          const { baseFare, weightSurcharge, addOns, subtotal, gst, total } = calculateTotal();
          return (
            <div className="flex flex-col gap-md animate-fade-in">
              <div className="card flex flex-col gap-sm" style={{ padding: 16 }}>
                <h4 style={{ fontWeight: 800, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6 }}>Bill Summary</h4>
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Base fare ({pricing.tier})</span>
                  <span>₹{baseFare}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Weight surcharge</span>
                  <span>₹{weightSurcharge}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Insurance & Fragile options</span>
                  <span>₹{addOns}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Taxes (GST 18%)</span>
                  <span>₹{gst}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
                <div className="flex justify-between items-end">
                  <span style={{ fontWeight: 800 }}>Total Fare Payable:</span>
                  <span style={{ fontSize: '1.6rem', color: 'var(--primary-light)', fontWeight: 800 }}>₹{total}</span>
                </div>
              </div>

              <div className="card flex items-start gap-sm" style={{ padding: 12, border: '1px solid var(--error)', background: 'var(--error-glow)' }}>
                <input 
                  type="checkbox" 
                  id="policyAccept" 
                  checked={policyAccepted}
                  onChange={e => { playSound('click'); setPolicyAccepted(e.target.checked); }}
                  style={{ width: 20, height: 20, cursor: 'pointer', marginTop: 2, accentColor: 'var(--primary)' }}
                />
                <label htmlFor="policyAccept" style={{ fontSize: '0.75rem', lineHeight: 1.3, cursor: 'pointer' }}>
                  I accept that unless Insurance is purchased, RouteVelo holds zero liability for delays or damages. Unlawful items are seized immediately.
                </label>
              </div>

              <div className="flex gap-sm">
                <button className="btn btn-secondary flex-1" onClick={() => setStep(3)}>Back</button>
                <button className="btn btn-primary flex-[2]" disabled={!policyAccepted || walletBalance < total} onClick={handlePayment}>Pay & Confirm Slot</button>
              </div>
            </div>
          );
        })()}

        {/* Waybill / Bus allocation Selection Modal */}
        <AnimatePresence>
          {showWaybill && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 4500, background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: 20 }}>
              <div className="card w-full" style={{ maxWidth: 360, textAlign: 'center' }}>
                <h3 style={{ color: 'var(--success)' }}>Slot Booking Success</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Select a departing bus from schedule:</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {availableBuses.length === 0 ? (
                    <div className="card" style={{ padding: 12, cursor: 'pointer', background: 'var(--primary-glow)', border: '1px solid var(--primary)' }} onClick={() => confirmBookingAllocation('AW-102')}>
                      <h4 style={{ fontSize: '0.85rem' }}>Auto-Allocate Airavat AW-102</h4>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>No other matching route schedule found.</p>
                    </div>
                  ) : (
                    availableBuses.map(bus => (
                      <div 
                        key={bus.id} 
                        onClick={() => confirmBookingAllocation(bus.id)}
                        className="card flex justify-between items-center" 
                        style={{ padding: 10, cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'var(--input-bg)' }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{bus.id} ({bus.type})</span>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Status: {bus.location} • {bus.eta}</p>
                        </div>
                        <ChevronRight size={16} />
                      </div>
                    ))
                  )}
                </div>

                <div style={{ background: 'white', padding: 12, borderRadius: 12, display: 'inline-block', marginBottom: 12 }}>
                  <QrCode size={110} color="black" />
                </div>
                <div style={{ background: 'var(--input-bg)', padding: 10, borderRadius: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: 2 }}>{bookingRef}</span>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Present barcode at kiosk to dispatch parcel.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Order History Panel
  const OrderHistoryView = () => {
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const completedShipments = parcels.filter(p => p.status === 'Delivered' || p.status === 'Ad_Hoc_Dropped');

    return (
      <div className="animate-fade-in pb-32">
        <Header title="Delivery Invoices" />
        
        <div className="flex flex-col gap-sm">
          {completedShipments.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No completed invoice records in this session.</p>
          ) : (
            completedShipments.map(item => (
              <div key={item.id} className="card" onClick={() => { playSound('click'); setSelectedInvoice(item); }} style={{ padding: 16, cursor: 'pointer', opacity: 0.9 }}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>COMPLETED</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: 4 }}>{item.id}</h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.05rem' }}>₹{item.totalFare}</span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Conductor: {item.bus}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>To: {item.destination}</p>
              </div>
            ))
          )}
        </div>

        {/* Invoice Modal Overlay */}
        <AnimatePresence>
          {selectedInvoice && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div className="card" style={{ borderRadius: '24px 24px 0 0', height: '70vh', display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 800 }}>Digital Log Waybill</h3>
                  <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>&times;</button>
                </div>

                <div style={{ flex: 1, background: 'var(--input-bg)', borderRadius: 12, padding: 16, border: '1px dashed var(--glass-border)', position: 'relative' }}>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary-light)' }}>KSRTC smart logistics</h4>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Logistics Transaction Record</p>
                  </div>
                  
                  <div className="flex flex-col gap-sm" style={{ fontSize: '0.8rem' }}>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Waybill ID:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Conductor Bus:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.bus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>From:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>To:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.destination.split(',')[0]}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Sender Name:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.senderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Receiver Name:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.receiverName}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
                    <div className="flex justify-between items-end">
                      <span style={{ fontWeight: 800 }}>Amount Paid:</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>₹{selectedInvoice.totalFare}</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary w-full" style={{ marginTop: 16 }} onClick={() => setSelectedInvoice(null)}>Close</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // User Profile Panel
  const UserProfileView = () => {
    const [name, setName] = useState("Jane Doe");
    const [email, setEmail] = useState("jane.doe@ksrtc.in");
    const [phone, setPhone] = useState("+91 9876543210");
    const [isEditing, setIsEditing] = useState(false);

    return (
      <div className="animate-fade-in pb-32">
        <Header title={t.profile} />
        <div className="card" style={{ padding: 16, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.6rem', fontWeight: 800 }}>
             {name.charAt(0)}
          </div>
          <h3 style={{ margin: 0, fontWeight: 800 }}>{name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>RouteVelo Premium Member</p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
             <h4 style={{ fontWeight: 800 }}>Account Variables</h4>
             <button onClick={() => { playSound('click'); setIsEditing(!isEditing); }} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                {isEditing ? 'Save Details' : 'Edit Profile'}
             </button>
          </div>

          <div className="flex flex-col gap-md">
            <div className="input-group">
               <label className="input-label">Full Name</label>
               <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={!isEditing} style={{ border: isEditing ? '1px solid var(--glass-border)' : 'none', padding: isEditing ? '10px 14px' : '0px', background: isEditing ? 'var(--input-bg)' : 'transparent', color: 'var(--text-main)' }} />
            </div>
            <div className="input-group">
               <label className="input-label">Email Address</label>
               <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!isEditing} style={{ border: isEditing ? '1px solid var(--glass-border)' : 'none', padding: isEditing ? '10px 14px' : '0px', background: isEditing ? 'var(--input-bg)' : 'transparent', color: 'var(--text-main)' }} />
            </div>
            <div className="input-group">
               <label className="input-label">Linked Phone</label>
               <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEditing} style={{ border: isEditing ? '1px solid var(--glass-border)' : 'none', padding: isEditing ? '10px 14px' : '0px', background: isEditing ? 'var(--input-bg)' : 'transparent', color: 'var(--text-main)' }} />
            </div>
            <div className="input-group">
               <label className="input-label">Localization Language</label>
               <select value={appLanguage} onChange={e => { playSound('click'); setAppLanguage(e.target.value); }} disabled={!isEditing} style={{ border: isEditing ? '1px solid var(--glass-border)' : 'none', padding: isEditing ? '10px 14px' : '0px', background: isEditing ? 'var(--input-bg)' : 'transparent', color: 'var(--text-main)' }}>
                 <option value="English">English</option>
                 <option value="Kannada">Kannada</option>
                 <option value="Hindi">Hindi</option>
               </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tracking details Panel
  const TrackingView = () => {
    const parcel = selectedParcel || parcels[0];
    const busObj = buses.find(b => b.id === parcel.bus);
    const [rating, setRating] = useState(parcel.rating || 0);

    return (
      <div className="animate-fade-in pb-32">
        <header style={{ padding: '12px 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => { playSound('click'); setActiveTab('dashboard'); }} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}>
             <ChevronRight size={22} style={{ transform: 'rotate(180deg)' }} /> 
          </button>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>Tracking: {parcel.id}</span>
        </header>

        <div className="flex flex-col gap-md" style={{ marginTop: 12 }}>
          {/* Map display */}
          <LiveVectorTrackingMap parcel={parcel} />

          {/* Shipment metadata info */}
          <div className="card" style={{ padding: 16 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <span className={`badge ${parcel.status === 'Delivered' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>{parcel.status.replace('_',' ').toUpperCase()}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned Vehicle: <strong>{parcel.bus}</strong></span>
            </div>
            
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>To: {parcel.destination}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Receiver Name: {parcel.receiverName} ({parcel.receiverPhone})</p>

            <div style={{ background: 'var(--input-bg)', padding: 10, borderRadius: 8, marginTop: 12, fontSize: '0.75rem' }} className="flex justify-between">
              <span>Security verification OTP:</span>
              <strong style={{ color: 'var(--accent)', letterSpacing: 1 }}>{parcel.deliveryOtp}</strong>
            </div>
          </div>

          {/* VeloBot chatbot */}
          <VeloBotChat parcel={parcel} />

          {/* Conductor User UGC feedback */}
          {parcel.status === 'Delivered' && (
            <div className="card" style={{ padding: 16 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8 }}>Rate Bus Conductor Service</h4>
              <div className="flex items-center gap-xs">
                {[1,2,3,4,5].map(star => (
                  <Star 
                    key={star} 
                    size={22} 
                    color="var(--accent)" 
                    fill={star <= rating ? "var(--accent)" : "transparent"} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      playSound('click');
                      setRating(star);
                      // Update parcel rating in state
                      setParcels(prev => prev.map(p => p.id === parcel.id ? { ...p, rating: star } : p));
                      addLog(`FEEDBACK: Rated conductor for parcel ${parcel.id} as ${star} Stars.`);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Delivery history milestones */}
          <div className="card" style={{ padding: 16 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12 }}>Cargo Log Milestones</h4>
            <div className="flex flex-col gap-sm" style={{ borderLeft: '1px dashed var(--glass-border)', paddingLeft: 12, marginLeft: 6 }}>
              {parcel.history.map((hist, i) => (
                <div key={i} style={{ fontSize: '0.75rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 4, left: -16, width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>[{hist.time}] </span>
                  <span style={{ color: 'var(--text-main)' }}>{hist.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Driver Console Panel
  const DriverDashboard = () => {
    // Filter packages currently assigned to the driver's selected bus
    const activeBus = buses.find(b => b.id === driverBusId) || buses[0];
    const driverParcels = parcels.filter(p => p.bus === activeBus.id);

    const handleCameraBypass = (parcelId) => {
      playSound('click');
      setBypassCameraOpen(true);
      setScannedParcelId(parcelId);
    };

    const triggerScanner = (parcelId) => {
      playSound('click');
      setScannedParcelId(parcelId);
      setDriverScannerOpen(true);
      setDriverScannerStage('scanning');
      
      // Simulate scanning duration
      setTimeout(() => {
        playSound('beep');
        setDriverScannerStage('success');
      }, 1500);
    };

    const completeScanningTransition = () => {
      const p = parcels.find(item => item.id === scannedParcelId);
      if (p) {
        if (p.status === 'Pending') {
          // Pickup parcel
          setParcels(prev => prev.map(item => item.id === scannedParcelId ? {
            ...item,
            status: 'In_Transit',
            history: [...item.history, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg: `Scanned by conductor. Loaded on Bus ${activeBus.id}` }]
          } : item));
          addLog(`DRIVER: Scanned and loaded parcel ${scannedParcelId} on Bus ${activeBus.id}.`);
        } else if (p.status === 'In_Transit') {
          // Deliver parcel
          deliverParcel(scannedParcelId);
        }
      }
      setDriverScannerOpen(false);
      setDriverScannerStage('idle');
    };

    return (
      <div className="animate-fade-in pb-32">
        <Header title="Driver Console" />

        {/* Bus selector for simulation convenience */}
        <div className="input-group" style={{ marginBottom: 14 }}>
          <label className="input-label">Select Operating KSRTC Bus</label>
          <select value={driverBusId} onChange={e => { playSound('click'); setDriverBusId(e.target.value); }} style={{ padding: '10px 14px' }}>
            {buses.map(b => (
              <option key={b.id} value={b.id}>{b.id} • {b.route}</option>
            ))}
          </select>
        </div>

        {/* HUD Diagnostics */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Vehicle Diagnostics Cockpit</h4>
        <div className="card grid" style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'var(--input-bg)', padding: 10, borderRadius: 8 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ENG TEMP</span>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: activeBus.temp > 100 ? 'var(--error)' : 'var(--success)' }}>
              {activeBus.temp}°C {activeBus.temp > 100 ? '⚠️' : ''}
            </div>
            <div className="gauge-bar">
              <div className={`gauge-fill ${activeBus.temp > 100 ? 'gauge-fill-error' : 'gauge-fill-success'}`} style={{ width: `${Math.min(100, (activeBus.temp / 130) * 100)}%` }} />
            </div>
          </div>

          <div style={{ background: 'var(--input-bg)', padding: 10, borderRadius: 8 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>FUEL RANGE</span>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{activeBus.fuel}%</div>
            <div className="gauge-bar">
              <div className="gauge-fill gauge-fill-accent" style={{ width: `${activeBus.fuel}%` }} />
            </div>
          </div>

          <div style={{ background: 'var(--input-bg)', padding: 10, borderRadius: 8 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ENGINE RPM</span>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{activeBus.rpm}</div>
          </div>

          <div style={{ background: 'var(--input-bg)', padding: 10, borderRadius: 8 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TIRES (FL/FR)</span>
            <div style={{ fontWeight: 800, fontSize: '0.8rem', color: activeBus.tirePressure.fl < 30 ? 'var(--error)' : 'var(--text-main)' }}>
              {activeBus.tirePressure.fl} / {activeBus.tirePressure.fr} PSI
            </div>
          </div>
        </div>

        {/* Driver inventory list */}
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>Assigned Cargo Inventory ({driverParcels.length})</h3>
        
        <div className="flex flex-col gap-sm">
          {driverParcels.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No cargo booked on this bus route schedule.</p>
          ) : (
            driverParcels.map(p => (
              <div key={p.id} className="card" style={{ padding: 14 }}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`badge ${p.status === 'Delivered' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.6rem' }}>{p.status.replace('_', ' ')}</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: 4 }}>{p.id}</h4>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verify Code: <strong>{p.deliveryOtp}</strong></span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Dest: {p.destination.split(',')[0]}</p>

                {/* Conductor Actions */}
                {p.status === 'Pending' && (
                  <button className="btn btn-primary w-full" style={{ padding: '8px 16px', fontSize: '0.8rem', marginTop: 10 }} onClick={() => triggerScanner(p.id)}>
                     <ScanLine size={16} /> Scan QR to Pickup Load
                  </button>
                )}

                {p.status === 'In_Transit' && (
                  <div style={{ marginTop: 10 }} className="flex flex-col gap-sm">
                    {/* OTP Manual Entry */}
                    <div className="flex gap-sm">
                      <input 
                        type="text" 
                        placeholder="Manually Enter Delivery OTP"
                        maxLength={4}
                        onChange={e => {
                          if (e.target.value === p.deliveryOtp) {
                            deliverParcel(p.id);
                          }
                        }}
                        style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'center', letterSpacing: 2, fontWeight: 700 }}
                      />
                      <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.75rem' }} onClick={() => triggerScanner(p.id)}>
                        <ScanLine size={16} /> Scan
                      </button>
                    </div>

                    <button className="btn btn-secondary w-full" style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--error)' }} onClick={() => handleCameraBypass(p.id)}>
                       <Camera size={14} /> Absent Receiver - Bypass snap
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Geofence scheduler trigger */}
        <div className="card" style={{ marginTop: 16, padding: 14, border: geofenceActive ? '1px solid var(--error)' : '1px solid var(--glass-border)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
            <h4 style={{ fontWeight: 800, fontSize: '0.85rem' }}>Geofence Control Boundary</h4>
            {geofenceActive && (
              <span className="badge badge-error" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                Wait: {Math.floor(geofenceTimer/60)}:{String(geofenceTimer%60).padStart(2, '0')}
              </span>
            )}
          </div>
          {!geofenceActive ? (
            <button className="btn btn-secondary w-full" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={startOtpGeofence}>
              Simulate Stop Arrival Geofence
            </button>
          ) : (
            <p style={{ fontSize: '0.72rem', color: 'var(--error)', lineHeight: 1.3 }}>
              GPS boundary locked. Conductor mandatory wait period active. Verify handovers or process bypass snap.
            </p>
          )}
        </div>

        {/* Scanner Simulation Modal */}
        <AnimatePresence>
          {driverScannerOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 4500, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: 20 }}>
               <h3 style={{ color: 'white', marginBottom: 12 }}>Simulated Barcode Scanner</h3>
               
               <div style={{ width: '100%', maxWidth: 320, aspectRatio: '1', background: '#090d16', borderRadius: 20, border: '2px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                  {/* Green scanning laser line */}
                  {driverScannerStage === 'scanning' && <div className="laser-line" />}
                  
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', color: 'white', padding: 20 }}>
                     <ScanLine size={48} opacity={0.3} className="animate-pulse" />
                     <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                       {driverScannerStage === 'scanning' ? 'Aligning barcode camera guidelines...' : 'Package Verified successfully!'}
                     </p>
                  </div>
               </div>

               {driverScannerStage === 'success' && (
                 <button className="btn btn-primary" style={{ marginTop: 20, width: '100%', maxWidth: 320 }} onClick={completeScanningTransition}>
                    Confirm and Save
                 </button>
               )}
            </motion.div>
          )}

          {/* Ad-hoc camera bypass capture Modal */}
          {bypassCameraOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 4500, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: 20 }}>
               <h3 style={{ color: 'white', marginBottom: 10 }}>Ad-Hoc Snap Evidence</h3>
               <div style={{ width: '100%', maxWidth: 320, aspectRatio: '3/4', background: '#111827', borderRadius: 20, position: 'relative', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                     <span>GPS LOCK: ACTIVE</span>
                     <span>EVIDENCE CAMERA</span>
                  </div>
                  
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--text-muted)' }}>
                     <Camera size={44} opacity={0.2} />
                  </div>

                  <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
                     <button 
                       onClick={() => {
                         playSound('beep');
                         adHocDropParcel(scannedParcelId);
                         setBypassCameraOpen(false);
                       }}
                       style={{ width: 60, height: 60, borderRadius: '50%', border: '4px solid white', background: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
                     />
                  </div>
               </div>
               <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>Place package clearly next to landmark at kiosk stand.<br/>Click shutter to save photo evidence.</p>
               <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setBypassCameraOpen(false)}>Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Admin Dashboard Panel
  const AdminDashboard = () => {
    // Analytics calculations
    const totalRevenue = parcels.reduce((sum, p) => sum + p.totalFare, 0) + 142500;
    const activeParcelsCount = parcels.filter(p => p.status !== 'Delivered').length;

    // SVG Pie Donut split categories
    const expressCount = parcels.filter(p => p.tier === 'Express').length;
    const stdCount = parcels.filter(p => p.tier === 'Standard').length;
    const ecoCount = parcels.filter(p => p.tier === 'Economy').length;
    const totalCount = parcels.length || 1;
    
    const exprPct = Math.round((expressCount / totalCount) * 100);
    const stdPct = Math.round((stdCount / totalCount) * 100);
    const ecoPct = Math.round((ecoCount / totalCount) * 100);

    return (
      <div className="animate-fade-in pb-32">
        <Header title="Admin CommandCenter" />
        
        {/* KPI Indicators */}
        <div className="card flex justify-between items-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', padding: 16, marginBottom: 16 }}>
           <div>
             <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>TOTAL LOGISTICS REVENUE</span>
             <h2 style={{ color: 'white', margin: 0, fontSize: '1.7rem', fontWeight: 800 }}>₹{totalRevenue.toLocaleString()}</h2>
           </div>
           <div style={{ textAlign: 'right' }}>
             <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>ACTIVE LOADS</span>
             <h2 style={{ color: 'white', margin: 0, fontSize: '1.7rem', fontWeight: 800 }}>{activeParcelsCount}</h2>
           </div>
        </div>

        {/* Live System Critical Alerts */}
        {systemAlerts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
             <h4 style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 800, marginBottom: 8 }} className="flex items-center gap-xs"><AlertCircle size={14}/> Operational Alarms ({systemAlerts.length})</h4>
             <div className="flex flex-col gap-sm">
                {systemAlerts.map(alt => (
                  <div key={alt.id} className="card flex items-start gap-sm" style={{ padding: 12, borderLeft: '4px solid var(--error)', background: 'var(--error-glow)' }}>
                     <AlertCircle color="var(--error)" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                     <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>{alt.title} ({alt.busId})</h4>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{alt.desc}</p>
                        {alt.busId === 'AW-102' && (
                          <button 
                             className="btn btn-primary" 
                             style={{ padding: '6px 12px', fontSize: '0.7rem', marginTop: 8, background: 'var(--error)', boxShadow: 'none' }}
                             onClick={() => dispatchBackupBus('AW-102')}
                          >
                             Approve Backup Vehicle Dispatch
                          </button>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Interactive SVG Analytics Charts */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Revenue Trend (Mon - Sun)</h4>
        <div className="card" style={{ padding: 12, marginBottom: 16 }}>
           <svg viewBox="0 0 300 120" style={{ width: '100%', height: '100%' }}>
              {/* Daily bars */}
              {[
                { day: 'Mon', rev: 25 },
                { day: 'Tue', rev: 38 },
                { day: 'Wed', rev: 55 },
                { day: 'Thu', rev: 42 },
                { day: 'Fri', rev: 70 },
                { day: 'Sat', rev: 85 },
                { day: 'Sun', rev: 92 },
              ].map((d, idx) => {
                const height = d.rev;
                const y = 90 - height;
                return (
                  <g key={idx}>
                     <rect 
                       x={20 + idx * 38} 
                       y={y} 
                       width="22" 
                       height={height} 
                       rx="3" 
                       fill="var(--primary)" 
                       style={{ opacity: 0.8 }}
                       cursor="pointer"
                       onClick={() => { playSound('click'); alert(`${d.day} Cargo revenue: ₹${d.rev * 1500}`); }}
                     />
                     <text x={31 + idx * 38} y="106" textAnchor="middle" fontSize="8" fill="var(--text-muted)">{d.day}</text>
                  </g>
                );
              })}
              <line x1="10" y1="90" x2="290" y2="90" stroke="var(--glass-border)" strokeWidth="1" />
           </svg>
        </div>

        {/* Cargo classification donut chart */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Cargo Split Metrics</h4>
        <div className="card flex items-center justify-between" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ width: 80, height: 80 }}>
             <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--input-bg)" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--primary)" strokeWidth="4" 
                  strokeDasharray={`${exprPct} ${100 - exprPct}`} strokeDashoffset="25" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--accent)" strokeWidth="4" 
                  strokeDasharray={`${stdPct} ${100 - stdPct}`} strokeDashoffset={25 - exprPct} />
             </svg>
          </div>
          <div style={{ flex: 1, paddingLeft: 20, fontSize: '0.78rem' }} className="flex flex-col gap-xs">
             <div className="flex items-center gap-xs">
               <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }} />
               <span>Express transit: <strong>{exprPct}%</strong></span>
             </div>
             <div className="flex items-center gap-xs">
               <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
               <span>Standard transit: <strong>{stdPct}%</strong></span>
             </div>
             <div className="flex items-center gap-xs">
               <div style={{ width: 8, height: 8, background: 'var(--input-bg)', borderRadius: '50%' }} />
               <span>Economy transit: <strong>{ecoPct}%</strong></span>
             </div>
          </div>
        </div>

        {/* Live buses telemetry table */}
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 10 }}>Active Fleet Monitors</h3>
        <div className="flex flex-col gap-sm">
           {buses.map(bus => (
             <div key={bus.id} className="card" style={{ padding: 12 }}>
                <div className="flex justify-between items-center">
                   <h4 style={{ fontWeight: 800 }}>{bus.id} ({bus.type})</h4>
                   <span className={`badge ${bus.status === 'Warning' ? 'badge-error' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>{bus.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                   <span>Route: {bus.route}</span>
                   <span>Fuel: {bus.fuel}% | Speed: {bus.speed}km/h</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  };

  // --- Render Layout Workspace ---
  return (
    <div className="app-workspace">
      
      {/* 1. Mobile Phone Frame Simulator */}
      <div className="mobile-frame">
        <div className="container relative">
          
          {/* Main Views Router */}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {currentUser === 'Admin' ? <AdminDashboard /> : currentUser === 'Customer' ? <CustomerDashboard /> : <DriverDashboard />}
              </motion.div>
            )}
            {activeTab === 'booking' && (
              <motion.div key="book" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}>
                <BookingFlow />
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <OrderHistoryView />
              </motion.div>
            )}
            {activeTab === 'tracking' && (
              <motion.div key="tracking" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}>
                <TrackingView />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <UserProfileView />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Floating Booking Trigger for Customer */}
          {currentUser === 'Customer' && activeTab === 'dashboard' && (
            <button 
              className="flex items-center justify-center" 
              style={{ position: 'absolute', bottom: 90, right: 10, width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 100, boxShadow: '0 8px 16px var(--primary-glow)' }}
              onClick={() => { playSound('click'); setActiveTab('booking'); }}
            >
              <PlusCircle size={26} />
            </button>
          )}

          {/* Bottom navigation bar */}
          <nav className="glass" style={{ 
            position: 'absolute', bottom: 15, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 20, padding: '10px 20px', borderRadius: 100,
            width: '90%', justifyContent: 'space-around', zIndex: 50
          }}>
            {currentUser === 'Admin' ? (
              <div style={{ color: 'var(--primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Activity size={20} />
                <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>Command Center</span>
              </div>
            ) : currentUser === 'Driver' ? (
              <div style={{ color: 'var(--primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Package size={20} />
                <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>Inventory Manifest</span>
              </div>
            ) : (
              <>
                <div style={{ color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }} onClick={() => { playSound('click'); setActiveTab('dashboard'); }}>
                   <Activity size={20} />
                   <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{t.active}</span>
                </div>
                <div style={{ color: activeTab === 'booking' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }} onClick={() => { playSound('click'); setActiveTab('booking'); }}>
                   <PlusCircle size={20} />
                   <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{t.book}</span>
                </div>
                <div style={{ color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }} onClick={() => { playSound('click'); setActiveTab('history'); }}>
                   <History size={20} />
                   <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{t.history}</span>
                </div>
                <div style={{ color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }} onClick={() => { playSound('click'); setActiveTab('profile'); }}>
                   <User size={20} />
                   <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{t.profile}</span>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 2. Simulator Sidebar Developer Console */}
      <div className="simulator-panel">
         <div className="flex items-center gap-sm" style={{ marginBottom: 16 }}>
            <Wrench size={22} color="var(--primary-light)" />
            <h3 style={{ fontWeight: 800 }}>Developer Simulation Deck</h3>
         </div>

         {/* Simulator Description */}
         <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
           This deck enables operational simulation of peer-to-transit bus logistics, connecting Customer, Conductor, and Admin roles in a unified sandbox.
         </p>

         {/* Role Switcher */}
         <div style={{ marginBottom: 16 }}>
            <span className="input-label" style={{ marginBottom: 6, display: 'block' }}>Instant Role swapper</span>
            <div style={{ display: 'flex', gap: 6 }}>
               {['Customer', 'Driver', 'Admin'].map(role => (
                  <button 
                     key={role}
                     onClick={() => { playSound('click'); setCurrentUser(role); }}
                     className="btn btn-secondary flex-1"
                     style={{ 
                       padding: '10px 6px', 
                       fontSize: '0.78rem',
                       border: currentUser === role ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                       background: currentUser === role ? 'var(--primary-glow)' : 'var(--input-bg)'
                     }}
                  >
                     {role}
                  </button>
               ))}
            </div>
         </div>

         {/* Simulation Variables */}
         <div style={{ marginBottom: 16 }}>
            <span className="input-label" style={{ marginBottom: 6, display: 'block' }}>Operational Controls</span>
            <div style={{ display: 'flex', gap: 8 }}>
               <button className="btn btn-primary flex-1" style={{ padding: '10px 14px', fontSize: '0.78rem' }} onClick={advanceSimulationTime}>
                  Advance Time (+15m)
               </button>
               <button className="btn btn-secondary flex-1" style={{ padding: '10px 14px', fontSize: '0.78rem' }} onClick={() => injectAlert('traffic')}>
                  Inject Traffic Jam
               </button>
            </div>
         </div>

         {/* Diagnostic Alert Injector */}
         <div style={{ marginBottom: 20 }}>
            <span className="input-label" style={{ marginBottom: 6, display: 'block' }}>Inject Telemetry Faults</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
               <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.72rem', flex: 1 }} onClick={() => injectAlert('engine_heat')}>
                  Overheat AW-102
               </button>
               <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.72rem', flex: 1 }} onClick={() => injectAlert('tire_low')}>
                  Low PSI KS-442
               </button>
               <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.72rem', flex: 1 }} onClick={() => injectAlert('clear')}>
                  Reset Errors
               </button>
            </div>
         </div>

         {/* Retro simulator console terminal logs */}
         <span className="input-label" style={{ marginBottom: 6, display: 'block' }}>Telemetry & Activity logs</span>
         <div className="code-terminal" style={{ height: 160, overflowY: 'auto' }}>
            {logs.map((log, index) => (
              <div key={index} style={{ marginBottom: 4 }}>{log}</div>
            ))}
         </div>
      </div>

    </div>
  );
}
