import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// --- Input Sanitization & Security Protection Helpers ---
export const sanitizeInput = (text, maxLength = 120) => {
  if (typeof text !== 'string') return '';
  const clean = text.replace(/<\/?[^>]+(>|$)/g, "");
  return clean.trim().substring(0, maxLength);
};

// --- Visual Barcode Generator Utilities ---
export const generateBarcodeHTML = (parcelId) => {
  const idStr = String(parcelId || 'RV-0000');
  const bars = [];
  for (let i = 0; i < idStr.length; i++) {
    const charCode = idStr.charCodeAt(i);
    const w1 = (charCode % 3) + 1; // bar width 1 to 3px
    const w2 = ((charCode >> 1) % 3) + 1; // space width 1 to 3px
    bars.push(<div key={`b-${i}`} className="barcode-line" style={{ width: w1, marginRight: w2 }} />);
  }
  bars.push(<div key="b-end-1" className="barcode-line" style={{ width: 3, marginRight: 2 }} />);
  bars.push(<div key="b-end-2" className="barcode-line" style={{ width: 1, marginRight: 1 }} />);
  bars.push(<div key="b-end-3" className="barcode-line" style={{ width: 2, marginRight: 0 }} />);
  return <div className="barcode-container">{bars}</div>;
};

export const generateBarcodeHTMLString = (parcelId) => {
  const idStr = String(parcelId || 'RV-0000');
  let html = '<div style="display: flex; justify-content: center; align-items: center; background: #ffffff; padding: 8px 12px; height: 50px; margin: 12px auto; border: 1px solid rgba(0,0,0,0.1); width: max-content;">';
  for (let i = 0; i < idStr.length; i++) {
    const charCode = idStr.charCodeAt(i);
    const w1 = (charCode % 3) + 1; // bar width 1 to 3px
    const w2 = ((charCode >> 1) % 3) + 1; // space width 1 to 3px
    html += `<div style="display: inline-block; height: 38px; width: ${w1}px; margin-right: ${w2}px; background: #111827;"></div>`;
  }
  html += '<div style="display: inline-block; height: 38px; width: 3px; margin-right: 2px; background: #111827;"></div>';
  html += '<div style="display: inline-block; height: 38px; width: 1px; margin-right: 1px; background: #111827;"></div>';
  html += '<div style="display: inline-block; height: 38px; width: 2px; margin-right: 0px; background: #111827;"></div>';
  html += '</div>';
  return html;
};

// --- Web Audio API Synthesizer & Speech Assistant ---
export const speakText = (text, lang = 'English') => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sanitized = text.replace(/[^\p{L}\p{N}\s.,!?-]/gu, '').substring(0, 150);
      const utterance = new SpeechSynthesisUtterance(sanitized);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'Kannada' || lang === 'kn') {
        utterance.lang = 'kn-IN';
        const knVoice = voices.find(v => v.lang.startsWith('kn') || v.lang.includes('Kannada'));
        if (knVoice) utterance.voice = knVoice;
      } else if (lang === 'Hindi' || lang === 'hi') {
        utterance.lang = 'hi-IN';
        const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.includes('Hindi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        utterance.lang = 'en-IN';
        const enVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {}
};

export const playSound = (type) => {
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
    } else if (type === 'bell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1); // C#5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'scanning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'lock') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'hiss') {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3500, ctx.currentTime + 0.4);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();
    } else if (type === 'pump') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch (e) {
    // Fail silently if audio context is blocked
  }
};

