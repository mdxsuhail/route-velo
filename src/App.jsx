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
  Hammer,
  CloudRain,
  CloudFog,
  Sun,
  Coins,
  Lock,
  Volume2,
  ShieldAlert,
  Sparkles,
  Leaf,
  HelpCircle,
  Send
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Input Sanitization & Security Protection Helpers ---
const sanitizeInput = (text, maxLength = 120) => {
  if (typeof text !== 'string') return '';
  // Strip HTML elements/tags to mitigate injection
  const clean = text.replace(/<\/?[^>]+(>|$)/g, "");
  return clean.trim().substring(0, maxLength);
};

// --- Visual Barcode Generator Utilities ---
const generateBarcodeHTML = (parcelId) => {
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

const generateBarcodeHTMLString = (parcelId) => {
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
const speakText = (text, lang = 'English') => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Allow Unicode characters for Hindi/Kannada letters by using a broader regex
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

// Map real GPS coordinates mapping and interpolation helpers
const getRealRouteStops = (route) => {
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

const getRealRouteCoordinates = (route, progress) => {
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

// Customer Leaflet Map Component (Leaflet GPS integration for tracking)
const CustomerLeafletMap = ({ bus, routeStops }) => {
  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);
  const stopMarkersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    const startCoord = routeStops[0] ? [routeStops[0].lat, routeStops[0].lng] : [12.97787, 77.57124];
    
    const map = window.L.map('customer-leaflet-tracking-map', {
      zoomControl: false,
      attributionControl: false
    }).setView(startCoord, 8);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // Draw route polyline
    const pathCoords = routeStops.map(s => [s.lat, s.lng]);
    const poly = window.L.polyline(pathCoords, {
      color: 'var(--primary)',
      weight: 4,
      opacity: 0.7
    }).addTo(map);
    polylineRef.current = poly;

    // Add stop markers
    routeStops.forEach((stop, i) => {
      const isStart = i === 0;
      const isEnd = i === routeStops.length - 1;
      const color = isStart ? '#10b981' : isEnd ? '#ef4444' : 'var(--accent)';
      const markerIcon = window.L.divIcon({
        html: `<div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
        className: 'custom-stop-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const stopMarker = window.L.marker([stop.lat, stop.lng], { icon: markerIcon }).addTo(map);
      stopMarker.bindTooltip(`<div style="font-family: inherit; font-size: 11px;"><strong>${stop.name} Depot</strong><br/>KSRTC Kiosk connection active.</div>`, { direction: 'top' });
      stopMarkersRef.current.push(stopMarker);
    });

    // Fit map to route bounds
    try {
      map.fitBounds(poly.getBounds(), { padding: [30, 30] });
    } catch (e) {}

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [routeStops]);

  // Update bus marker dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !bus) return;

    const progress = bus.progress;
    const { lat, lng } = getRealRouteCoordinates(bus.route, progress);
    const isOverheated = bus.temp > 100;
    const isDelayed = bus.status === 'Delayed';
    const color = isOverheated ? 'var(--error)' : isDelayed ? 'var(--accent)' : 'var(--primary)';
    const shadowGlow = isOverheated ? 'var(--error-glow)' : isDelayed ? 'var(--accent-glow)' : 'var(--primary-glow)';

    const iconHtml = `
      <div class="animate-pulse" style="
        background: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px ${shadowGlow};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        font-weight: 800;
        color: white;
        font-family: inherit;
      ">
        🚌
      </div>
    `;

    const busIcon = window.L.divIcon({
      html: iconHtml,
      className: 'leaflet-customer-bus-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng([lat, lng]);
      busMarkerRef.current.setIcon(busIcon);
    } else {
      const marker = window.L.marker([lat, lng], { icon: busIcon }).addTo(map);
      busMarkerRef.current = marker;
    }

    busMarkerRef.current.bindTooltip(`
      <div style="font-family: inherit; font-size: 11px; padding: 4px; color: white; background: #111827; border: 1px solid var(--glass-border); border-radius: 4px;">
        <strong>Conductor Bus: ${bus.id}</strong><br/>
        Speed: ${bus.speed} km/h | Fuel: ${bus.fuel}%<br/>
        Status: <span style="color: ${isDelayed ? 'var(--accent)' : 'var(--success)'}">${bus.status}</span>
      </div>
    `, { direction: 'top', opacity: 0.95 });

    // Keep map centered on active bus
    map.panTo([lat, lng]);
  }, [bus, bus?.progress]);

  return (
    <div 
      id="customer-leaflet-tracking-map" 
      style={{ 
        height: 220, 
        width: '100%', 
        borderRadius: 12, 
        background: '#070a13',
        border: '1px solid var(--glass-border)',
        position: 'relative',
        zIndex: 1
      }} 
    />
  );
};

// --- Primary Workspace Wrapper ---
export default function App() {
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
  const [currentUser, setCurrentUser] = useState(null); // Customer, Driver, Admin (starts logged out)
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

  // --- New Core State Definitions for expanded features ---
  const [weather, setWeather] = useState('Clear'); // Clear, Rainy, Foggy
  const [lockers, setLockers] = useState([
    { id: 'LKR-A1', location: 'Kempegowda Bus Station (Majestic), Bengaluru', status: 'Empty', pin: '198421', parcelId: null },
    { id: 'LKR-A2', location: 'Kempegowda Bus Station (Majestic), Bengaluru', status: 'Empty', pin: '451029', parcelId: null },
    { id: 'LKR-M1', location: 'Mysuru Central Bus Stand', status: 'Empty', pin: '883011', parcelId: null },
    { id: 'LKR-M2', location: 'Mysuru Central Bus Stand', status: 'Empty', pin: '394102', parcelId: null },
    { id: 'LKR-N1', location: 'Mangaluru KSRTC Depot', status: 'Empty', pin: '745102', parcelId: null }
  ]);
  const [routeCoins, setRouteCoins] = useState(120);
  const [unlockedThemes, setUnlockedThemes] = useState(['dark', 'light']);
  const [userBadge, setUserBadge] = useState('Member'); // Member, VIP
  const [coupons, setCoupons] = useState([]); // Array of strings like "SAVE10"
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
  const [activeLockerClaim, setActiveLockerClaim] = useState(null); // Locker claims UI state
  const [activeClaimParcel, setActiveClaimParcel] = useState(null); // Insurance claims UI state
  const [bypassEvidenceList, setBypassEvidenceList] = useState([]); // Stores photo bypass files

  // Tabs / Navigation
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, booking, history, profile, tracking
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [autopilotVoice, setAutopilotVoice] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);

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

  // --- Troubleshooting & Confetti states ---
  const [troubleshootType, setTroubleshootType] = useState(null); // 'engine_heat', 'tire_low'
  const [troubleshootStep, setTroubleshootStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);

  const triggerConfettiEffect = () => {
    playSound('bell');
    const colors = ['#f59e0b', '#dc2626', '#10b981', '#3b82f6', '#d946ef', '#06b6d4'];
    const particles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
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
  }, [geofenceActive, geofenceTimer]);

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
  }, [conductorBreakActive, conductorBreakTimer]);

  // Toast Timer Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
  }, [buses, weather, autopilotVoice, currentUser, driverBusId, appLanguage]);

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
    
    // Weather simulator modifier
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

    // Update buses coordinates
    setBuses(prevBuses => prevBuses.map(bus => {
      // If driver is taking tea break on this bus, progress is paused
      if (conductorBreakActive && bus.id === driverBusId) {
        return { ...bus, speed: 0, rpm: 800, status: 'At Break' };
      }

      const baseProgress = Math.floor(Math.random() * 8) + 4;
      const weatherProgress = Math.max(1, Math.round(baseProgress * weatherSpeedMult));
      const newProgress = Math.min(bus.progress + weatherProgress, 100);
      const isArrivedNow = newProgress === 100 && bus.progress < 100;
      
      // Update vehicle variables randomly
      let newSpeed = newProgress === 100 ? 0 : Math.max(30, Math.min(80, bus.speed + Math.floor(Math.random() * 11) - 5));
      newSpeed = Math.round(newSpeed * weatherSpeedMult);
      const newRPM = newProgress === 100 ? 800 : Math.max(1000, Math.min(2200, bus.rpm + Math.floor(Math.random() * 201) - 100));
      const newFuel = Math.max(10, bus.fuel - (newProgress - bus.progress) * 0.1);
      
      if (isArrivedNow) {
        addLog(`ALERT: Bus ${bus.id} has arrived at destination depot.`);
        playSound('bell');
        speakText(`Attention: Bus ${bus.id} has arrived at destination depot.`);
        
        // Push notification
        setNotifications(prev => [
          { id: Date.now(), title: `Arrival: Bus ${bus.id}`, message: `Arrived at ${bus.route.split('-')[1].trim()}`, type: 'success', time: 'Just now' },
          ...prev
        ]);
        setHasUnread(true);

        // Assign cargo on this bus to empty lockers at destination stand
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

  // --- Sub-Components inside App ---

  // Auth Page Component
  const AuthPage = () => {
    const [selectedRole, setSelectedRole] = useState('Customer'); // Customer, Driver, Admin
    const [loginStep, setLoginStep] = useState('phone'); // phone, otp
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
    const [simulatedOtp, setSimulatedOtp] = useState('');
    const [driverBadge, setDriverBadge] = useState('');
    const [adminPasskey, setAdminPasskey] = useState('');
    const [isShake, setIsShake] = useState(false);
    
    const otpRef0 = useRef(null);
    const otpRef1 = useRef(null);
    const otpRef2 = useRef(null);
    const otpRef3 = useRef(null);
    const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

        // Generate simulated OTP when phone number step is finished
    const handleSendOtp = (overrideNum) => {
      const activeNum = typeof overrideNum === 'string' ? overrideNum : phoneNumber;
      if (activeNum.length !== 10) {
        playSound('warning');
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      playSound('chime');
      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setSimulatedOtp(randomOtp);
      setLoginStep('otp');
      addLog(`AUTH: Generated OTP ${randomOtp} for verification of phone +91 ${activeNum}`);
      speakText(`Your code is ${randomOtp.split('').join(' ')}`, appLanguage);
    };

    const handleOtpChange = (index, value) => {
      const val = value.replace(/[^0-9]/g, '');
      const newDigits = [...otpDigits];
      newDigits[index] = val;
      setOtpDigits(newDigits);

      if (val !== '' && index < 3) {
        otpRefs[index + 1].current.focus();
      }

      // Check if code is fully entered
      const fullCode = newDigits.join('');
      if (fullCode.length === 4) {
        if (fullCode === simulatedOtp || fullCode === '1234') {
          playSound('chime');
          setCurrentUser('Customer');
          addLog(`AUTH: Customer successfully verified via OTP (+91 ${phoneNumber})`);
          setToast({ title: 'Welcome Back', message: 'Logged in securely as Customer.' });
          speakText("Welcome back to Route Velo", appLanguage);
        } else {
          playSound('warning');
          setIsShake(true);
          setTimeout(() => setIsShake(false), 500);
          setOtpDigits(['', '', '', '']);
          otpRefs[0].current.focus();
        }
      }
    };

    const handleOtpKeyDown = (index, e) => {
      if (e.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
        otpRefs[index - 1].current.focus();
      }
    };

    const handleDriverLogin = (e) => {
      e.preventDefault();
      if (!driverBadge.trim()) {
        playSound('warning');
        alert('Please enter your Driver/Conductor Badge ID.');
        return;
      }
      playSound('chime');
      setCurrentUser('Driver');
      addLog(`AUTH: Conductor ${driverBadge} checked in.`);
      setToast({ title: 'Shift Started', message: `Driver Badge ${driverBadge} active.` });
      speakText("Shift session initialized", appLanguage);
    };

    const handleAdminLogin = (e) => {
      e.preventDefault();
      if (adminPasskey === 'KSRTC-ADMIN-2026' || adminPasskey === 'admin') {
        playSound('chime');
        setCurrentUser('Admin');
        addLog(`AUTH: System administrator logged in.`);
        setToast({ title: 'Command Center Active', message: 'Admin dashboard initialized.' });
        speakText("System Administrator authorized", appLanguage);
      } else {
        playSound('warning');
        setIsShake(true);
        setTimeout(() => setIsShake(false), 500);
        alert('Invalid System Passkey.');
      }
    };

    const handleSocialLogin = (platform) => {
      playSound('chime');
      setCurrentUser('Customer');
      addLog(`AUTH: Frictionless ${platform} login successful.`);
      setToast({ title: 'Google/Apple Sign-In', message: 'Instant frictionless login completed.' });
      speakText("Authenticated via social login", appLanguage);
    };

    return (
      <div className="auth-container animate-fade-in w-full">
        <div className="auth-header">
          <div className="auth-logo-glow">
            <Package size={32} color="var(--primary)" />
          </div>
          <h1 className="auth-title">RouteVelo</h1>
          <p className="auth-subtitle">KSRTC Smart Logistics</p>
        </div>

        <div className={`auth-card ${isShake ? 'animate-shake' : ''}`}>
          <div className="auth-tabs">
            {['Customer', 'Driver', 'Admin'].map(role => (
              <button
                key={role}
                className={`auth-tab ${selectedRole === role ? 'active' : ''}`}
                onClick={() => { playSound('click'); setSelectedRole(role); setLoginStep('phone'); }}
              >
                {role === 'Driver' ? 'Conductor' : role}
              </button>
            ))}
          </div>

          {selectedRole === 'Customer' && (
            <div className="animate-slide-up">
              {loginStep === 'phone' ? (
                <div className="flex flex-col gap-md">
                  <div className="input-group">
                    <label className="input-label">Enter Mobile Number</label>
                    <div className="flex gap-xs items-center">
                      <span style={{ padding: '14px 0 14px 12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>+91</span>
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="98765 43210"
                                                value={phoneNumber}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setPhoneNumber(val);
                          if (val.length === 10) {
                            handleSendOtp(val);
                          }
                        }}
                        style={{ paddingLeft: '6px' }}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary w-full" onClick={() => handleSendOtp()}>
                    Get Verification OTP
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-md">
                  <div className="input-group">
                    <label className="input-label" style={{ textAlign: 'center' }}>Enter 4-Digit OTP Code</label>
                    <div className="otp-box">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          maxLength="1"
                          className="otp-digit"
                          value={digit}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                        />
                      ))}
                    </div>
                  </div>

                  {simulatedOtp && (
                    <div className="sim-info-box">
                      <span style={{ fontSize: '1.2rem' }}>💬</span>
                      <div>
                        <strong>Simulated SMS Code:</strong> {simulatedOtp}
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-secondary w-full"
                    onClick={() => { playSound('click'); setLoginStep('phone'); setOtpDigits(['', '', '', '']); }}
                  >
                    Change Phone Number
                  </button>
                </div>
              )}

              <div className="divider-container">or continue with</div>

              <div className="social-login-grid">
                <button className="social-btn" onClick={() => handleSocialLogin('Google')}>
                  <span>🌐</span> Google
                </button>
                <button className="social-btn" onClick={() => handleSocialLogin('Apple')}>
                  <span>🍎</span> Apple
                </button>
              </div>
            </div>
          )}

          {selectedRole === 'Driver' && (
            <form onSubmit={handleDriverLogin} className="flex flex-col gap-md animate-slide-up">
              <div className="input-group">
                <label className="input-label">Conductor Badge ID</label>
                <input
                  type="text"
                  placeholder="e.g. DRV-9932"
                  value={driverBadge}
                  onChange={e => setDriverBadge(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Verify Badge
              </button>
              <div className="sim-info-box">
                <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                <div>
                  Enter badge ID (e.g. <strong>DRV-9932</strong>) to start a shift manifest simulation.
                </div>
              </div>
            </form>
          )}

          {selectedRole === 'Admin' && (
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-md animate-slide-up">
              <div className="input-group">
                <label className="input-label">System Admin Passkey</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPasskey}
                  onChange={e => setAdminPasskey(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Access CommandCenter
              </button>
              <div className="sim-info-box">
                <span style={{ fontSize: '1.2rem' }}>🔑</span>
                <div>
                  Enter passcode: <strong>KSRTC-ADMIN-2026</strong>
                </div>
              </div>
            </form>
          )}

                    <div style={{ marginTop: 20, borderTop: '1px dashed var(--glass-border)', paddingTop: 16, textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Presentation / Demo Bypass
            </span>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
              <span
                className="dev-bypass-link"
                style={{ marginTop: 0 }}
                onClick={() => {
                  playSound('chime');
                  setCurrentUser('Customer');
                  addLog('AUTH: Demo bypassed to Customer dashboard.');
                  setToast({ title: 'Welcome Back', message: 'Logged in as Customer.' });
                }}
              >
                Customer
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
              <span
                className="dev-bypass-link"
                style={{ marginTop: 0 }}
                onClick={() => {
                  playSound('chime');
                  setCurrentUser('Driver');
                  addLog('AUTH: Demo bypassed to Conductor dashboard.');
                  setToast({ title: 'Shift Started', message: 'Logged in as Conductor.' });
                }}
              >
                Conductor
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
              <span
                className="dev-bypass-link"
                style={{ marginTop: 0 }}
                onClick={() => {
                  playSound('chime');
                  setCurrentUser('Admin');
                  addLog('AUTH: Demo bypassed to Admin dashboard.');
                  setToast({ title: 'Command Center Active', message: 'Logged in as Admin.' });
                }}
              >
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                    onClick={() => { playSound('click'); setCurrentUser(null); setMenuOpen(false); }}
                    className="btn btn-secondary w-full flex items-center justify-center gap-xs" style={{ padding: '8px 12px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)', color: 'var(--error)', cursor: 'pointer', borderRadius: '6px' }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
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

    const [activeStopTooltip, setActiveStopTooltip] = useState(null);
    const [activeMode, setActiveMode] = useState('transit'); // drive, ride, transit, walk
    const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
    const [originText, setOriginText] = useState(parcel.origin);
    const [destText, setDestText] = useState(parcel.destination);

    const handleSwap = () => {
      playSound('click');
      const temp = originText;
      setOriginText(destText);
      setDestText(temp);
    };

    // Route options
    const routeOptions = [
      {
        id: 0,
        title: "Available Route 1",
        time: "2:56 PM - 4:31 PM",
        duration: bus ? bus.eta : "1 hr 34 min",
        distance: "1.5 km walk • Transit",
        badges: [{ label: "Violet Line", color: "violet" }, { label: "Red Line", color: "red" }],
        segments: []
      },
      {
        id: 1,
        title: "Alt Schedule 2",
        time: "3:00 PM - 4:52 PM",
        duration: "1 hr 52 min",
        distance: "1.0 km walk • Transit",
        badges: [{ label: "Green Line", color: "green" }, { label: "Grey Line", color: "grey" }],
        segments: []
      },
      {
        id: 2,
        title: "Scenic Route 3",
        time: "3:15 PM - 5:25 PM",
        duration: "2 hr 10 min",
        distance: "2.3 km walk • Slow Transit",
        badges: [{ label: "Grey Line", color: "grey" }],
        segments: []
      }
    ];

    const currentRoute = routeOptions[selectedRouteIdx] || routeOptions[0];

    return (
      <div className="card" style={{ padding: 12, background: 'var(--input-bg)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        
        {/* Mode Selector Row */}
        <div className="gps-mode-bar" style={{ borderRadius: '8px 8px 0 0', margin: '-12px -12px 10px -12px' }}>
          {[
            { id: 'drive', label: 'Drive', icon: '🚗' },
            { id: 'ride', label: 'Ride', icon: '🏍️' },
            { id: 'transit', label: 'Transit', icon: '🚌' },
            { id: 'walk', label: 'Walk', icon: '🚶' }
          ].map(mode => (
            <button 
              key={mode.id}
              onClick={() => { playSound('click'); setActiveMode(mode.id); }}
              className={`gps-mode-btn ${activeMode === mode.id ? 'active' : ''}`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Origin & Destination Search bar */}
        <div className="gps-search-card">
          <div className="flex items-center justify-between gap-sm">
            <div className="flex-1 flex flex-col gap-xs">
              <div className="gps-search-input-container">
                <div className="gps-search-dot origin" />
                <input 
                  type="text" 
                  value={originText} 
                  onChange={e => setOriginText(e.target.value)} 
                  style={{ background: 'transparent', border: 'none', padding: 2, fontSize: '0.75rem', color: 'var(--text-main)', height: 'auto', outline: 'none' }}
                />
              </div>
              <div className="gps-search-input-container">
                <div className="gps-search-dot dest" />
                <input 
                  type="text" 
                  value={destText} 
                  onChange={e => setDestText(e.target.value)} 
                  style={{ background: 'transparent', border: 'none', padding: 2, fontSize: '0.75rem', color: 'var(--text-main)', height: 'auto', outline: 'none' }}
                />
              </div>
            </div>
            <button 
              onClick={handleSwap}
              style={{ background: 'var(--surface-secondary)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              ⇄
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Live GPS Path Alignment</h4>
          <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }} className="flex items-center gap-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {bus ? `${bus.speed} km/h` : 'Awaiting dispatch'}
          </span>
        </div>

        {/* Real GPS Map Leaflet container */}
        <div style={{ marginBottom: 10 }}>
          <CustomerLeafletMap 
            bus={bus} 
            routeStops={getRealRouteStops(bus ? bus.route : (parcel.destination.includes('Mysuru') ? 'Bengaluru - Mysuru' : parcel.destination.includes('Mangaluru') ? 'Bengaluru - Mangaluru' : 'Bengaluru - Hubli'))} 
          />
        </div>

        {/* Live diagnostics banner */}
        {bus && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 6px 0 6px', fontSize: '0.68rem', fontFamily: 'monospace', color: bus.status === 'Warning' ? 'var(--error)' : 'var(--success)' }}>
            <span>TELEMETRY: S:{bus.speed}km/h | T:{bus.temp}°C | F:{bus.fuel}%</span>
            <span>GPS: {getRealRouteCoordinates(bus.route, bus.progress).lat.toFixed(4)}°N, {getRealRouteCoordinates(bus.route, bus.progress).lng.toFixed(4)}°E</span>
          </div>
        )}

        {/* Available Routes Selector - Horizontal Cards */}
        <div className="gps-route-options-list">
          {routeOptions.map(opt => (
            <div 
              key={opt.id}
              onClick={() => { playSound('click'); setSelectedRouteIdx(opt.id); }}
              className={`gps-route-card ${selectedRouteIdx === opt.id ? 'active' : ''}`}
            >
              <div className="flex justify-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-main)' }}>{opt.title}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--primary-light)', fontWeight: 800 }}>{opt.duration}</span>
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6 }}>{opt.time}</p>
              <div className="flex">
                {opt.badges.map((b, i) => (
                  <span key={i} className={`gps-line-badge ${b.color}`}>{b.label}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 3. Upgraded VeloBot Chat Component
  const VeloBotChat = ({ parcel }) => {
    const [messages, setMessages] = useState([
      { sender: 'bot', text: 'Namaskara! I am VeloBot, your KSRTC Logistics assistant. How can I assist you with parcel ' + parcel.id + '?' }
    ]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isBotTyping]);

    const handleSend = (textToSend) => {
      const msgText = textToSend || input;
      const sanitized = sanitizeInput(msgText, 150);
      if (!sanitized) return;

      playSound('click');
      const updated = [...messages, { sender: 'user', text: sanitized }];
      setMessages(updated);
      setInput('');
      setIsBotTyping(true);

      // Dynamic AI Response based on state
      setTimeout(() => {
        setIsBotTyping(false);
        playSound('chime');
        let reply = "I'm checking the logs. Your cargo is currently stored safely in transit.";
        const busObj = buses.find(b => b.id === parcel.bus);
        const lockerObj = lockers.find(l => l.parcelId === parcel.id);

        const lower = msgText.toLowerCase();
        if (lower.includes('status') || lower.includes('where')) {
          reply = `Parcel ${parcel.id} is currently ${parcel.status.replace('_', ' ')} on Bus ${parcel.bus || 'Unassigned'}. Route: ${busObj ? busObj.route : 'Pending'}.`;
        } else if (lower.includes('eta') || lower.includes('arrive') || lower.includes('time')) {
          reply = busObj 
            ? `Bus ${busObj.id} is currently near ${busObj.location}. Estimated arrival is ${busObj.eta} (Progress: ${busObj.progress}%).`
            : `Conductor allocation is pending. We will notify you once departure commences.`;
        } else if (lower.includes('conductor') || lower.includes('driver') || lower.includes('contact')) {
          reply = `Conductor Manjunath K. is operating the bus. For secure handovers, please keep your OTP (${parcel.deliveryOtp}) ready.`;
        } else if (lower.includes('otp') || lower.includes('code') || lower.includes('pin')) {
          reply = `Your secure delivery confirmation passcode is ${parcel.deliveryOtp}. Present this code to verify delivery.`;
        } else if (lower.includes('policy') || lower.includes('cancel')) {
          reply = `Cancellations can be made up to 20 minutes before arrival. Standard terms limit recovery liability unless insured.`;
        } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('fog')) {
          reply = `The current simulated weather environment is ${weather.toUpperCase()}. Bus speeds are dynamically reduced by weather speed modifiers to ensure safe transit.`;
        } else if (lower.includes('locker') || lower.includes('depot') || lower.includes('box')) {
          if (lockerObj) {
            reply = `Your parcel is securely stored in Depot Locker ${lockerObj.id} at ${lockerObj.location.split(',')[0]}. Use verification PIN ${lockerObj.pin} to open it.`;
          } else {
            reply = `Upon arrival at the destination stand, your parcel will be assigned to a secure KSRTC depot locker box. A secure OTP will be issued automatically.`;
          }
        }

        setMessages([...updated, { sender: 'bot', text: reply }]);
      }, 1200);
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
                border: m.sender === 'bot' ? '1px solid var(--glass-border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>{m.text}</span>
              {m.sender === 'bot' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); playSound('click'); speakText(m.text, appLanguage); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}
                  title="Speak reply"
                >
                  🔊
                </button>
              )}
            </div>
          ))}
          {isBotTyping && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--input-bg)', padding: '10px 14px', borderRadius: '12px', display: 'flex', gap: 4, alignItems: 'center' }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

                {/* Quick Suggest Chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
          {['Check ETA', 'Locker PIN', 'Conductor Details', 'Weather Condition'].map(chip => (
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

    const [showCoinsShop, setShowCoinsShop] = useState(false);
    const [showFAQ, setShowFAQ] = useState(false);
    const [lockerIdClaimInput, setLockerIdClaimInput] = useState('');
    const [lockerPinInput, setLockerPinInput] = useState('');

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

         {/* Weather & Locker triggers Row */}
         <div className="flex gap-md" style={{ marginBottom: 12 }}>
           <div className="card flex-1 flex items-center gap-sm" style={{ padding: '12px', background: 'var(--input-bg)' }}>
             {weather === 'Clear' && <Sun color="var(--accent)" size={22} />}
             {weather === 'Rainy' && <CloudRain color="var(--primary-light)" size={22} className="animate-pulse" />}
             {weather === 'Foggy' && <CloudFog color="var(--text-muted)" size={22} />}
             <div>
               <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800 }}>Weather: {weather}</h4>
               <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                 {weather === 'Clear' ? 'Schedules active' : weather === 'Rainy' ? '30% Transit Delay' : '50% Visibility Delay'}
               </span>
             </div>
           </div>

           <button className="btn btn-secondary flex-1" style={{ padding: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onClick={() => setActiveLockerClaim('select_locker')}>
             <Lock size={14} color="var(--accent)" /> Locker Pickup
           </button>
         </div>

         {/* Streaks, Coins and FAQ widgets */}
         <div className="flex gap-md" style={{ marginBottom: 16 }}>
           {/* Streak Widget */}
           <div className="card flex-1 flex flex-col justify-center items-center" style={{ border: '1.5px solid var(--accent)', background: 'var(--accent-glow)', cursor: 'pointer', padding: '10px' }} onClick={() => { playSound('click'); setShowStreak(true); }}>
              <Star color="var(--accent)" fill="var(--accent)" size={16} style={{ marginBottom: 4 }} />
              <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--accent)', fontSize: '0.72rem' }}>{t.streakTitle}</h4>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Claim rewards</span>
           </div>

           {/* RouteCoins Shop Widget */}
           <div className="card flex-1 flex flex-col justify-center items-center" style={{ padding: '10px', border: '1px solid var(--glass-border)', cursor: 'pointer' }} onClick={() => { playSound('click'); setShowCoinsShop(true); }}>
              <Coins color="var(--accent)" size={16} style={{ marginBottom: 4 }} />
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-main)' }}>Shop</h4>
              <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 700 }}>₹{routeCoins} Coins</span>
           </div>

           {/* Help Desk Widget */}
           <div className="card flex-1 flex flex-col justify-center items-center" style={{ padding: '10px', cursor: 'pointer' }} onClick={() => { playSound('click'); setShowFAQ(true); }}>
              <HelpCircle color="var(--primary-light)" size={16} style={{ marginBottom: 4 }} />
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.72rem' }}>FAQ Help</h4>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Depot rules</span>
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
                     {(() => {
                       const lockerObj = lockers.find(l => l.parcelId === p.id && l.status === 'Occupied');
                       if (lockerObj) {
                         return (
                           <button 
                             className="btn btn-secondary w-full" 
                             style={{ marginTop: 8, padding: '6px 10px', fontSize: '0.72rem', background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)', fontWeight: 800, height: 'auto' }} 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               playSound('click'); 
                               setLockerIdClaimInput(lockerObj.id); 
                               setLockerPinInput('');
                               setActiveLockerClaim('verify_pin'); 
                             }}
                           >
                             🔑 Open Smart Locker {lockerObj.id}
                           </button>
                         );
                       }
                       return null;
                     })()}
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
                   <button className="btn btn-primary w-full" onClick={() => { 
                      setShowStreak(false); 
                      setRouteCoins(c => c + 50);
                      setWalletBalance(w => w + 50); 
                      addLog('REWARD: Claimed 50 RouteCoins and Rs.50 KSRTC Wallet balance!'); 
                      triggerConfettiEffect();
                    }} style={{ background: 'var(--accent)' }}>Claim 50 Coins & Rs.50 Cash</button>
                   <button className="btn w-full" onClick={() => setShowStreak(false)} style={{ background: 'transparent', color: 'var(--text-muted)', marginTop: 8 }}>Close</button>
                </div>
             </motion.div>
            )}

                        {/* RouteCoins Shop Modal */}
            {showCoinsShop && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
                <div className="card w-full" style={{ maxWidth: 360, margin: '0 auto' }}>
                  <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 10, marginBottom: 12 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}><Coins color="var(--accent)"/> RouteCoins Shop</h3>
                    <button onClick={() => setShowCoinsShop(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
                  </div>
                  
                  {/* Rotating gold coin graphic */}
                  <div className="gold-coin-container">
                    <div className="gold-coin">🪙</div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center' }}>Your Coins: <strong style={{ color: 'var(--accent)' }}>₹{routeCoins} RouteCoins</strong></p>
                  
                  <div className="flex flex-col gap-sm" style={{ maxHeight: 250, overflowY: 'auto' }}>
                    <div className="flex justify-between items-center card" style={{ padding: 10, background: 'var(--input-bg)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.8rem' }}>10% Discount Code</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Get coupon code 'SAVE10'</p>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} disabled={routeCoins < 50} onClick={() => {
                        setRouteCoins(c => c - 50);
                        setCoupons(prev => [...prev, 'SAVE10']);
                        addLog('LOYALTY: Purchased 10% Fare Discount (SAVE10) for 50 RouteCoins.');
                        triggerConfettiEffect();
                      }}>Redeem (50c)</button>
                    </div>

                    <div className="flex justify-between items-center card" style={{ padding: 10, background: 'var(--input-bg)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.8rem' }}>₹50 KSRTC Cashback</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Add ₹50 to your active wallet</p>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} disabled={routeCoins < 60} onClick={() => {
                        setRouteCoins(c => c - 60);
                        setWalletBalance(w => w + 50);
                        setTransactions(prev => [{ id: 'TXN-CASHBACK', type: 'Deposit', amount: 50, date: 'Today, Just Now', desc: 'RouteCoins Cashback Reward', status: 'Success' }, ...prev]);
                        addLog('LOYALTY: Redeemed 60 RouteCoins for ₹50 wallet cashback.');
                        triggerConfettiEffect();
                      }}>Redeem (60c)</button>
                    </div>

                    <div className="flex justify-between items-center card" style={{ padding: 10, background: 'var(--input-bg)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.8rem' }}>KSRTC Coffee Coupon</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Depot Coffee voucher 'COFFEE50'</p>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} disabled={routeCoins < 30} onClick={() => {
                        setRouteCoins(c => c - 30);
                        setCoupons(prev => [...prev, 'COFFEE50']);
                        addLog('LOYALTY: Purchased Coffee Voucher (COFFEE50) for 30 RouteCoins.');
                        triggerConfettiEffect();
                      }}>Redeem (30c)</button>
                    </div>

                    <div className="flex justify-between items-center card" style={{ padding: 10, background: 'var(--input-bg)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.8rem' }}>VIP Loyalty Badge</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Show VIP star next to name</p>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} disabled={routeCoins < 100 || userBadge === 'VIP'} onClick={() => {
                        setRouteCoins(c => c - 100);
                        setUserBadge('VIP');
                        addLog('LOYALTY: Purchased VIP Loyalty Badge for 100 RouteCoins.');
                        triggerConfettiEffect();
                      }}>{userBadge === 'VIP' ? 'Owned' : 'Redeem (100c)'}</button>
                    </div>

                    <div className="flex justify-between items-center card" style={{ padding: 10, background: 'var(--input-bg)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.8rem' }}>Cyberpunk Purple Theme</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Unlock purple styling</p>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} disabled={routeCoins < 120 || unlockedThemes.includes('cyberpunk')} onClick={() => {
                        setRouteCoins(c => c - 120);
                        setUnlockedThemes(prev => [...prev, 'cyberpunk']);
                        addLog('LOYALTY: Unlocked Cyberpunk Purple Theme for 120 RouteCoins.');
                        triggerConfettiEffect();
                      }}>{unlockedThemes.includes('cyberpunk') ? 'Unlocked' : 'Redeem (120c)'}</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KSRTC FAQ Modal */}
            {showFAQ && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
                <div className="card w-full" style={{ maxWidth: 360, margin: '0 auto', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
                  <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 10, marginBottom: 12 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}><HelpCircle /> FAQ Help Desk</h3>
                    <button onClick={() => setShowFAQ(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }} className="flex flex-col gap-sm">
                    {[
                      { q: "What is KSRTC Smart Logistics?", a: "It is an innovative network that uses existing KSRTC scheduled bus trips to dispatch priority courier packages between major depot terminals." },
                      { q: "How does the Locker system work?", a: "Once a bus arrives, packages are placed in secure depot lockers. A 6-digit locker PIN is sent to the recipient to retrieve the cargo." },
                      { q: "What is the compensation limit?", a: "Standard parcels are covered up to ₹1,000 in liability. Purchasing Cargo Liability Insurance (₹50) upgrades coverage up to ₹10,000." },
                      { q: "How can I check conductor details?", a: "Check the active tracking page or ask VeloBot for driver/conductor assignment info." }
                    ].map((faq, i) => (
                      <div key={i} className="card" style={{ padding: 10, background: 'var(--input-bg)' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 700 }}>{faq.q}</h4>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Locker claims modal */}
            {activeLockerClaim && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
                <div className="card w-full" style={{ maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
                  <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 10, marginBottom: 12 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}><Lock color="var(--accent)"/> Depot Locker Access</h3>
                    <button onClick={() => { setActiveLockerClaim(null); setLockerPinInput(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
                  </div>
                  
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>Select your locker box from the grid below, then enter the 6-digit PIN.</p>

                  {/* Visual Interactive Locker Box Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                    {lockers.map(l => {
                      const isSelected = lockerIdClaimInput === l.id;
                      const isOccupied = l.status === 'Occupied';
                      return (
                        <div 
                          key={l.id} 
                          onClick={() => {
                            if (isOccupied) {
                              playSound('click');
                              setLockerIdClaimInput(l.id);
                              setLockerPinInput('');
                            } else {
                              playSound('warning');
                              alert('This locker box is vacant.');
                            }
                          }}
                          style={{
                            padding: '12px 8px',
                            background: isSelected ? 'var(--primary-glow)' : 'var(--input-bg)',
                            border: isSelected 
                              ? '1.5px solid var(--primary)' 
                              : isOccupied 
                              ? '1px solid var(--accent-glow)' 
                              : '1px solid var(--glass-border)',
                            borderRadius: 10,
                            cursor: isOccupied ? 'pointer' : 'not-allowed',
                            opacity: isOccupied ? 1 : 0.45,
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            textAlign: 'center'
                          }}
                        >
                          {/* LED indicator */}
                          <div className={isOccupied ? "led-pulse-active" : ""} style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: isOccupied ? 'var(--accent)' : 'var(--success)'
                          }} />
                          <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>📦</div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>{l.id}</div>
                          <div style={{ fontSize: '0.55rem', opacity: 0.8, color: isOccupied ? 'var(--accent)' : 'var(--success)' }}>
                            {isOccupied ? 'Locked' : 'Vacant'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label className="input-label">Locker Secure PIN: {lockerPinInput || '------'}</label>
                    <div className="locker-keypad">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Clear', 0, 'Enter'].map(k => (
                        <button key={k} className="locker-key" onClick={() => {
                          playSound('click');
                          if (k === 'Clear') {
                            setLockerPinInput('');
                          } else if (k === 'Enter') {
                            const targetLocker = lockers.find(l => l.id === lockerIdClaimInput);
                            if (!targetLocker) {
                              alert('Please select a locker box first.');
                              return;
                            }
                            if (targetLocker.status === 'Empty') {
                              alert('Locker is currently empty.');
                              return;
                            }
                            if (targetLocker.pin === lockerPinInput) {
                              playSound('chime');
                              const text = appLanguage === 'Kannada'
                                ? "ಲಾಕರ್ ಅನ್‌ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾರ್ಸೆಲ್ ಪಡೆಯಿರಿ."
                                : appLanguage === 'Hindi'
                                ? "लॉकर अनलॉक कर दिया गया है। कृपया अपना पार्सल प्राप्त करें।"
                                : "Locker unlocked. Please retrieve your cargo.";
                              speakText(text, appLanguage);
                              
                              // Mark parcel as delivered
                              setParcels(prev => prev.map(p => p.id === targetLocker.parcelId ? {
                                ...p,
                                status: 'Delivered',
                                history: [...p.history, { time: 'Now', msg: `Retrieved by customer from secure depot Locker ${targetLocker.id}` }]
                              } : p));
                              
                              // Empty locker
                              setLockers(prev => prev.map(l => l.id === targetLocker.id ? { ...l, status: 'Empty', parcelId: null } : l));
                              
                              alert(`Success! Locker ${targetLocker.id} opened. Package retrieved.`);
                              setActiveLockerClaim(null);
                              setLockerPinInput('');
                            } else {
                              playSound('beep');
                              alert('Incorrect locker PIN. Access denied.');
                            }
                          } else {
                            if (lockerPinInput.length < 6) {
                              setLockerPinInput(prev => prev + k);
                            }
                          }
                        }}>{k}</button>
                      ))}
                    </div>
                  </div>
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
                     if (isNaN(val) || val <= 0) {
                       playSound('beep');
                       alert("Please enter a valid positive deposit amount.");
                       return;
                     }
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

    // Feature States:
    const [parcelCount, setParcelCount] = useState(1);
    const [cargoClass, setCargoClass] = useState('Standard Box');
    const [saveToContacts, setSaveToContacts] = useState(false);
    const [activeCoupon, setActiveCoupon] = useState('');

    const cargoMultipliers = {
      'Document': 0.6,
      'Standard Box': 1.0,
      'Large Crate': 1.8,
      'Heavy Sack': 2.5
    };

    // Filter available buses departing from Bangalore for the route selection
    const availableBuses = buses.filter(b => b.route.includes(searchStop.replace(' KSRTC Bus Stand', '').replace(' Central Bus Stand', '').replace(' Bus Depot', '')));

    const calculateTotal = () => {
      const baseFare = PRICING_TIERS.busType[pricing.tier];
      const weightSurcharge = PRICING_TIERS.weight[pricing.weight].rate;
      const addOns = (pricing.fragile ? 30 : 0) + (pricing.insurance ? 50 : 0);
      
      const cargoMult = cargoMultipliers[cargoClass] || 1.0;
      let subtotal = (baseFare + weightSurcharge + addOns) * cargoMult;
      subtotal = subtotal * parcelCount;

      // Weather surge: ₹35
      const weatherSurge = (weather === 'Rainy' || weather === 'Foggy') ? 35 : 0;
      // Traffic surge: ₹25
      const trafficSurge = (buses.some(b => b.status === 'Delayed')) ? 25 : 0;
      const totalSurge = weatherSurge + trafficSurge;
      subtotal += totalSurge;

      // Bulk discount: 10% off subtotal if parcelCount > 1
      const bulkDiscount = parcelCount > 1 ? Math.round(subtotal * 0.1) : 0;
      
      // Coupon discount: 10% off subtotal
      const couponDiscount = (activeCoupon === 'SAVE10' && coupons.includes('SAVE10')) ? Math.round(subtotal * 0.1) : 0;
      
      const finalSubtotal = subtotal - bulkDiscount - couponDiscount;
      const gst = Math.round(finalSubtotal * 0.18);
      
      return { 
        baseFare, 
        weightSurcharge, 
        addOns, 
        subtotal: finalSubtotal, 
        gst, 
        total: Math.max(0, finalSubtotal + gst),
        weatherSurge,
        trafficSurge,
        bulkDiscount,
        couponDiscount
      };
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

      // Address Book Persistence: save receiver if checkbox checked
      if (saveToContacts) {
        setSavedContacts(prev => {
          if (prev.some(c => c.phone === details.rPhone)) return prev;
          return [...prev, { name: details.rName, phone: details.rPhone, kiosk: searchStop }];
        });
        addLog(`CONTACTS: Saved ${details.rName} to address book.`);
      }

      setBookingRef(ref);
      setShowWaybill(true);
    };

    const confirmBookingAllocation = (assignedBusId) => {
      const { total } = calculateTotal();
      
      const newParcel = {
        id: bookingRef,
        type: 'Sending',
        status: 'Pending',
        bus: assignedBusId,
        pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        origin: sanitizeInput(details.origin, 100),
        destination: sanitizeInput(searchStop, 100),
        senderName: sanitizeInput(details.sName, 50),
        senderPhone: sanitizeInput(details.sPhone, 20),
        receiverName: sanitizeInput(details.rName, 50),
        receiverPhone: sanitizeInput(details.rPhone, 20),
        totalFare: total,
        insurance: pricing.insurance,
        fragile: pricing.fragile,
        rating: 0,
        tier: pricing.tier,
        cargoClass,
        parcelCount,
        history: [
          { time: 'Now', msg: `Cargo booked. Assigned to conductor on Bus ${assignedBusId}.` }
        ]
      };

      setParcels(prev => [newParcel, ...prev]);
      addLog(`LOGISTICS: Registered package ${bookingRef} (${parcelCount} items, ${cargoClass}) on Bus ${assignedBusId}.`);
      
      setShowWaybill(false);
      setSelectedInvoice(newParcel);
      setActiveTab('history');
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

            {/* Bulk / Multi-Parcel Selector */}
            <div className="input-group">
              <label className="input-label">Number of Parcels in Shipment</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => { playSound('click'); setParcelCount(count); }}
                    className="btn btn-secondary flex-1"
                    style={{
                      border: parcelCount === count ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                      background: parcelCount === count ? 'var(--primary-glow)' : 'var(--input-bg)'
                    }}
                  >
                    {count} {count > 1 ? 'Parcels (10% off)' : 'Parcel'}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" disabled={!searchStop} onClick={() => setStep(2)}>Add Contact Details <ChevronRight size={16} /></button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-md animate-fade-in">
            <div className="flex justify-between items-center">
              <h4 style={{ fontWeight: 800 }}>Sender & Receiver Contacts</h4>
              {/* Address Book Dropdown */}
              <div style={{ width: 150 }}>
                <select 
                  onChange={e => {
                    const c = savedContacts.find(x => x.phone === e.target.value);
                    if (c) {
                      playSound('click');
                      setDetails(prev => ({ ...prev, rName: c.name, rPhone: c.phone }));
                    }
                  }}
                  style={{ padding: '6px 10px', fontSize: '0.75rem', height: 'auto' }}
                >
                  <option value="">Saved Contacts</option>
                  {savedContacts.map(c => (
                    <option key={c.phone} value={c.phone}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

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

              {/* Save contact checkbox */}
              <div className="flex justify-between items-center" style={{ marginTop: 4 }}>
                <label htmlFor="saveContactCheck" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Save receiver to Address Book</label>
                <input 
                  type="checkbox" 
                  id="saveContactCheck" 
                  checked={saveToContacts}
                  onChange={e => setSaveToContacts(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                />
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
            <h4 style={{ fontWeight: 800 }}>Delivery Speed & Cargo Classification</h4>
            
            {/* Cargo Category Dropdown Selector */}
            <div className="input-group">
              <label className="input-label">Cargo Package Type</label>
              <select value={cargoClass} onChange={e => { playSound('click'); setCargoClass(e.target.value); }}>
                <option value="Document">📄 Document/Letter (x0.6 rate)</option>
                <option value="Standard Box">📦 Standard Box (x1.0 rate)</option>
                <option value="Large Crate">🚚 Large Crate (x1.8 rate)</option>
                <option value="Heavy Sack">⚠️ Heavy Sack (x2.5 rate)</option>
              </select>
            </div>

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
                  <span style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: '1.1rem' }}>₹{Math.round(PRICING_TIERS.busType[tier] * (cargoMultipliers[cargoClass] || 1))}</span>
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
          const { 
            baseFare, 
            weightSurcharge, 
            addOns, 
            subtotal, 
            gst, 
            total,
            weatherSurge,
            trafficSurge,
            bulkDiscount,
            couponDiscount
          } = calculateTotal();
          
          const carbonOffsetSaved = (parcelCount * 0.35 + (PRICING_TIERS.weight[pricing.weight].rate * 0.005)).toFixed(2);

          return (
            <div className="flex flex-col gap-md animate-fade-in">
              <div className="card flex flex-col gap-sm" style={{ padding: 16 }}>
                <h4 style={{ fontWeight: 800, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6 }}>Bill Summary ({parcelCount}x {cargoClass})</h4>
                
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Base fare ({pricing.tier} Class)</span>
                  <span>₹{baseFare * parcelCount}</span>
                </div>
                
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Weight surcharge</span>
                  <span>₹{weightSurcharge * parcelCount}</span>
                </div>
                
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Cargo Multiplier ({cargoClass})</span>
                  <span>x{(cargoMultipliers[cargoClass] || 1).toFixed(1)}</span>
                </div>

                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Insurance & Fragile options</span>
                  <span>₹{addOns * parcelCount}</span>
                </div>

                {/* Surge Display */}
                {(weatherSurge > 0 || trafficSurge > 0) && (
                  <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                    <span>Environmental/Traffic Surge Surcharge</span>
                    <span>+₹{weatherSurge + trafficSurge}</span>
                  </div>
                )}

                {/* Discount Displays */}
                {bulkDiscount > 0 && (
                  <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                    <span>Bulk booking bundle discount (10%)</span>
                    <span>-₹{bulkDiscount}</span>
                  </div>
                )}
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                    <span>Redeemed Coupon discount (10%)</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Taxes (GST 18%)</span>
                  <span>₹{gst}</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
                
                {/* Coupon select/input */}
                {coupons.length > 0 && (
                  <div className="input-group" style={{ margin: '4px 0' }}>
                    <label className="input-label" style={{ fontSize: '0.65rem' }}>Select Unlocked Coupon Discount</label>
                    <select value={activeCoupon} onChange={e => setActiveCoupon(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.75rem', height: 'auto' }}>
                      <option value="">Apply coupon...</option>
                      {coupons.map((code, idx) => (
                        <option key={idx} value={code}>{code} (10% Off)</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <span style={{ fontWeight: 800 }}>Total Fare Payable:</span>
                  <span style={{ fontSize: '1.6rem', color: 'var(--primary-light)', fontWeight: 800 }}>₹{total}</span>
                </div>
              </div>

              {/* Carbon Offset Saving Banner */}
              <div className="card flex items-center gap-sm" style={{ padding: '10px 14px', border: '1.5px solid var(--success)', background: 'var(--success-glow)' }}>
                <Leaf size={20} color="var(--success)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 800 }}>ECO transit Saver</h4>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>You save **{carbonOffsetSaved} kg of CO2** by using existing public KSRTC bus route logistics instead of private courier vans.</p>
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
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const completedShipments = parcels;

    const printInvoice = (item) => {
      playSound('click');
      const printContent = `
        <html>
          <head>
            <title>RouteVelo Waybill - ${item.id}</title>
            <style>
              body {
                font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif;
                padding: 30px;
                background: #fff;
                color: #111827;
              }
              .invoice-card {
                max-width: 500px;
                margin: 0 auto;
                border: 2px dashed #dc2626;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #dc2626;
                padding-bottom: 12px;
                margin-bottom: 20px;
              }
              .header h2 {
                color: #dc2626;
                margin: 0;
                font-size: 22px;
                font-weight: 900;
                letter-spacing: 1px;
              }
              .header p {
                margin: 4px 0 0;
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .section-title {
                font-size: 11px;
                font-weight: 800;
                color: #dc2626;
                text-transform: uppercase;
                margin: 14px 0 6px;
                letter-spacing: 0.5px;
              }
              .row {
                display: flex;
                justify-content: space-between;
                font-size: 13px;
                margin: 6px 0;
              }
              .row span {
                color: #6b7280;
              }
              .row strong {
                color: #111827;
              }
              .divider {
                border-top: 1px dashed #e5e7eb;
                margin: 12px 0;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 16px;
                padding-top: 12px;
                border-top: 2px solid #dc2626;
              }
              .total-label {
                font-weight: 800;
                font-size: 15px;
              }
              .total-amount {
                font-size: 22px;
                font-weight: 800;
                color: #dc2626;
              }
              @media print {
                body { padding: 0; }
                .invoice-card { border: 2px dashed #000; box-shadow: none; }
                .header h2, .total-amount, .section-title { color: #000; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-card">
              <div class="header">
                <h2>🚌 KSRTC SMART LOGISTICS</h2>
                <p>Official Digital Log Waybill Ticket</p>
              </div>
              <div class="row">
                <span>Waybill ID:</span>
                <strong>${item.id}</strong>
              </div>
              <div class="row">
                <span>Conductor Bus:</span>
                <strong>${item.bus}</strong>
              </div>
              <div class="row">
                <span>From Station:</span>
                <strong>${item.origin}</strong>
              </div>
              <div class="row">
                <span>To Station:</span>
                <strong>${item.destination}</strong>
              </div>
              
              <div class="divider"></div>
              <div class="section-title">Contact Manifest</div>
              <div class="row">
                <span>Sender Details:</span>
                <strong>${item.senderName} (${item.senderPhone})</strong>
              </div>
              <div class="row">
                <span>Receiver Details:</span>
                <strong>${item.receiverName} (${item.receiverPhone})</strong>
              </div>
              
              <div class="divider"></div>
              <div class="section-title">Cargo Specifications</div>
              <div class="row">
                <span>Service Tier:</span>
                <strong>${item.tier || 'Express'} Class</strong>
              </div>
              <div class="row">
                <span>Class Type:</span>
                <strong>${item.parcelCount || 1}x ${item.cargoClass || 'Standard Box'}</strong>
              </div>
              <div class="row">
                <span>Special Handling:</span>
                <strong>
                  ${item.fragile ? 'Fragile 🛡️ ' : ''}
                  ${item.insurance ? 'Insured Cargo ✅ ' : ''}
                  ${!item.fragile && !item.insurance ? 'Standard' : ''}
                </strong>
              </div>
              
              <div class="divider"></div>
              <div class="section-title">Security OTP Codes</div>
              <div class="row">
                <span>Pickup OTP Code:</span>
                <strong>${item.pickupOtp || 'N/A'}</strong>
              </div>
              <div class="row">
                <span>Delivery Verification OTP:</span>
                <strong>${item.deliveryOtp}</strong>
              </div>
              
              <div class="divider"></div>
              <div class="row">
                <span>Carbon Saved Offset:</span>
                <strong>${((item.parcelCount || 1) * 0.35 + 0.1).toFixed(2)} kg CO2 Saved 🍃</strong>
              </div>
              
              <div class="divider"></div>
              <div class="section-title">Scan Dispatch Barcode</div>
              ${generateBarcodeHTMLString(item.id)}

              <div class="total-row">
                <span class="total-label">Total Fare Paid:</span>
                <span class="total-amount">₹${item.totalFare}</span>
              </div>

              <div style="text-align: center; font-size: 9px; color: #6b7280; margin-top: 20px; border-top: 1px dashed #e5e7eb; padding-top: 10px;">
                <p>Securely Dispatched via KSRTC RouteVelo Logistics Network</p>
                <p style="font-family: monospace; font-size: 8px; margin-top: 2px;">HASH-AUTH: RV-${item.id}-${item.deliveryOtp}-${item.totalFare}-SECURE</p>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank', 'width=600,height=700');
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    };

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
                    <span className={`badge ${item.status === 'Delivered' || item.status === 'Ad_Hoc_Dropped' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.6rem' }}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div className="card" style={{ borderRadius: '24px 24px 0 0', height: '90%', display: 'flex', flexDirection: 'column', margin: 0, border: '1px solid var(--glass-border)', background: 'var(--surface)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 800 }}>Digital Log Waybill</h3>
                  <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>&times;</button>
                </div>

                <div style={{ flex: 1, background: 'var(--input-bg)', borderRadius: 12, padding: 16, border: '1px dashed var(--glass-border)', position: 'relative', overflowY: 'auto' }}>
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
                      <span style={{ color: 'var(--text-muted)' }}>Sender:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.senderName} ({selectedInvoice.senderPhone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Receiver:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.receiverName} ({selectedInvoice.receiverPhone})</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Class & Package:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.tier || 'Express'} Class • {selectedInvoice.parcelCount || 1}x {selectedInvoice.cargoClass || 'Standard Box'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Special Handling:</span>
                      <span style={{ fontWeight: 700 }}>
                        {selectedInvoice.fragile ? 'Fragile 🛡️ ' : ''}
                        {selectedInvoice.insurance ? 'Insured ✅ ' : ''}
                        {!selectedInvoice.fragile && !selectedInvoice.insurance ? 'Standard' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Pickup / Delivery OTP:</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedInvoice.pickupOtp || 'N/A'} / {selectedInvoice.deliveryOtp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>CO2 Carbon Offset:</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {((selectedInvoice.parcelCount || 1) * 0.35 + 0.1).toFixed(2)} kg Saved 🍃
                      </span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
                    <div style={{ textAlign: 'center', margin: '8px 0' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>WAYBILL DISPATCH BARCODE</span>
                      {generateBarcodeHTML(selectedInvoice.id)}
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
                    <div className="flex justify-between items-end">
                      <span style={{ fontWeight: 800 }}>Amount Paid:</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>₹{selectedInvoice.totalFare}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-sm" style={{ marginTop: 16, marginBottom: 75 }}>
                  <button className="btn btn-primary flex-1" onClick={() => printInvoice(selectedInvoice)}>
                    🖨️ Print Waybill PDF
                  </button>
                  <button className="btn btn-secondary flex-1" onClick={() => setSelectedInvoice(null)}>Close</button>
                </div>
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
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.6rem', fontWeight: 800, position: 'relative' }}>
             {name.charAt(0)}
             {userBadge === 'VIP' && (
               <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--accent)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>
                 <Star size={12} fill="white" color="white" />
               </div>
             )}
          </div>
          <h3 style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {name}
            {userBadge === 'VIP' && <span style={{ fontSize: '0.65rem', background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: 4 }}>VIP</span>}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>RouteVelo Premium Member</p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
             <h4 style={{ fontWeight: 800 }}>Account Variables</h4>
             <button onClick={() => { 
               playSound('click'); 
               if (isEditing) {
                 setName(prev => sanitizeInput(prev, 50));
                 setEmail(prev => sanitizeInput(prev, 80));
                 setPhone(prev => sanitizeInput(prev, 20));
               }
               setIsEditing(!isEditing); 
             }} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
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
            
            <div className="input-group">
               <label className="input-label">UI Theme Accent</label>
               <select 
                 value={theme} 
                 onChange={e => {
                   const selected = e.target.value;
                   playSound('click');
                   if (unlockedThemes.includes(selected)) {
                     setTheme(selected);
                     addLog(`THEME: Applied theme ${selected}.`);
                   } else {
                     const prices = { sapphire: 60, emerald: 80, amber: 100, cyberpunk: 120 };
                     const price = prices[selected];
                     if (routeCoins >= price) {
                       if (window.confirm(`Unlock theme "${selected.toUpperCase()}" for ${price} RouteCoins?`)) {
                         playSound('chime');
                         setRouteCoins(c => c - price);
                         setUnlockedThemes(prev => [...prev, selected]);
                         setTheme(selected);
                         addLog(`THEME: Unlocked and applied ${selected} theme for ${price} RouteCoins.`);
                       }
                     } else {
                       alert(`Locked Theme! "${selected.toUpperCase()}" costs ${price} RouteCoins. You have ${routeCoins} RouteCoins.`);
                     }
                   }
                 }} 
                 style={{ padding: '10px 14px', background: 'var(--input-bg)', color: 'var(--text-main)' }}
               >
                 <option value="dark">Crimson Red (Default)</option>
                 <option value="light">Light Mode</option>
                 <option value="sapphire">Electric Sapphire {unlockedThemes.includes('sapphire') ? '' : '(🔒 60 coins)'}</option>
                 <option value="emerald">Emerald Sarige {unlockedThemes.includes('emerald') ? '' : '(🔒 80 coins)'}</option>
                 <option value="amber">Amber Dawn {unlockedThemes.includes('amber') ? '' : '(🔒 100 coins)'}</option>
                 <option value="cyberpunk">Cyberpunk Purple {unlockedThemes.includes('cyberpunk') ? '' : '(🔒 120 coins)'}</option>
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

    const [chatTarget, setChatTarget] = useState('bot'); // bot, conductor
    const [conductorMessages, setConductorMessages] = useState([
      { sender: 'conductor', text: `Hello! Conductor Manjunath here on Bus ${parcel.bus || 'AW-102'}. How can I assist you with your parcel dispatch?` }
    ]);
    const [conductorInput, setConductorInput] = useState('');
    const [isConductorTyping, setIsConductorTyping] = useState(false);

    // Accordion stops & trip details state
    const [stopsCollapsed, setStopsCollapsed] = useState(true);
    const [isTripDetailsOpen, setIsTripDetailsOpen] = useState(true);

    const stopsList = [];
    if (parcel.destination.includes('Mysuru') || (busObj && busObj.route.includes('Mysuru'))) {
      stopsList.push({ name: 'Bengaluru Majestic Boarding Platform', progressVal: 0, time: '3:18 PM' });
      stopsList.push({ name: 'Kengeri Transit Hub', progressVal: 25, time: '3:32 PM' });
      stopsList.push({ name: 'Mandya Stand Kiosk', progressVal: 65, time: '4:02 PM' });
      stopsList.push({ name: 'Mysuru Central Bus Stand', progressVal: 100, time: '4:31 PM' });
    } else if (parcel.destination.includes('Mangaluru') || (busObj && busObj.route.includes('Mangaluru'))) {
      stopsList.push({ name: 'Bengaluru Majestic Boarding Platform', progressVal: 0, time: '9:00 AM' });
      stopsList.push({ name: 'Hassan Depot Kiosk', progressVal: 50, time: '11:15 AM' });
      stopsList.push({ name: 'Mangaluru Depot', progressVal: 100, time: '1:30 PM' });
    } else if (parcel.destination.includes('Hubli') || (busObj && busObj.route.includes('Hubli'))) {
      stopsList.push({ name: 'Bengaluru Majestic Boarding Platform', progressVal: 0, time: '10:00 AM' });
      stopsList.push({ name: 'Tumakuru Stand Kiosk', progressVal: 30, time: '11:00 AM' });
      stopsList.push({ name: 'Davanagere Depot Kiosk', progressVal: 65, time: '12:30 PM' });
      stopsList.push({ name: 'Hubballi Stand', progressVal: 100, time: '1:45 PM' });
    } else {
      stopsList.push({ name: 'Origin KSRTC Stand', progressVal: 0, time: '12:00 PM' });
      stopsList.push({ name: 'Midpoint Kiosk Hub', progressVal: 50, time: '1:30 PM' });
      stopsList.push({ name: 'Destination KSRTC Stand', progressVal: 100, time: '3:00 PM' });
    }

    const handleConductorSend = () => {
      const sanitized = sanitizeInput(conductorInput, 150);
      if (!sanitized) return;
      playSound('click');
      const updated = [...conductorMessages, { sender: 'user', text: sanitized }];
      setConductorMessages(updated);
      setConductorInput('');
      setIsConductorTyping(true);

      setTimeout(() => {
        setIsConductorTyping(false);
        playSound('chime');
        let response = `Understood. Stacking your parcel securely. We are currently near ${busObj ? busObj.location : "transit depot"}.`;
        const lower = conductorInput.toLowerCase();
        if (lower.includes('where') || lower.includes('status') || lower.includes('position')) {
          response = `We are navigating near ${busObj ? busObj.location : "transit station"}. Current weather condition is ${weather}.`;
        } else if (lower.includes('delay') || lower.includes('late') || lower.includes('eta') || lower.includes('time')) {
          response = `Estimated arrival is ${busObj ? busObj.eta : "uncertain"}. Visibility condition is ${weather}.`;
        } else if (lower.includes('hello') || lower.includes('hi')) {
          response = `Namaskara! Please keep your secure delivery passcode ${parcel.deliveryOtp} ready when we arrive.`;
        }
        setConductorMessages(prev => [...prev, { sender: 'conductor', text: response }]);
      }, 1500);
    };

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

          {/* Insurance claim triggers */}
          {parcel.insurance && busObj && (busObj.status === 'Warning' || busObj.status === 'Delayed' || busObj.status === 'Warning (Backup)') && parcel.status !== 'Delivered' && (
            <div className="card flex flex-col gap-sm animate-fade-in" style={{ padding: 14, border: '1.5px solid var(--error)', background: 'var(--error-glow)' }}>
              <div className="flex items-center gap-xs">
                <ShieldAlert color="var(--error)" size={18} />
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800 }}>Cargo Insurance Claim Eligible</h4>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Telemetry alert '{busObj.status}' detected on assigned transit. Since you purchased Cargo Liability Insurance, you can file an instant claim for compensation.</p>
              <button 
                className="btn btn-primary w-full" 
                style={{ padding: '8px 12px', fontSize: '0.72rem', background: 'var(--error)', border: 'none', boxShadow: 'none' }}
                onClick={() => {
                  playSound('chime');
                  setWalletBalance(w => w + 150);
                  setTransactions(prev => [{ id: 'TXN-' + Math.floor(100+Math.random()*900), type: 'Claim Refund', amount: 150, date: 'Just now', desc: `Claim for ${parcel.id}`, status: 'Success' }, ...prev]);
                  
                  // Disable further claims
                  setParcels(prev => prev.map(p => p.id === parcel.id ? { ...p, insurance: false } : p));
                  addLog(`FINANCIAL: Processed ₹150 cargo delay claim for parcel ${parcel.id}.`);
                  alert('Insurance claim processed! ₹150 has been credited to your wallet.');
                }}
              >
                File Delay Claim (Get ₹150 Refund)
              </button>
            </div>
          )}

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

          {/* Tabbed chatbot and conductor chat */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: 12 }}>
              <button 
                className="flex-1" 
                style={{ padding: '8px 0', background: chatTarget === 'bot' ? 'var(--primary-glow)' : 'transparent', border: 'none', color: chatTarget === 'bot' ? 'var(--primary-light)' : 'var(--text-muted)', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', borderRadius: '6px 6px 0 0' }}
                onClick={() => setChatTarget('bot')}
              >
                VeloBot Support
              </button>
              <button 
                className="flex-1" 
                style={{ padding: '8px 0', background: chatTarget === 'conductor' ? 'var(--primary-glow)' : 'transparent', border: 'none', color: chatTarget === 'conductor' ? 'var(--primary-light)' : 'var(--text-muted)', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', borderRadius: '6px 6px 0 0' }}
                onClick={() => setChatTarget('conductor')}
              >
                Conductor Direct
              </button>
            </div>

            {chatTarget === 'bot' ? (
              <VeloBotChat parcel={parcel} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: 320 }}>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4, marginBottom: 12 }}>
                  {conductorMessages.map((m, idx) => (
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
                        border: m.sender === 'conductor' ? '1px solid var(--glass-border)' : 'none'
                      }}
                    >
                      {m.text}
                    </div>
                  ))}
                  {isConductorTyping && (
                    <div style={{ alignSelf: 'flex-start', background: 'var(--input-bg)', padding: '10px 14px', borderRadius: '12px', display: 'flex', gap: 4, alignItems: 'center' }}>
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  )}
                </div>

                <div className="flex gap-sm">
                  <input 
                    type="text" 
                    placeholder="Message Conductor..." 
                    value={conductorInput}
                    onChange={e => setConductorInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConductorSend()}
                    style={{ padding: '8px 12px', borderRadius: 20, fontSize: '0.8rem' }}
                  />
                  <button onClick={handleConductorSend} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 20, fontSize: '0.8rem' }}>Send</button>
                </div>
              </div>
            )}
          </div>

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
                      setParcels(prev => prev.map(p => p.id === parcel.id ? { ...p, rating: star } : p));
                      addLog(`FEEDBACK: Rated conductor for parcel ${parcel.id} as ${star} Stars.`);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trip Details Accordion Sheet */}
          <div className="card" style={{ padding: 16 }}>
            <div className="flex justify-between items-center" style={{ cursor: 'pointer', borderBottom: '1px solid var(--glass-border)', paddingBottom: 10, marginBottom: 10 }} onClick={() => { playSound('click'); setIsTripDetailsOpen(!isTripDetailsOpen); }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.9rem' }}>🗺️ Trip Transit Details</h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{isTripDetailsOpen ? '▲' : '▼'}</span>
            </div>

            {isTripDetailsOpen && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Accordion Timing Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: 6 }}>
                  <span>2:56 PM — 4:31 PM</span>
                  <span style={{ color: 'var(--primary-light)' }}>1 hr 34 min</span>
                </div>

                {/* Transfer Route Badges Visualizer */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }} className="flex-wrap">
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>🚶 1.5 km</span>
                  <span style={{ fontSize: '0.65rem' }}>➜</span>
                  <span className="gps-line-badge violet">Violet Line</span>
                  <span style={{ fontSize: '0.65rem' }}>➜</span>
                  <span className="gps-line-badge red">Red Line</span>
                  <span style={{ fontSize: '0.65rem' }}>➜</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>🚶 800m</span>
                </div>

                {/* Route statistics grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: 8, textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.75rem' }}>1</div>
                    <div>Transfer</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.75rem' }}>56 min</div>
                    <div>Transit</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.75rem' }}>2.3 km</div>
                    <div>Walk</div>
                  </div>
                </div>

                {/* Timeline vertical line layout */}
                <div className="gps-timeline">
                  {/* Step 1: Walk to station */}
                  <div style={{ position: 'relative', paddingBottom: 16 }}>
                    <div className="gps-timeline-node active" />
                    <div className="gps-timeline-segment-line violet" style={{ height: '100%', top: 6 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-main)' }}>Start from: Majestic Kiosk</span>
                      <span style={{ color: 'var(--text-muted)' }}>2:56 PM</span>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Walk 1.5 km (21 min) to platform stand.</p>
                  </div>

                  {/* Step 2: Board public KSRTC bus transit */}
                  <div style={{ position: 'relative', paddingBottom: 16 }}>
                    <div className="gps-timeline-node active" />
                    <div className="gps-timeline-segment-line red" style={{ height: '100%', top: 6 }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-main)' }}>Board Platform stand</span>
                      <span style={{ color: 'var(--text-muted)' }}>3:18 PM</span>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--primary-light)', fontWeight: 700, marginTop: 2 }}>
                      Ride KSRTC bus {parcel.bus || 'AW-102'} (Violet Line transit)
                    </p>

                    {/* stops Collapsible list */}
                    <div style={{ marginTop: 6 }}>
                      <button 
                        onClick={() => { playSound('click'); setStopsCollapsed(!stopsCollapsed); }}
                        style={{ background: 'var(--surface-secondary)', border: '1px solid var(--glass-border)', borderRadius: 6, padding: '4px 8px', fontSize: '0.62rem', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        🚌 {stopsCollapsed ? `Expand ride stops (${stopsList.length} halts) ▼` : `Collapse stops ▲`}
                      </button>
                      
                      {!stopsCollapsed && (
                        <div className="animate-fade-in" style={{ paddingLeft: 8, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6, borderLeft: '1px dashed var(--glass-border)' }}>
                          {stopsList.map((stop, i) => {
                            const busProgress = busObj ? busObj.progress : 0;
                            const isPassed = busProgress >= stop.progressVal;
                            return (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                                <span style={{ color: isPassed ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {isPassed ? '✅' : '⚪'} {stop.name}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>{stop.time}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Destination secure delivery locker */}
                  <div style={{ position: 'relative' }}>
                    <div className={`gps-timeline-node ${busObj && busObj.progress >= 100 ? 'active' : ''}`} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-main)' }}>🏁 Locker Handover Kiosk</span>
                      <span style={{ color: 'var(--text-muted)' }}>4:31 PM</span>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Depot lockers allocation pin verification. Deliver OTP: <strong>{parcel.deliveryOtp}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

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
      playSound('scanning');
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

    // Pre-shift Safety Checklist flow
    if (!driverCheckedIn) {
      return (
        <div className="animate-fade-in pb-32">
          <Header title="Driver Shift Sign-In" />
          <div className="card flex flex-col gap-md" style={{ padding: 18 }}>
            <h4 style={{ fontWeight: 800, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6 }}>Pre-Shift Safety Verification</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confirm safety status before launching transit route schedules.</p>
            
            <div className="flex flex-col gap-xs" style={{ fontSize: '0.78rem' }}>
              {['Brakes pressure confirmed (Green gauge)', 'Tire PSI levels within standard safety rating (32-38 PSI)', 'Windshield wipers & safety indicators operational', 'Assigned cargo manifest locked in locker storage'].map((check, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 0' }}>
                  <input type="checkbox" defaultChecked={false} style={{ width: 16, height: 16 }} className="shift-checklist-check" />
                  <span>{check}</span>
                </label>
              ))}
            </div>

            <button 
              className="btn btn-primary w-full"
              style={{ marginTop: 12 }}
              onClick={() => {
                const checkboxes = document.querySelectorAll('.shift-checklist-check');
                const allChecked = Array.from(checkboxes).every(c => c.checked);
                if (allChecked) {
                  playSound('chime');
                  setDriverCheckedIn(true);
                  addLog(`DRIVER: Completed pre-shift vehicle safety check. Logged into shift.`);
                  speakText("Safety check completed. Conductor signed into shift.");
                } else {
                  playSound('beep');
                  alert('Please check and verify all safety conditions first.');
                }
              }}
            >
              Sign-Off Checklist & Login to Shift
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fade-in pb-32">
        <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>Shift Active • Conductor Manjunath</span>
          <button 
            onClick={() => { playSound('click'); setDriverCheckedIn(false); addLog('DRIVER: Signed off shift.'); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Sign Out Shift
          </button>
        </div>
        
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

        {/* Conductor break / Refuel controls */}
        {conductorBreakActive ? (
          <div className="card text-center" style={{ border: '1.5px solid var(--accent)', background: 'var(--accent-glow)', padding: 12, marginBottom: 12 }}>
            <h4 style={{ color: 'var(--accent)', fontWeight: 800 }}>Conductor Break Active</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Halt timer: {conductorBreakTimer}s. Speed set to 0. Progress is locked.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button className="btn btn-secondary flex-1" style={{ padding: '8px', fontSize: '0.72rem' }} onClick={() => {
              playSound('click');
              setConductorBreakActive(true);
              setConductorBreakTimer(15);
              addLog(`DRIVER: Initiated 15s conductor tea break / refueling halt.`);
              speakText("Conductor tea break started.");
            }}>
              Take Tea Break (15s)
            </button>
            <button className="btn btn-secondary flex-1" style={{ padding: '8px', fontSize: '0.72rem' }} onClick={() => {
              playSound('click');
              setConductorBreakActive(true);
              setConductorBreakTimer(15);
              addLog(`DRIVER: Initiated fueling halt.`);
              speakText("Fueling halt started.");
            }}>
              Refuel Bus (15s)
            </button>
          </div>
        )}

        {/* Conductor Voice & Traffic Assistance Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button 
              className="btn btn-primary flex-1" 
              style={{ padding: '10px', fontSize: '0.75rem', background: 'var(--accent)', border: 'none', color: '#111', fontWeight: 800 }} 
              onClick={() => {
                playSound('beep');
                
                // Set active bus status to Delayed and speed to 8 km/h
                setBuses(prev => prev.map(b => b.id === activeBus.id ? { ...b, speed: 8, eta: 'Delayed +45m', status: 'Delayed' } : b));
                
                // Trigger alerts & toast notifications for Customer
                setNotifications(prev => [
                  { id: Date.now(), title: `Traffic Alert: Bus ${activeBus.id}`, message: `Conductor reports heavy traffic delay. Expected ETA updated to +45 mins.`, type: 'alert', time: 'Just now' },
                  ...prev
                ]);
                setHasUnread(true);
                setToast({ title: 'Traffic Jam Delay Surcharge', message: `Bus ${activeBus.id} has reported heavy traffic jam on Mysuru Road.` });
                
                // Speak alert out loud
                const text = appLanguage === 'Kannada' 
                  ? `ಸಂಚಾರ ವಿಳಂಬ ಮುನ್ನೆಚ್ಚರಿಕೆ. ಬಸ್ ${activeBus.id} ನಿರ್ವಾಹಕರು ಭಾರಿ ರಸ್ತೆ ದಟ್ಟಣೆಯನ್ನು ವರದಿ ಮಾಡಿದ್ದಾರೆ.`
                  : appLanguage === 'Hindi'
                  ? `यातायात देरी की चेतावनी। बस ${activeBus.id} के कंडक्टर ने भारी मार्ग भीड़ की सूचना दी है।`
                  : `Traffic delay warning. Bus ${activeBus.id} conductor reports heavy route congestion.`;
                speakText(text, appLanguage);
                addLog(`DRIVER: Reported route traffic congestion. Updates pushed to passengers.`);
              }}
            >
              ⚠️ Report Traffic Jam
            </button>
            
            <button 
              className="btn btn-secondary flex-1" 
              style={{ padding: '10px', fontSize: '0.75rem' }} 
              onClick={() => {
                playSound('chime');
                const routeStops = activeBus.route.split('-').map(s => s.trim());
                const pendingLoads = driverParcels.filter(p => p.status !== 'Delivered').length;
                const nextHalt = activeBus.progress < 50 ? routeStops[0] : routeStops[1];
                
                let guideSpeech = "";
                if (appLanguage === 'Kannada') {
                  guideSpeech = `ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ. ಬಸ್ ಸಂಖ್ಯೆ ${activeBus.id}. ಪ್ರಸ್ತುತ ವೇಗ: ಗಂಟೆಗೆ ${activeBus.speed} ಕಿಲೋಮೀಟರ್. ಮುಂದಿನ ನಿಲ್ದಾಣ: ${nextHalt}. ಸಕ್ರಿಯ ಪಾರ್ಸೆಲ್‌ಗಳು: ${pendingLoads}.`;
                } else if (appLanguage === 'Hindi') {
                  guideSpeech = `आवाज गाइड। बस संख्या ${activeBus.id}। वर्तमान गति: ${activeBus.speed} किलोमीटर प्रति घंटा। अगला पड़ाव: ${nextHalt}। बोर्ड पर सक्रिय पार्सल: ${pendingLoads}।`;
                } else {
                  guideSpeech = `Voice Assistant. Operating Route: ${activeBus.route}. Current speed: ${activeBus.speed} kilometers per hour. Next upcoming kiosk stand is ${nextHalt}. There are ${pendingLoads} packages loaded on board for transit.`;
                }
                speakText(guideSpeech, appLanguage);
                addLog(`DRIVER: Broadcasted voice route guide speech telemetry.`);
              }}
            >
              🔊 Voice Route Guide
            </button>
          </div>

          {/* Conditional Reroute Option */}
          {activeBus.status === 'Delayed' && (
            <button
              className="btn btn-primary animate-fade-in"
              style={{ padding: '10px', fontSize: '0.75rem', background: 'var(--success)', border: 'none', color: 'white', fontWeight: 800 }}
              onClick={() => {
                playSound('chime');
                
                // Reroute active bus
                setBuses(prev => prev.map(b => b.id === activeBus.id ? { ...b, speed: 50, eta: 'Delayed +10m (Rerouted)', status: 'En Route (Rerouted)' } : b));
                
                // Trigger alerts & toast for Customer
                setNotifications(prev => [
                  { id: Date.now(), title: `Reroute Active: Bus ${activeBus.id}`, message: `Conductor bypassed traffic via an alternative local route. Delay reduced.`, type: 'success', time: 'Just now' },
                  ...prev
                ]);
                setHasUnread(true);
                setToast({ title: 'Transit Rerouted', message: `Alternative route active. Delay minimized for ${activeBus.id}.` });
                
                // Speak reroute
                const text = appLanguage === 'Kannada'
                  ? `ಮಾರ್ಗ ಬದಲಾಯಿಸಲಾಗಿದೆ. ಪರ್ಯಾಯ ಮಾರ್ಗವನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ.`
                  : appLanguage === 'Hindi'
                  ? `मार्ग समायोजित किया गया। भीड़ से बचने के लिए वैकल्पिक मार्ग शुरू किया गया।`
                  : `Route adjusted. Alternative route initiated to bypass congestion.`;
                speakText(text, appLanguage);
                addLog(`DRIVER: Initiated alternative route bypass. Recalculated ETA to destination.`);
              }}
            >
              🗺️ Reroute Fleet (Bypass Jam)
            </button>
          )}

          {/* Hands-Free Voice Assistant Microphone Panel */}
          <div className="card" style={{ padding: 12, border: '1px solid var(--glass-border)', background: 'var(--input-bg)', display: 'flex', flexDirection: 'column', gap: 10, margin: 0 }}>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>🎤 Hands-Free Command Mic</span>
              <button 
                onClick={toggleMic}
                className={`btn ${micActive ? 'mic-active-pulse' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4, height: 'auto' }}
              >
                {micActive ? '🔴 Active Listening' : '🎙️ Start Mic'}
              </button>
            </div>
            {voiceTranscript && (
              <div style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.25)', padding: '6px 8px', borderRadius: 6, fontStyle: 'italic', color: micActive ? 'var(--primary-light)' : 'var(--text-muted)' }}>
                {micActive ? 'Heard: ' : 'Last: '} "{voiceTranscript}"
              </div>
            )}
            
            {/* Developer text box simulation fallback */}
            <div className="flex items-center gap-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 6 }}>
              <input 
                type="text" 
                placeholder="Simulate voice command (e.g. traffic, break, guide)..." 
                style={{ padding: '6px 10px', fontSize: '0.68rem', height: 26, background: 'rgba(0,0,0,0.1)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    const phrase = e.target.value.trim().toLowerCase();
                    setVoiceTranscript(phrase);
                    addLog(`VOICE (SIMULATED): Heard command "${phrase}"`);
                    processVoiceCommand(phrase);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              Supported commands: <strong>traffic</strong>, <strong>break</strong>, <strong>refuel</strong>, <strong>guide</strong>, <strong>clear</strong>, <strong>bypass</strong>. Try Kannada / Hindi terms if active.
            </div>
          </div>

          {/* Autopilot Voice guidance toggle */}
          <div className="card flex items-center justify-between" style={{ padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', margin: 0 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Autopilot Voice Guidance (Hands-free)</span>
            <input 
              type="checkbox" 
              checked={autopilotVoice} 
              onChange={e => {
                playSound('click');
                setAutopilotVoice(e.target.checked);
                const txt = e.target.checked 
                  ? (appLanguage === 'Kannada' ? "ಆಟೋಪೈಲಟ್ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ." : appLanguage === 'Hindi' ? "ऑटोपायलट आवाज मार्गदर्शन सक्षम।" : "Autopilot voice guidance enabled. Telemetry alerts will play automatically.")
                  : (appLanguage === 'Kannada' ? "ಧ್ವನಿ ಆಟೋಪೈಲಟ್ ಆಫ್ ಆಗಿದೆ." : appLanguage === 'Hindi' ? "आवाज ऑटोपायलट बंद।" : "Voice autopilot off.");
                speakText(txt, appLanguage);
                addLog(`DRIVER: Toggled autopilot voice guide to ${e.target.checked ? 'Active' : 'Inactive'}.`);
              }}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>
        </div>

                {/* Telemetry Alarm Trouble Alerts */}
        {activeBus.temp > 100 && (
          <div className="card animate-alert-blink" style={{ border: '1.5px solid var(--error)', background: 'var(--error-glow)', padding: 12, marginBottom: 12 }}>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--error)' }}>⚠️ ENGINE OVERHEAT INCIDENT ACTIVE</span>
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 10px', fontSize: '0.68rem', background: 'var(--error)', border: 'none', boxShadow: 'none', height: 'auto' }}
                onClick={() => { playSound('click'); setTroubleshootType('engine_heat'); setTroubleshootStep(0); }}
              >
                Troubleshoot
              </button>
            </div>
          </div>
        )}

        {activeBus.tirePressure.fl < 30 && (
          <div className="card animate-alert-blink" style={{ border: '1.5px solid var(--error)', background: 'var(--error-glow)', padding: 12, marginBottom: 12 }}>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--error)' }}>⚠️ CRITICAL LOW TIRE PRESSURE ACTIVE</span>
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 10px', fontSize: '0.68rem', background: 'var(--error)', border: 'none', boxShadow: 'none', height: 'auto' }}
                onClick={() => { playSound('click'); setTroubleshootType('tire_low'); setTroubleshootStep(0); }}
              >
                Troubleshoot
              </button>
            </div>
          </div>
        )}

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
                        placeholder="Enter Delivery OTP"
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

                    <div style={{ borderTop: '1px dashed var(--glass-border)', paddingTop: 10, marginTop: 4 }}>
                      <span className="input-label" style={{ fontSize: '0.62rem', display: 'block', marginBottom: 4 }}>Depot Locker Allocation</span>
                      <select 
                        style={{ padding: '6px 10px', fontSize: '0.72rem', height: 32, background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', borderRadius: 8 }}
                        onChange={e => {
                          const val = e.target.value;
                          if (val) {
                            depositParcelInLocker(p.id, val);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">Choose vacant locker...</option>
                        {lockers.filter(l => l.status === 'Empty').map(l => (
                          <option key={l.id} value={l.id}>{l.id} ({l.location.split(',')[0]})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Conductor Shift Cashier Ledger */}
        <div className="card" style={{ padding: 14, marginTop: 16 }}>
          <h4 style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 10 }}>Conductor Shift Ledger</h4>
          <div className="flex justify-between" style={{ fontSize: '0.78rem', marginBottom: 10 }}>
            <span>Cash collected on shift:</span>
            <strong style={{ color: 'var(--success)' }}>₹{driverCashBalance}</strong>
          </div>
          
          <span className="input-label" style={{ fontSize: '0.65rem', display: 'block', marginBottom: 6 }}>Conductor Leaderboard</span>
          <div className="flex flex-col gap-xs" style={{ fontSize: '0.72rem' }}>
            {[
              { name: "1. Conductor Ramesh", cash: 2100 },
              { name: "2. Conductor Rajesh", cash: 1820 },
              { name: "3. You (Conductor Manjunath)", cash: driverCashBalance, active: true }
            ].map((leader, idx) => (
              <div key={idx} className="flex justify-between" style={{ padding: '4px 8px', borderRadius: 4, background: leader.active ? 'var(--primary-glow)' : 'transparent', border: leader.active ? '1px solid var(--primary)' : 'none' }}>
                <span style={{ fontWeight: leader.active ? 800 : 500 }}>{leader.name}</span>
                <strong style={{ color: 'var(--success)' }}>₹{leader.cash}</strong>
              </div>
            ))}
          </div>
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
                         setBypassEvidenceList(prev => [...prev, { parcelId: scannedParcelId, busId: activeBus.id, time: new Date().toLocaleTimeString() }]);
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

           {/* Telemetry Troubleshooting Modal */}
           {troubleshootType && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 4600, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div className="card w-full" style={{ maxWidth: 360, textAlign: 'center' }}>
                   <h3 style={{ display: 'flex', alignItems: 'center', justify: 'center', gap: 6, fontWeight: 800 }}>
                     🔧 {troubleshootType === 'engine_heat' ? 'Radiator Coolant Troubleshoot' : 'Tire Inflation Troubleshoot'}
                   </h3>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '8px 0 16px' }}>
                     {troubleshootType === 'engine_heat' ? 'Perform manual radiator check and air bleed sequence.' : 'Connect emergency air compressor valve to low pressure tire.'}
                   </p>
                   
                   {/* Progress steps checklist */}
                   <div className="flex flex-col gap-sm" style={{ textAlign: 'left', marginBottom: 20 }}>
                     {troubleshootType === 'engine_heat' ? [
                       "Verify hazard lights are active and bus is safely parked.",
                       "Carefully open radiator pressure cap (Caution: Hot steam hiss!)",
                       "Fill reservoir tank with coolant fluid to MAX indicator line.",
                       "Seal cap tightly and verify telemetric sensor reset."
                     ].map((step, idx) => {
                       const isActive = troubleshootStep === idx;
                       const isCompleted = troubleshootStep > idx;
                       return (
                         <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: isActive ? 'var(--primary-glow)' : 'transparent', border: isActive ? '1px solid var(--primary)' : 'none', opacity: isCompleted ? 0.6 : 1 }}>
                           <div style={{ width: 18, height: 18, borderRadius: '50%', background: isCompleted ? 'var(--success)' : 'var(--input-bg)', border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '0.62rem', fontWeight: 800, color: 'white' }}>
                             {isCompleted ? '✓' : idx + 1}
                           </div>
                           <span style={{ fontSize: '0.72rem', color: isActive ? 'white' : 'var(--text-muted)' }}>{step}</span>
                         </div>
                       );
                     }) : [
                       "Secure bus parking brakes and deploy wheel chocks.",
                       "Attach emergency high-pressure compressor hose to valve.",
                       "Toggle compressor pump switch (Listen for compressor beats!)",
                       "Confirm tire pressure is inflated to safe 34 PSI range."
                     ].map((step, idx) => {
                       const isActive = troubleshootStep === idx;
                       const isCompleted = troubleshootStep > idx;
                       return (
                         <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: isActive ? 'var(--primary-glow)' : 'transparent', border: isActive ? '1px solid var(--primary)' : 'none', opacity: isCompleted ? 0.6 : 1 }}>
                           <div style={{ width: 18, height: 18, borderRadius: '50%', background: isCompleted ? 'var(--success)' : 'var(--input-bg)', border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '0.62rem', fontWeight: 800, color: 'white' }}>
                             {isCompleted ? '✓' : idx + 1}
                           </div>
                           <span style={{ fontSize: '0.72rem', color: isActive ? 'white' : 'var(--text-muted)' }}>{step}</span>
                         </div>
                       );
                     })}
                   </div>

                   <div className="flex gap-sm">
                     <button className="btn btn-secondary flex-1" style={{ fontSize: '0.8rem', padding: '10px' }} onClick={() => { playSound('click'); setTroubleshootType(null); setTroubleshootStep(0); }}>
                       Abort
                     </button>
                     {troubleshootStep < 3 ? (
                       <button className="btn btn-primary flex-1" style={{ fontSize: '0.8rem', padding: '10px' }} onClick={() => {
                         playSound('beep');
                         if (troubleshootType === 'engine_heat') {
                           if (troubleshootStep === 1) playSound('hiss');
                         } else {
                           if (troubleshootStep === 2) playSound('pump');
                         }
                         setTroubleshootStep(prev => prev + 1);
                       }}>
                         Next Step
                       </button>
                     ) : (
                       <button className="btn btn-primary flex-1" style={{ fontSize: '0.8rem', padding: '10px', background: 'var(--success)', border: 'none' }} onClick={() => {
                         if (troubleshootType === 'engine_heat') {
                           playSound('chime');
                           setBuses(prev => prev.map(b => b.id === 'AW-102' ? { ...b, temp: 92, speed: 52, rpm: 1600, status: 'En Route' } : b));
                           setSystemAlerts(prev => prev.filter(a => a.busId !== 'AW-102'));
                           addLog('DRIVER: Coolant refilled and radiator cap sealed. Temperature normalized to 92°C.');
                           speakText("Engine coolant refilled. Temperature normalized.", appLanguage);
                         } else {
                           playSound('chime');
                           setBuses(prev => prev.map(b => b.id === 'KS-442' ? { ...b, tirePressure: { ...b.tirePressure, fl: 34 }, status: 'En Route' } : b));
                           setSystemAlerts(prev => prev.filter(a => a.busId !== 'KS-442'));
                           addLog('DRIVER: Compressor connected and front left tire inflated to 34 PSI.');
                           speakText("Tire pressure adjusted to 34 P S I.", appLanguage);
                         }
                         setTroubleshootType(null);
                         setTroubleshootStep(0);
                       }}>
                         Complete Repair
                       </button>
                     )}
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    );
  };

  // Admin Fleet Map Component (Leaflet GPS integration)
  const AdminFleetMap = () => {
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const polylinesRef = useRef([]);

    useEffect(() => {
      // Initialize Leaflet map centered on Karnataka
      const map = window.L.map('admin-leaflet-fleet-map', {
        zoomControl: false,
        attributionControl: false
      }).setView([13.7, 76.1], 7);

      // Dark theme map tiles
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      mapRef.current = map;

      // Draw route polylines
      const routesToDraw = [
        {
          name: 'Mysuru',
          color: 'var(--primary)',
          coords: [
            [12.97787, 77.57124], // Majestic
            [12.9177, 77.4839],  // Kengeri
            [12.5222, 76.8970],  // Mandya
            [12.3117, 76.6570]   // Mysuru
          ]
        },
        {
          name: 'Mangaluru',
          color: 'var(--accent)',
          coords: [
            [12.97787, 77.57124], // Majestic
            [13.0063, 76.1026],  // Hassan
            [12.8751, 74.8427]   // Mangaluru
          ]
        },
        {
          name: 'Hubli',
          color: 'var(--success)',
          coords: [
            [12.97787, 77.57124], // Majestic
            [13.3402, 77.1006],  // Tumakuru
            [14.4644, 75.9218],  // Davanagere
            [15.3524, 75.1381]   // Hubballi
          ]
        }
      ];

      routesToDraw.forEach(r => {
        const poly = window.L.polyline(r.coords, {
          color: r.color,
          weight: 3.5,
          opacity: 0.5,
          dashArray: '4, 8'
        }).addTo(map);
        polylinesRef.current.push(poly);
      });

      // Cleanup
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, []);

    // Update bus markers dynamically when buses state changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      // Remove any markers for buses that no longer exist
      const currentBusIds = buses.map(b => b.id);
      Object.keys(markersRef.current).forEach(id => {
        if (!currentBusIds.includes(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      // Add/update markers
      buses.forEach(bus => {
        const { lat, lng } = getRealRouteCoordinates(bus.route, bus.progress);
        const isOverheated = bus.temp > 100;
        const isDelayed = bus.status === 'Delayed';
        const color = isOverheated ? 'var(--error)' : isDelayed ? 'var(--accent)' : 'var(--primary)';
        const shadowGlow = isOverheated ? 'var(--error-glow)' : isDelayed ? 'var(--accent-glow)' : 'var(--primary-glow)';

        const iconHtml = `
          <div class="animate-pulse" style="
            background: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 12px ${shadowGlow};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            font-weight: 800;
            color: white;
            font-family: inherit;
          ">
            ${bus.id.split('-')[1] || bus.id}
          </div>
        `;

        const busIcon = window.L.divIcon({
          html: iconHtml,
          className: 'leaflet-bus-custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        if (markersRef.current[bus.id]) {
          markersRef.current[bus.id].setLatLng([lat, lng]);
          markersRef.current[bus.id].setIcon(busIcon);
        } else {
          const marker = window.L.marker([lat, lng], { icon: busIcon }).addTo(map);
          markersRef.current[bus.id] = marker;
        }

        // Add detailed diagnostic tooltip
        markersRef.current[bus.id].bindTooltip(`
          <div style="font-family: 'Outfit', sans-serif; font-size: 11px; padding: 4px; line-height: 1.4; color: #f3f4f6; background: #111827; border: 1px solid var(--glass-border); border-radius: 6px;">
            <strong style="color: var(--primary-light)">Bus telemetry: ${bus.id}</strong><br/>
            <strong>Route:</strong> ${bus.route}<br/>
            <strong>Speed:</strong> ${bus.speed} km/h<br/>
            <strong>RPM:</strong> ${bus.rpm}<br/>
            <strong>Temp:</strong> ${bus.temp}°C<br/>
            <strong>Fuel:</strong> ${bus.fuel}%<br/>
            <strong>Status:</strong> <span style="color: ${isOverheated ? 'var(--error)' : isDelayed ? 'var(--accent)' : 'var(--success)'}">${bus.status}</span>
          </div>
        `, { direction: 'top', opacity: 0.95, permanent: false });
      });
    }, [buses]);

    return (
      <div 
        id="admin-leaflet-fleet-map" 
        style={{ 
          height: 320, 
          width: '100%', 
          borderRadius: 'var(--radius-md)', 
          background: '#070a13',
          border: '1px solid var(--glass-border)',
          position: 'relative',
          zIndex: 1
        }} 
      />
    );
  };

  // Admin Dashboard Panel
  const AdminDashboard = () => {
    // Analytics calculations
    const totalRevenue = parcels.reduce((sum, p) => sum + p.totalFare, 0) + 142500;
    const activeParcelsCount = parcels.filter(p => p.status !== 'Delivered').length;

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

        {/* Global Admin Fleet Map Tracking */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Global Fleet Map Tracker</h4>
        <div className="card" style={{ padding: 12, marginBottom: 16 }}>
          <AdminFleetMap />
        </div>

        {/* Admin Custom Fleet Bus Dispatcher Form */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Dispatch Custom Fleet Bus</h4>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
           <form onSubmit={(e) => {
             e.preventDefault();
             const busId = sanitizeInput(e.target.busId.value.trim().toUpperCase(), 15);
             const busType = e.target.busType.value;
             const route = e.target.route.value;
             if (!busId) {
               alert('Please enter a Bus ID');
               return;
             }
             if (buses.some(b => b.id === busId)) {
               alert('Bus ID already exists');
               return;
             }
             
             let category = 'Express';
             if (busType.includes('Sarige')) category = 'Economy';
             else if (busType.includes('Rajahamsa')) category = 'Standard';
             
             const newBus = {
               id: busId,
               route,
               type: busType,
               category,
               eta: 'Scheduled',
               location: route.split('-')[0].trim(),
               status: 'En Route',
               progress: 0,
               speed: 55,
               rpm: 1500,
               temp: 85,
               fuel: 100,
               tirePressure: { fl: 35, fr: 35, rl: 36, rr: 36 }
             };
             
             playSound('chime');
             setBuses(prev => [...prev, newBus]);
             addLog(`ADMIN: Dispatched new custom bus ${busId} (${busType}) on route ${route}.`);
              const text = appLanguage === 'Kannada'
                ? `ಹೊಸ ಬಸ್ ಸಂಖ್ಯೆ ${busId} ನಿಯೋಜಿಸಲಾಗಿದೆ.`
                : appLanguage === 'Hindi'
                ? `नया बस संख्या ${busId} तैनात किया गया है।`
                : `Dispatched custom bus ${busId}`;
              speakText(text, appLanguage);
             e.target.reset();
           }} className="flex flex-col gap-sm">
             <div className="flex gap-sm">
               <input type="text" name="busId" placeholder="Bus ID (e.g. KA-51)" style={{ padding: '8px 12px', fontSize: '0.8rem' }} required />
               <select name="busType" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                 <option value="Airavat Club Class">Airavat Volvo</option>
                 <option value="Rajahamsa">Rajahamsa Express</option>
                 <option value="Karnataka Sarige">Karnataka Sarige</option>
               </select>
             </div>
             <div className="flex gap-sm">
               <select name="route" style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 2 }}>
                 <option value="Bengaluru - Mysuru">Bengaluru - Mysuru</option>
                 <option value="Bengaluru - Mangaluru">Bengaluru - Mangaluru</option>
                 <option value="Bengaluru - Hubli">Bengaluru - Hubli</option>
               </select>
               <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', flex: 1 }}>Dispatch</button>
             </div>
           </form>
        </div>

        {/* SVG Historical Area Chart: Cargo volume category split */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Historical Cargo volume split (Area Chart)</h4>
        <div className="card" style={{ padding: 12, marginBottom: 16 }}>
           <svg viewBox="0 0 300 120" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="areaGradExpress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="areaGradStandard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <grid>
                <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="20" y1="55" x2="280" y2="55" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="20" y1="90" x2="280" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              </grid>
              {/* Express category curve */}
              <path 
                d="M 20 90 Q 50 60 90 80 T 170 50 T 250 40 T 280 25 L 280 90 Z" 
                fill="url(#areaGradExpress)" 
              />
              <path 
                d="M 20 90 Q 50 60 90 80 T 170 50 T 250 40 T 280 25" 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="2.5" 
              />
              {/* Standard category curve */}
              <path 
                d="M 20 90 Q 50 80 90 85 T 170 70 T 250 60 T 280 45 L 280 90 Z" 
                fill="url(#areaGradStandard)" 
              />
              <path 
                d="M 20 90 Q 50 80 90 85 T 170 70 T 250 60 T 280 45" 
                fill="none" 
                stroke="var(--accent)" 
                strokeWidth="1.5" 
                strokeDasharray="2,2"
              />
              <line x1="20" y1="90" x2="280" y2="90" stroke="var(--glass-border)" strokeWidth="1" />
              <text x="30" y="105" fontSize="7.5" fill="var(--text-muted)">Mon</text>
              <text x="135" y="105" fontSize="7.5" fill="var(--text-muted)">Thu</text>
              <text x="260" y="105" fontSize="7.5" fill="var(--text-muted)">Sun</text>
           </svg>
        </div>

        {/* Admin Global Broadcast Console */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Global Broadcast Console</h4>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
           <div className="flex gap-sm">
             <input 
               type="text" 
               placeholder="Enter ticker broadcast text..." 
               id="broadcastInputText"
               defaultValue={globalBroadcast} 
               style={{ padding: '8px 12px', fontSize: '0.8rem' }}
             />
             <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => {
               playSound('chime');
               const text = document.getElementById('broadcastInputText').value;
               const sanitized = sanitizeInput(text, 120);
               setGlobalBroadcast(sanitized);
               addLog(`ADMIN: Updated global broadcast alert banner.`);
                const txt = appLanguage === 'Kannada'
                  ? "ಜಾಗತಿಕ ಪ್ರಸಾರ ಎಚ್ಚರಿಕೆಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ."
                  : appLanguage === 'Hindi'
                  ? "वैश्विक प्रसारण अलर्ट अपडेट किया गया है।"
                  : "Global broadcast alert updated.";
                speakText(txt, appLanguage);
             }}>Broadcast</button>
           </div>
        </div>

        {/* Driver Photo Bypass Evidence Inspector */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Photo Bypass Evidence Inspector</h4>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
           {bypassEvidenceList.length === 0 ? (
             <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No bypass photos uploaded during this session.</p>
           ) : (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
               {bypassEvidenceList.map((ev, i) => (
                 <div key={i} className="card" style={{ padding: 10, background: 'var(--input-bg)' }}>
                   <div style={{ aspectRatio: '4/3', background: '#1e293b', borderRadius: 8, display: 'flex', alignItems: 'center', justify: 'center', position: 'relative', overflow: 'hidden', marginBottom: 6 }}>
                     <Camera size={20} color="var(--text-muted)" />
                     <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: 2, fontSize: '0.55rem', color: 'white' }}>GPS CAPTURE OK</span>
                   </div>
                   <div style={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
                     <div>Parcel: <strong>{ev.parcelId}</strong></div>
                     <div>Bus: {ev.busId} • {ev.time}</div>
                     <button className="btn" style={{ padding: '4px 6px', fontSize: '0.6rem', background: 'var(--primary)', color: 'white', marginTop: 4, width: '100%' }} onClick={() => {
                       playSound('chime');
                       alert(`Operational bypass verified for parcel ${ev.parcelId}. Delivery state marked compliant.`);
                     }}>Verify Compliance</button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Operational Incident Ledger */}
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Operational Incident Ledger</h4>
        <div className="card" style={{ padding: 16, maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
           <div className="flex flex-col gap-sm">
             {incidentLogs.map(log => (
               <div key={log.id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 6, fontSize: '0.72rem' }}>
                 <div className="flex justify-between" style={{ fontWeight: 700 }}>
                   <span style={{ color: log.severity === 'high' ? 'var(--error)' : log.severity === 'medium' ? 'var(--accent)' : 'var(--success)' }}>
                     {log.id}: {log.title}
                   </span>
                   <span style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                 </div>
                 <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{log.desc}</p>
               </div>
             ))}
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

      {/* Premium background gradient orbs from Stitch Design System */}
      <div className="premium-orb-1" />
      <div className="premium-orb-2" />
      
      {/* 1. Mobile Phone Frame Simulator */}
      <div className="mobile-frame">
        {weather === 'Rainy' && (
          <div className="weather-overlay weather-rain" />
        )}
        {weather === 'Foggy' && (
          <div className="weather-overlay weather-fog" />
        )}
        
        {globalBroadcast && currentUser && (
          <div className="broadcast-banner">
            <span className="broadcast-text">{globalBroadcast}</span>
          </div>
        )}
        <div className="container relative">
          
          {/* Toast Notification Box */}
          <AnimatePresence>
            {toast && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                style={{ 
                  position: 'absolute', 
                  top: 60, 
                  left: 10, 
                  right: 10, 
                  zIndex: 2000, 
                  background: 'linear-gradient(135deg, #1f2937, #111827)', 
                  border: '1.5px solid var(--primary)', 
                  color: 'white', 
                  padding: '12px 16px', 
                  borderRadius: 12, 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{ background: 'var(--primary-glow)', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-light)' }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{toast.title}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>{toast.message}</div>
                </div>
                <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer' }}>&times;</button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!currentUser ? (
            <AuthPage />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

            {/* 2. Simulator Sidebar Developer Console */}
      {!import.meta.env.PROD && (
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
      )}

      {/* Confetti Particle Overlay */}
      {showConfetti && (
        <div className="confetti-overlay">
          {confettiParticles.map(p => (
            <div 
              key={p.id} 
              className="confetti-particle"
              style={{
                background: p.color,
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}