// --- Constants & Translations ---
export const STOPS = [
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

export const PRICING_TIERS = {
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
};

export const TRANSLATIONS = {
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
};

// Map coordinate interpolation helper (Lerps coordinate along the route stops)
export const getRouteCoordinates = (route, progress) => {
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
};

// Map real GPS coordinates mapping and interpolation helpers
export const getRealRouteStops = (route) => {
  if (route.includes('Mysuru') || route.includes('Mysore')) {
    return [
      { name: 'Bengaluru Majestic', lat: 12.97787, lng: 77.57124 },
      { name: 'Kengeri Hub', lat: 12.9177, lng: 77.4839 },
      { name: 'Mandya Stand', lat: 12.5222, lng: 76.8970 },
      { name: 'Mysuru Stand', lat: 12.3117, lng: 76.6570 }
    ];
  } else if (route.includes('Mangaluru') || route.includes('Mangalore')) {
    return [
      { name: 'Bengaluru Majestic', lat: 12.97787, lng: 77.57124 },
      { name: 'Hassan Depot', lat: 13.0063, lng: 76.1026 },
      { name: 'Mangaluru Depot', lat: 12.8751, lng: 74.8427 }
    ];
  } else if (route.includes('Hubli') || route.includes('Hubballi')) {
    return [
      { name: 'Bengaluru Majestic', lat: 12.97787, lng: 77.57124 },
      { name: 'Tumakuru Stand', lat: 13.3402, lng: 77.1006 },
      { name: 'Davanagere Depot', lat: 14.4644, lng: 75.9218 },
      { name: 'Hubballi Stand', lat: 15.3524, lng: 75.1381 }
    ];
  } else {
    return [
      { name: 'Bengaluru Majestic', lat: 12.97787, lng: 77.57124 },
      { name: 'Tumakuru Stand', lat: 13.3402, lng: 77.1006 },
      { name: 'Davanagere Depot', lat: 14.4644, lng: 75.9218 }
    ];
  }
};

export const getRealRouteCoordinates = (route, progress) => {
  const stops = getRealRouteStops(route);
  const segmentCount = stops.length - 1;
  const progressPerSegment = 100 / segmentCount;
  const segmentIdx = Math.min(Math.floor(progress / progressPerSegment), segmentCount - 1);
  const segmentProgress = (progress % progressPerSegment) / progressPerSegment;
  
  const start = stops[segmentIdx];
  const end = stops[segmentIdx + 1];
  
  const lat = start.lat + (end.lat - start.lat) * segmentProgress;
  const lng = start.lng + (end.lng - start.lng) * segmentProgress;
  
  return { lat, lng, stops };
};

const SimulationContext = createContext(null);

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({ children }) => {
  // Global Simulation State
  const [buses, setBuses] = useState([
    { id: 'AW-102', route: 'Bengaluru - Mysuru', type: 'Airavat Club Class', category: 'Express', eta: '12 mins', location: 'Kengeri Stop', status: 'En Route', progress: 85, speed: 54, rpm: 1620, temp: 92, fuel: 64, tirePressure: { fl: 34, fr: 34, rl: 36, rr: 36 } },
    { id: 'RJ-205', route: 'Mysuru - Bengaluru', type: 'Rajahamsa', category: 'Standard', eta: '45 mins', location: 'Mandya Hub', status: 'En Route', progress: 30, speed: 48, rpm: 1450, temp: 88, fuel: 52, tirePressure: { fl: 32, fr: 32, rl: 34, rr: 34 } },
    { id: 'AW-007', route: 'Bengaluru - Mangaluru', type: 'Airavat Multi-Axle', category: 'Express', eta: '2 mins', location: 'Entering Yeshwanthpur', status: 'Arriving', progress: 95, speed: 12, rpm: 980, temp: 90, fuel: 75, tirePressure: { fl: 35, fr: 35, rl: 38, rr: 38 } },
    { id: 'KS-442', route: 'Bengaluru - Hubli', type: 'Karnataka Sarige', category: 'Economy', eta: '1 hr 12m', location: 'Nelamangala Toll', status: 'En Route', progress: 70, speed: 58, rpm: 1840, temp: 94, fuel: 42, tirePressure: { fl: 28, fr: 33, rl: 35, rr: 35 } },
    { id: 'AW-088', route: 'Bengaluru - Mangaluru', type: 'Airavat Club Class', category: 'Express', eta: '3 hrs', location: 'Majestic Depot', status: 'Scheduled', progress: 0, speed: 0, rpm: 800, temp: 75, fuel: 100, tirePressure: { fl: 35, fr: 35, rl: 36, rr: 36 } },
    { id: 'RJ-310', route: 'Mysuru - Bengaluru', type: 'Rajahamsa', category: 'Standard', eta: '15 mins', location: 'Ramanagara', status: 'En Route', progress: 75, speed: 52, rpm: 1510, temp: 89, fuel: 61, tirePressure: { fl: 34, fr: 34, rl: 35, rr: 35 } },
    { id: 'KS-150', route: 'Bengaluru - Hubli', type: 'Karnataka Sarige', category: 'Economy', eta: '6 hrs', location: 'Majestic Depot', status: 'Scheduled', progress: 5, speed: 45, rpm: 1380, temp: 82, fuel: 95, tirePressure: { fl: 30, fr: 32, rl: 35, rr: 35 } }
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
    },
    {
      id: 'RV-1029',
      type: 'Sending',
      status: 'Delivered',
      bus: 'RJ-310',
      pickupOtp: '1120',
      deliveryOtp: '7451',
      origin: 'Kempegowda Bus Station (Majestic), Bengaluru',
      destination: 'Mandya KSRTC Bus Stand',
      senderName: 'You',
      senderPhone: '9876543210',
      receiverName: 'Mahesh Kumar',
      receiverPhone: '9448123789',
      totalFare: 110,
      insurance: false,
      fragile: false,
      rating: 5,
      history: [
        { time: 'Yesterday, 02:15 PM', msg: 'Cargo booked and loaded' },
        { time: 'Yesterday, 04:30 PM', msg: 'Arrived at Mandya depot' },
        { time: 'Yesterday, 04:45 PM', msg: 'Retrieved from Locker LKR-A1' }
      ]
    },
    {
      id: 'RV-7744',
      type: 'Receiving',
      status: 'In_Transit',
      bus: 'KS-442',
      pickupOtp: null,
      deliveryOtp: '5610',
      origin: 'Hubballi Central Stand',
      destination: 'Kempegowda Bus Station (Majestic), Bengaluru',
      senderName: 'Naveen G',
      senderPhone: '9844098765',
      receiverName: 'You',
      receiverPhone: '9876543210',
      totalFare: 260,
      insurance: true,
      fragile: false,
      rating: 0,
      history: [
        { time: '02:00 PM', msg: 'Cargo checked-in at Hubballi Stand' },
        { time: '03:15 PM', msg: 'Loaded on Sarige Bus KS-442' }
      ]
    },
    {
      id: 'RV-2051',
      type: 'Sending',
      status: 'Pending',
      bus: 'RJ-205',
      pickupOtp: '6700',
      deliveryOtp: '3941',
      origin: 'Kempegowda Bus Station (Majestic), Bengaluru',
      destination: 'Mandya KSRTC Bus Stand',
      senderName: 'You',
      senderPhone: '9876543210',
      receiverName: 'Suhail Ahmed',
      receiverPhone: '9845123456',
      totalFare: 130,
      insurance: false,
      fragile: true,
      rating: 0,
      history: [
        { time: '07:30 PM', msg: 'Cargo registered at Majestic Kiosk' }
      ]
    }
  ]);

  const [walletBalance, setWalletBalance] = useState(1450);
  const [transactions, setTransactions] = useState([
    { id: 'TXN-901', type: 'Deposit', amount: 500, date: 'Today, 10:30 AM', status: 'Success' },
    { id: 'TXN-902', type: 'Payment', amount: -140, date: 'Today, 11:40 AM', desc: 'Fare for RV-9932', status: 'Success' },
    { id: 'TXN-903', type: 'Payment', amount: -260, date: 'Today, 02:00 PM', desc: 'Fare for RV-7744', status: 'Success' },
    { id: 'TXN-904', type: 'Payment', amount: -110, date: 'Yesterday, 02:15 PM', desc: 'Fare for RV-1029', status: 'Success' },
    { id: 'TXN-905', type: 'Deposit', amount: 1000, date: 'Yesterday, 09:00 AM', status: 'Success' }
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
  const [currentUser, setCurrentUser] = useState(null); // Customer, Driver, Admin
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

  // New Core State Definitions
  const [weather, setWeather] = useState('Clear');
  const [lockers, setLockers] = useState([
    { id: 'LKR-A1', location: 'Kempegowda Bus Station (Majestic), Bengaluru', status: 'Empty', pin: '198421', parcelId: null },
    { id: 'LKR-A2', location: 'Kempegowda Bus Station (Majestic), Bengaluru', status: 'Empty', pin: '451029', parcelId: null },
    { id: 'LKR-M1', location: 'Mysuru Central Bus Stand', status: 'Empty', pin: '883011', parcelId: null },
    { id: 'LKR-M2', location: 'Mysuru Central Bus Stand', status: 'Empty', pin: '394102', parcelId: null },
    { id: 'LKR-N1', location: 'Mangaluru KSRTC Depot', status: 'Empty', pin: '745102', parcelId: null }
  ]);
  const [routeCoins, setRouteCoins] = useState(120);
  const [unlockedThemes, setUnlockedThemes] = useState(['dark', 'light']);
  const [userBadge, setUserBadge] = useState('Member');
  const [coupons, setCoupons] = useState([]);
  const [savedContacts, setSavedContacts] = useState([
    { name: 'Suhail Ahmed', phone: '9845123456', kiosk: 'Mysuru Central Bus Stand' },
    { name: 'Priya K', phone: '9008877665', kiosk: 'Mangaluru KSRTC Depot' }
  ]);
  const [incidentLogs, setIncidentLogs] = useState([
    { id: 'INC-101', time: '10:00 AM', title: 'System initialized', desc: 'All telemetry interfaces active.', severity: 'info' }
  ]);
  const [globalBroadcast, setGlobalBroadcast] = useState('INFO: Standard logistics schedules active across all South Karnataka hubs.');
  const [driverCheckedIn, setDriverCheckedIn] = useState(false);
  const [driverCashBalance, setDriverCashBalance] = useState(350);
  const [conductorBreakActive, setConductorBreakActive] = useState(false);
  const [conductorBreakTimer, setConductorBreakTimer] = useState(0);
  const [activeLockerClaim, setActiveLockerClaim] = useState(null);
  const [activeClaimParcel, setActiveClaimParcel] = useState(null);
  const [bypassEvidenceList, setBypassEvidenceList] = useState([]);

  // Tabs / Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [autopilotVoice, setAutopilotVoice] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Driver Console Specifics
  const [driverBusId, setDriverBusId] = useState('AW-102');
  const [driverScannerOpen, setDriverScannerOpen] = useState(false);
  const [driverScannerStage, setDriverScannerStage] = useState('idle');
  const [scannedParcelId, setScannedParcelId] = useState('');
  const [bypassCameraOpen, setBypassCameraOpen] = useState(false);
  const [geofenceActive, setGeofenceActive] = useState(false);
  const [geofenceTimer, setGeofenceTimer] = useState(120);

  // System Alerts
  const [systemAlerts, setSystemAlerts] = useState([
    { id: 'ALT-1', busId: 'KS-442', title: 'Low Tire Pressure', desc: 'Front left tire at 28 PSI. Drive with caution.', severity: 'medium' }
  ]);

  // Troubleshooting & Confetti states
  const [troubleshootType, setTroubleshootType] = useState(null);
  const [troubleshootStep, setTroubleshootStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);

  const triggerConfettiEffect = () => {
    playSound('bell');
    const colors = ['#f59e0b', '#dc2626', '#10b981', '#3b82f6', '#d946ef', '#06b6d4'];
    const particles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      left: Math.random() * 100
    }));
    setConfettiParticles(particles);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setConfettiParticles([]);
    }, 2800);
  };

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
  }, [geofenceActive, geofenceTimer, driverBusId]);

  // Conductor tea break timer
  useEffect(() => {
    let interval;
    if (conductorBreakActive && conductorBreakTimer > 0) {
      interval = setInterval(() => {
        setConductorBreakTimer(prev => prev - 1);
      }, 1000);
    } else if (conductorBreakTimer === 0 && conductorBreakActive) {
      setConductorBreakActive(false);
      addLog(`DRIVER: Tea break / fueling halt completed for ${driverBusId}. Resuming route.`);
      const text = appLanguage === 'Kannada' 
        ? "ವಿರಾಮ ಪೂರ್ಣಗೊಂಡಿದೆ. ಪ್ರಯಾಣ ಮುಂದುವರಿದಿದೆ."
        : appLanguage === 'Hindi'
        ? "अवकाश पूरा हो गया है। पारगमन फिर से शुरू हो गया है।"
        : "Break completed. Transit resumed.";
      speakText(text, appLanguage);
      playSound('chime');
    }
    return () => clearInterval(interval);
  }, [conductorBreakActive, conductorBreakTimer, driverBusId, appLanguage]);

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

  // Autopilot Voice Guide reactive effect
  useEffect(() => {
    let timer;
    if (autopilotVoice && currentUser === 'Driver') {
      timer = setTimeout(() => {
        const activeBus = buses.find(b => b.id === driverBusId);
        if (activeBus) {
          const routeStops = activeBus.route.split('-').map(s => s.trim());
          const driverParcels = parcels.filter(p => p.bus === activeBus.id);
          const pendingLoads = driverParcels.filter(p => p.status !== 'Delivered').length;
          const nextHalt = activeBus.progress < 50 ? routeStops[0] : routeStops[1];
          
          let text = "";
          if (appLanguage === 'Kannada') {
            text = `ಧ್ವನಿ ಅಪ್ಡೇಟ್. ಬಸ್ ವೇಗ ಗಂಟೆಗೆ ${activeBus.speed} ಕಿಲೋಮೀಟರ್. ಸ್ಥಿತಿ: ${activeBus.status}. `;
            if (activeBus.status === 'Arrived') {
              text += `ನೀವು ${activeBus.location} ತಲುಪಿದ್ದೀರಿ. ಲಾಕರ್ ಪರಿಶೀಲನೆಗೆ ಮುಂದುವರಿಯಿರಿ.`;
            } else {
              text += `ಮುಂದಿನ ನಿಲ್ದಾಣ: ${nextHalt}. ಸಕ್ರಿಯ ಪಾರ್ಸೆಲ್‌ಗಳು: ${pendingLoads}.`;
            }
          } else if (appLanguage === 'Hindi') {
            text = `आवाज अपडेट। बस की गति ${activeBus.speed} किलोमीटर प्रति घंटा। स्थिति: ${activeBus.status}। `;
            if (activeBus.status === 'Arrived') {
              text += `आप ${activeBus.location} पहुंच चुके हैं। लॉकर सत्यापन पर आगे बढ़ें।`;
            } else {
              text += `अगला पड़ाव: ${nextHalt}। सक्रिय पार्सल: ${pendingLoads}।`;
            }
          } else {
            text = `Telemetry update. Bus speed is ${activeBus.speed} kilometers per hour. Status is ${activeBus.status}. `;
            if (activeBus.status === 'Arrived') {
              text += `You have arrived at ${activeBus.location}. Proceed to depot locker verification.`;
            } else {
              text += `Upcoming halt: ${nextHalt}. Active parcel load manifest: ${pendingLoads} packages.`;
            }
          }
          speakText(text, appLanguage);
        }
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [buses, weather, autopilotVoice, currentUser, driverBusId, appLanguage, parcels]);

  // Speech Recognition hook for hands-free driver voice assistance
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = appLanguage === 'Kannada' ? 'kn-IN' : appLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
      
      rec.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim().toLowerCase();
        setVoiceTranscript(text);
        addLog(`VOICE: Heard command "${text}"`);
        processVoiceCommand(text);
      };
      
      rec.onerror = (e) => {
        if (e.error !== 'no-speech') {
          console.error('Speech recognition error', e);
          setMicActive(false);
        }
      };
      
      rec.onend = () => {
        if (recognitionRef.current && micActive) {
          try {
            recognitionRef.current.start();
          } catch (err) {}
        }
      };
      
      recognitionRef.current = rec;
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [appLanguage, micActive]);

  // Voice Command Processing Handlers
  const processVoiceCommand = (command) => {
    const cmd = command.toLowerCase();
    
    if (cmd.includes('traffic') || cmd.includes('jam') || cmd.includes('congestion') || cmd.includes('ಟ್ರಾಫಿಕ್') || cmd.includes('जाम')) {
      triggerTrafficReportFromVoice();
    } else if (cmd.includes('break') || cmd.includes('tea') || cmd.includes('halt') || cmd.includes('ಚಹಾ') || cmd.includes('ब्रेक')) {
      triggerBreakFromVoice();
    } else if (cmd.includes('refuel') || cmd.includes('fuel') || cmd.includes('ಇಂಧನ') || cmd.includes('ईंधन')) {
      triggerRefuelFromVoice();
    } else if (cmd.includes('guide') || cmd.includes('status') || cmd.includes('manifest') || cmd.includes('ಮಾರ್ಗದರ್ಶಿ') || cmd.includes('गाइड') || cmd.includes('ಕಾರ್ಗೋ') || cmd.includes('पार्सल')) {
      triggerVoiceGuideFromVoice();
    } else if (cmd.includes('clear') || cmd.includes('reset') || cmd.includes('fix') || cmd.includes('ಕ್ಲಿಯರ್') || cmd.includes('रिसेट')) {
      triggerTelemetryResetFromVoice();
    } else if (cmd.includes('bypass') || cmd.includes('snap') || cmd.includes('photo') || cmd.includes('ಕ್ಯಾಮೆರಾ') || cmd.includes('कैमरा')) {
      triggerBypassFromVoice();
    }
  };

  const triggerTrafficReportFromVoice = () => {
    const activeBus = buses.find(b => b.id === driverBusId) || buses[0];
    playSound('warning');
    
    setBuses(prev => prev.map(b => b.id === activeBus.id ? { ...b, speed: 8, eta: 'Delayed +45m', status: 'Delayed' } : b));
    setNotifications(prev => [
      { id: Date.now(), title: `Traffic Alert: Bus ${activeBus.id}`, message: `Conductor reports heavy traffic delay. Expected ETA updated to +45 mins.`, type: 'alert', time: 'Just now' },
      ...prev
    ]);
    setHasUnread(true);
    setToast({ title: 'Traffic Jam Delay Surcharge', message: `Bus ${activeBus.id} has reported heavy traffic jam on Mysuru Road.` });
    
    const text = appLanguage === 'Kannada' 
      ? `ಸಂಚಾರ ವಿಳಂಬ ಮುನ್ನೆಚ್ಚರಿಕೆ. ಬಸ್ ${activeBus.id} ನಿರ್ವಾಹಕರು ಭಾರಿ ರಸ್ತೆ ದಟ್ಟಣೆಯನ್ನು ವರದಿ ಮಾಡಿದ್ದಾರೆ.`
      : appLanguage === 'Hindi'
      ? `यातायात देरी की चेतावनी। बस ${activeBus.id} के कंडक्टर ने भारी मार्ग भीड़ की सूचना दी है।`
      : `Traffic delay warning. Bus ${activeBus.id} conductor reports heavy route congestion.`;
    speakText(text, appLanguage);
    addLog(`DRIVER (VOICE): Reported route traffic congestion.`);
  };

  const triggerBreakFromVoice = () => {
    setConductorBreakActive(true);
    setConductorBreakTimer(15);
    addLog(`DRIVER (VOICE): Initiated 15s tea break.`);
    speakText(appLanguage === 'Kannada' ? "ನಿರ್ವಾಹಕರ ಚಹಾ ವಿರಾಮ ಪ್ರಾರಂಭವಾಗಿದೆ." : appLanguage === 'Hindi' ? "कंडक्टर का चाय अवकाश शुरू हो गया है।" : "Conductor tea break started.", appLanguage);
  };

  const triggerRefuelFromVoice = () => {
    setConductorBreakActive(true);
    setConductorBreakTimer(15);
    addLog(`DRIVER (VOICE): Initiated fueling break.`);
    speakText(appLanguage === 'Kannada' ? "ಇಂಧನ ತುಂಬಿಸುವ ನಿಲುಗಡೆ ಪ್ರಾರಂಭವಾಗಿದೆ." : appLanguage === 'Hindi' ? "ईंधन भरने का ठहराव शुरू हो गया है।" : "Fueling halt started.", appLanguage);
  };

  const triggerVoiceGuideFromVoice = () => {
    const activeBus = buses.find(b => b.id === driverBusId) || buses[0];
    const driverParcels = parcels.filter(p => p.bus === activeBus.id);
    const routeStops = activeBus.route.split('-').map(s => s.trim());
    const pendingLoads = driverParcels.filter(p => p.status !== 'Delivered').length;
    const nextHalt = activeBus.progress < 50 ? routeStops[0] : routeStops[1];
    
    let guideSpeech = "";
    if (appLanguage === 'Kannada') {
      guideSpeech = `ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ. ಬಸ್ ಸಂಖ್ಯೆ ${activeBus.id}. ಪ್ರಸ್ತುತ ವೇಗ: ಗಂಟೆಗೆ ${activeBus.speed} ಕಿಲೋಮೀಟರ್. ಮುಂದಿನ ನಿಲ್ದಾಣ: ${nextHalt}. ಸಕ್ರಿಯ ಪಾರ್ಸೆಲ್‌ಗಳು: ${pendingLoads}.`;
    } else if (appLanguage === 'Hindi') {
      guideSpeech = `आवाज गाइड। बस संख्या ${activeBus.id}। वर्तमान गति: ${activeBus.speed} किलोमीटर प्रति घंटा। अगला पड़ाव: ${nextHalt}। सक्रिय पार्सल: ${pendingLoads}।`;
    } else {
      guideSpeech = `Voice Assistant. Operating Route: ${activeBus.route}. Current speed: ${activeBus.speed} kilometers per hour. Next upcoming kiosk stand is ${nextHalt}. There are ${pendingLoads} packages loaded on board for transit.`;
    }
    speakText(guideSpeech, appLanguage);
    addLog(`DRIVER (VOICE): Spoke manifest telemetry.`);
  };

  const triggerTelemetryResetFromVoice = () => {
    injectAlert('clear');
    addLog(`DRIVER (VOICE): Cleared vehicle warnings.`);
  };

  const triggerBypassFromVoice = () => {
    const activeBus = buses.find(b => b.id === driverBusId) || buses[0];
    const driverParcels = parcels.filter(p => p.bus === activeBus.id && p.status === 'In_Transit');
    if (driverParcels.length > 0) {
      const p = driverParcels[0];
      playSound('beep');
      adHocDropParcel(p.id);
      setBypassEvidenceList(prev => [...prev, { parcelId: p.id, busId: activeBus.id, time: new Date().toLocaleTimeString() }]);
      speakText(appLanguage === 'Kannada' ? "ಫೋಟೋ ಬೈಪಾಸ್ ಸಾಕ್ಷ್ಯವನ್ನು ಉಳಿಸಲಾಗಿದೆ." : appLanguage === 'Hindi' ? "फोटो बाईपास साक्ष्य सहेजा गया।" : "Photo bypass evidence captured.", appLanguage);
      addLog(`DRIVER (VOICE): Captured absent receiver bypass for parcel ${p.id}.`);
    } else {
      speakText(appLanguage === 'Kannada' ? "ಬೈಪಾಸ್ ಮಾಡಲು ಯಾವುದೇ ಪಾರ್ಸೆಲ್ ಇಲ್ಲ." : appLanguage === 'Hindi' ? "बाईपास करने के लिए कोई पार्सल नहीं।" : "No parcels to bypass.", appLanguage);
    }
  };

  const toggleMic = () => {
    playSound('click');
    if (!recognitionRef.current) {
      alert("Web Speech Recognition is not supported or initialized in this browser session.");
      return;
    }
    if (micActive) {
      setMicActive(false);
      recognitionRef.current.stop();
      addLog("VOICE: Microphone disabled.");
      speakText("Voice control disabled", appLanguage);
    } else {
      setMicActive(true);
      setVoiceTranscript('Listening...');
      addLog("VOICE: Microphone active. Listening for commands.");
      speakText(appLanguage === 'Kannada' ? "ಧ್ವನಿ ನಿಯಂತ್ರಣ ಸಕ್ರಿಯವಾಗಿದೆ" : appLanguage === 'Hindi' ? "ध्वनि नियंत्रण सक्रिय" : "Voice control active", appLanguage);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Environmental Time Simulation Logic
  const advanceSimulationTime = () => {
    playSound('click');
    addLog(`SIMULATOR: Time advanced. Route progress updated.`);
    
    const weatherRoll = Math.random();
    let nextWeather = 'Clear';
    if (weatherRoll < 0.18) nextWeather = 'Rainy';
    else if (weatherRoll < 0.28) nextWeather = 'Foggy';
    
    if (nextWeather !== weather) {
      setWeather(nextWeather);
      addLog(`ENVIRONMENT: Weather updated to ${nextWeather}.`);
      
      let weatherMsg = `Weather update: Now ${nextWeather}.`;
      if (appLanguage === 'Kannada') {
        const wKn = nextWeather === 'Rainy' ? 'ಮಳೆ' : nextWeather === 'Foggy' ? 'ಮಂಜು' : 'ಶುಭ್ರ ಆಕಾಶ';
        weatherMsg = `ಹವಾಮಾನ ಅಪ್ಡೇಟ್: ಈಗ ${wKn}.`;
      } else if (appLanguage === 'Hindi') {
        const wHi = nextWeather === 'Rainy' ? 'बारिश' : nextWeather === 'Foggy' ? 'कोहरा' : 'साफ मौसम';
        weatherMsg = `मौसम अपडेट: अब ${wHi}.`;
      }
      speakText(weatherMsg, appLanguage);
      playSound('beep');
    }

    const weatherSpeedMult = nextWeather === 'Rainy' ? 0.7 : nextWeather === 'Foggy' ? 0.5 : 1.0;

    setBuses(prevBuses => prevBuses.map(bus => {
      if (conductorBreakActive && bus.id === driverBusId) {
        return { ...bus, speed: 0, rpm: 800, status: 'At Break' };
      }

      const baseProgress = Math.floor(Math.random() * 8) + 4;
      const weatherProgress = Math.max(1, Math.round(baseProgress * weatherSpeedMult));
      const newProgress = Math.min(bus.progress + weatherProgress, 100);
      const isArrivedNow = newProgress === 100 && bus.progress < 100;
      
      let newSpeed = newProgress === 100 ? 0 : Math.max(30, Math.min(80, bus.speed + Math.floor(Math.random() * 11) - 5));
      newSpeed = Math.round(newSpeed * weatherSpeedMult);
      const newRPM = newProgress === 100 ? 800 : Math.max(1000, Math.min(2200, bus.rpm + Math.floor(Math.random() * 201) - 100));
      const newFuel = Math.max(10, bus.fuel - (newProgress - bus.progress) * 0.1);
      
      if (isArrivedNow) {
        addLog(`ALERT: Bus ${bus.id} has arrived at destination depot.`);
        playSound('bell');
        speakText(`Attention: Bus ${bus.id} has arrived at destination depot.`);
        
        setNotifications(prev => [
          { id: Date.now(), title: `Arrival: Bus ${bus.id}`, message: `Arrived at ${bus.route.split('-')[1].trim()}`, type: 'success', time: 'Just now' },
          ...prev
        ]);
        setHasUnread(true);

        setLockers(currentLockers => {
          let updated = [...currentLockers];
          parcels.forEach(p => {
            if (p.bus === bus.id && p.status === 'In_Transit') {
              const freeLocker = updated.find(l => l.status === 'Empty' && p.destination.toLowerCase().includes(l.location.split(',')[0].split(' ')[0].toLowerCase()));
              if (freeLocker) {
                freeLocker.status = 'Occupied';
                freeLocker.parcelId = p.id;
                addLog(`LOCKER: Allocated Parcel ${p.id} to depot Locker ${freeLocker.id}. PIN code is ${freeLocker.pin}.`);
              }
            }
          });
          return updated;
        });
      }

      return {
        ...bus,
        progress: newProgress,
        status: newProgress === 100 ? 'Arrived' : 'En Route',
        eta: newProgress === 100 ? 'Arrived' : `${Math.round((100 - newProgress) * 1.5 * (1 / weatherSpeedMult))} mins`,
        location: newProgress === 100 ? bus.route.split('-')[1].trim() : bus.location,
        speed: newSpeed,
        rpm: newRPM,
        fuel: Math.round(newFuel * 10) / 10
      };
    }));

    setParcels(prevParcels => prevParcels.map(p => {
      const relatedBus = buses.find(b => b.id === p.bus);
      if (!relatedBus) return p;

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

  const injectAlert = (type) => {
    playSound('beep');
    let title = '';
    let desc = '';
    let severity = 'medium';

    if (type === 'engine_heat') {
      setBuses(prev => prev.map(b => b.id === 'AW-102' ? { ...b, temp: 118, speed: 20, rpm: 1200, status: 'Warning' } : b));
      title = 'Critical Engine Heat';
      desc = 'Engine temperature critical (118°C) near Mandya.';
      severity = 'high';
      
      const txt = appLanguage === 'Kannada' 
        ? "ಎಚ್ಚರಿಕೆ. ಬಸ್ ಸಂಖ್ಯೆ AW-102 ರಲ್ಲಿ ತಾಪಮಾನವು ಹೆಚ್ಚಾಗಿದೆ."
        : appLanguage === 'Hindi'
        ? "चेतावनी। बस संख्या AW-102 पर इंजन का तापमान बढ़ गया है।"
        : "Warning. Critical engine temperature on bus A W 102.";
      speakText(txt, appLanguage);

      setSystemAlerts(prev => [
        { id: 'ALT-102', busId: 'AW-102', title, desc, severity },
        ...prev
      ]);
    } else if (type === 'traffic') {
      setBuses(prev => prev.map(b => b.id === 'RJ-205' ? { ...b, eta: 'Delayed +30m', speed: 10, rpm: 1000, status: 'Delayed' } : b));
      title = 'Traffic Jam Delay';
      desc = 'Traffic congestion injected on Mysuru Road for bus RJ-205.';
      
      const txt = appLanguage === 'Kannada'
        ? "ಟ್ರಾಫಿಕ್ ಅಲರ್ಟ್. ಮೈಸೂರು ಹೆದ್ದಾರಿಯಲ್ಲಿ ಭಾರಿ ಸಂಚಾರ ದಟ್ಟಣೆ ವರದಿಯಾಗಿದೆ."
        : appLanguage === 'Hindi'
        ? "यातायात अलर्ट। मैसूर राजमार्ग पर भारी भीड़ की सूचना है।"
        : "Traffic alert: heavy congestion reported on Mysuru highway.";
      speakText(txt, appLanguage);

    } else if (type === 'tire_low') {
      setBuses(prev => prev.map(b => b.id === 'KS-442' ? { ...b, tirePressure: { ...b.tirePressure, fl: 22 }, status: 'Warning' } : b));
      title = 'Low Tire Pressure';
      desc = 'Front Left tire pressure critical at 22 PSI.';
      severity = 'high';
      
      const txt = appLanguage === 'Kannada'
        ? "ಎಚ್ಚರಿಕೆ. ಬಸ್ ಸಂಖ್ಯೆ KS-442 ರಲ್ಲಿ ಕಡಿಮೆ ಟೈರ್ ಒತ್ತಡದ ಎಚ್ಚರಿಕೆ."
        : appLanguage === 'Hindi'
        ? "चेतावनी। बस संख्या KS-442 पर कम टायर दबाव की चेतावनी।"
        : "Warning. Low tire pressure warning on bus K S 442.";
      speakText(txt, appLanguage);

      setSystemAlerts(prev => [
        { id: 'ALT-442', busId: 'KS-442', title, desc, severity },
        ...prev
      ]);
    } else if (type === 'clear') {
      setBuses(prev => prev.map(b => {
        if (b.id === 'AW-102') return { ...b, temp: 92, speed: 52, rpm: 1600, status: 'En Route' };
        if (b.id === 'RJ-205') return { ...b, eta: '15 mins', speed: 50, rpm: 1500, status: 'En Route' };
        if (b.id === 'KS-442') return { ...b, tirePressure: { fl: 34, fr: 34, rl: 36, rr: 36 }, status: 'En Route' };
        return b;
      }));
      setSystemAlerts([]);
      title = 'Telemetry Reset';
      desc = 'Cleared all active alarms and telemetric anomalies.';
      severity = 'info';
      
      const txt = appLanguage === 'Kannada'
        ? "ಎಲ್ಲಾ ಟೆಲಿಮೆಟ್ರಿ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ."
        : appLanguage === 'Hindi'
        ? "सभी टेलीमेट्री चेतावनी को सफलतापूर्वक साफ़ कर दिया गया है।"
        : "All telemetry warnings resolved and reset.";
      speakText(txt, appLanguage);
    }

    setIncidentLogs(prev => [
      { id: 'INC-' + Math.floor(100 + Math.random() * 900), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), title, desc, severity },
      ...prev
    ]);
    addLog(`ALERT: ${title} - ${desc}`);
  };

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

    setParcels(prev => prev.map(p => p.bus === busId ? { ...p, bus: `${busId}-B` } : p));
    setSystemAlerts(prev => prev.filter(a => a.busId !== busId));
  };

  const deliverParcel = (parcelId) => {
    playSound('chime');
    let fare = 0;
    setParcels(prev => prev.map(p => {
      if (p.id === parcelId) {
        fare = p.totalFare || 0;
        return {
          ...p,
          status: 'Delivered',
          history: [...p.history, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg: 'Cargo handed over to recipient (OTP Verified)' }]
        };
      }
      return p;
    }));
    setDriverCashBalance(prev => prev + fare);
    addLog(`LOGISTICS: Parcel ${parcelId} successfully delivered via OTP. Collected ₹${fare}.`);
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

  const depositParcelInLocker = (parcelId, lockerId) => {
    playSound('chime');
    playSound('lock');
    setLockers(prev => prev.map(l => l.id === lockerId ? { ...l, status: 'Occupied', parcelId: parcelId } : l));
    setParcels(prev => prev.map(p => p.id === parcelId ? {
      ...p,
      history: [...p.history, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg: `Deposited by conductor in secure Depot Locker ${lockerId}. PIN code issued to recipient.` }]
    } : p));
    addLog(`LOCKER: Conductor deposited parcel ${parcelId} in secure locker ${lockerId}.`);
    speakText(`Parcel deposited in locker ${lockerId}`, appLanguage);
    setToast({ title: 'Locker Deposit Complete', message: `Parcel ${parcelId} was locked in ${lockerId}.` });
  };

  const startOtpGeofence = () => {
    playSound('click');
    setGeofenceActive(true);
    setGeofenceTimer(120);
    addLog(`DRIVER: Approaching geofence boundary. Commencing wait period.`);
  };

  return (
    <SimulationContext.Provider value={{
      buses, setBuses,
      parcels, setParcels,
      walletBalance, setWalletBalance,
      transactions, setTransactions,
      logs, setLogs, addLog,
      currentUser, setCurrentUser,
      appLanguage, setAppLanguage,
      theme, setTheme,
      isOffline, setIsOffline,
      toast, setToast,
      notifications, setNotifications,
      notificationsOpen, setNotificationsOpen,
      hasUnread, setHasUnread,
      menuOpen, setMenuOpen,
      weather, setWeather,
      lockers, setLockers,
      routeCoins, setRouteCoins,
      unlockedThemes, setUnlockedThemes,
      userBadge, setUserBadge,
      coupons, setCoupons,
      savedContacts, setSavedContacts,
      incidentLogs, setIncidentLogs,
      globalBroadcast, setGlobalBroadcast,
      driverCheckedIn, setDriverCheckedIn,
      driverCashBalance, setDriverCashBalance,
      conductorBreakActive, setConductorBreakActive,
      conductorBreakTimer, setConductorBreakTimer,
      activeLockerClaim, setActiveLockerClaim,
      activeClaimParcel, setActiveClaimParcel,
      bypassEvidenceList, setBypassEvidenceList,
      activeTab, setActiveTab,
      selectedParcel, setSelectedParcel,
      selectedInvoice, setSelectedInvoice,
      autopilotVoice, setAutopilotVoice,
      micActive, setMicActive,
      voiceTranscript, setVoiceTranscript,
      driverBusId, setDriverBusId,
      driverScannerOpen, setDriverScannerOpen,
      driverScannerStage, setDriverScannerStage,
      scannedParcelId, setScannedParcelId,
      bypassCameraOpen, setBypassCameraOpen,
      geofenceActive, setGeofenceActive,
      geofenceTimer, setGeofenceTimer,
      systemAlerts, setSystemAlerts,
      troubleshootType, setTroubleshootType,
      troubleshootStep, setTroubleshootStep,
      showConfetti, setShowConfetti,
      confettiParticles, setConfettiParticles,
      triggerConfettiEffect,
      advanceSimulationTime,
      injectAlert,
      dispatchBackupBus,
      deliverParcel,
      adHocDropParcel,
      depositParcelInLocker,
      startOtpGeofence,
      toggleMic,
      t
    }}>
      {children}
    </SimulationContext.Provider>
  );
};
