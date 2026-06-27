import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, Navigation, Layers } from 'lucide-react';
import { useSimulation, playSound, getRealRouteStops, getRealRouteCoordinates, getRealRouteHighwayPath } from '../context/SimulationContext';

// Customer Leaflet Map Component (Leaflet GPS integration for tracking)
const CustomerLeafletMap = ({ bus, routeStops, highwayCoords }) => {
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const busMarkerRef = useRef(null);
  const stopMarkersRef = useRef([]);
  const polylineRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState('dark');

  useEffect(() => {
    const startCoord = routeStops[0] ? [routeStops[0].lat, routeStops[0].lng] : [12.97787, 77.57124];
    
    if (!window.L) return;

    const map = window.L.map('customer-leaflet-tracking-map', {
      zoomControl: false,
      attributionControl: false
    }).setView(startCoord, 8);

    const tileLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    // Draw route polyline using high-density highway waypoints
    const pathCoords = highwayCoords.map(s => [s.lat, s.lng]);
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

  // Update Tile Layer dynamically when activeLayer state changes
  useEffect(() => {
    if (!tileLayerRef.current || !window.L) return;
    
    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    if (activeLayer === 'light') {
      url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    } else if (activeLayer === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    
    tileLayerRef.current.setUrl(url);
  }, [activeLayer]);

  // Update bus marker dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !bus || !window.L) return;

    const progress = bus.progress;
    const { lat, lng } = getRealRouteCoordinates(bus.route, progress);
    const isOverheated = bus.temp > 100;
    const isDelayed = bus.status === 'Delayed';
    const color = isOverheated ? 'var(--error)' : isDelayed ? 'var(--accent)' : 'var(--primary)';
    const shadowGlow = isOverheated ? 'var(--error-glow)' : isDelayed ? 'var(--accent-glow)' : 'var(--primary-glow)';

    const iconHtml = `
      <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
        <div class="animate-ping" style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.35;
        "></div>
        <div style="
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
          z-index: 10;
          font-family: inherit;
        ">
          🚌
        </div>
      </div>
    `;

    const busIcon = window.L.divIcon({
      html: iconHtml,
      className: 'leaflet-customer-bus-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
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

    map.panTo([lat, lng]);
  }, [bus, bus?.progress]);

  const handleZoom = (type) => {
    const map = mapRef.current;
    if (!map) return;
    if (type === 'in') map.zoomIn();
    else if (type === 'out') map.zoomOut();
    else {
      if (polylineRef.current) {
        try {
          map.fitBounds(polylineRef.current.getBounds(), { padding: [30, 30] });
        } catch (e) {}
      }
    }
  };

  const recenterOnBus = () => {
    const map = mapRef.current;
    if (!map || !bus) return;
    playSound('click');
    const { lat, lng } = getRealRouteCoordinates(bus.route, bus.progress);
    map.setView([lat, lng], 11, { animate: true });
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      
      {/* Floating Layer switcher */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <div className="glass flex" style={{ padding: 4, borderRadius: 8, gap: 2 }}>
          {[
            { id: 'dark', label: 'Dark' },
            { id: 'light', label: 'Light' },
            { id: 'osm', label: 'OSM' }
          ].map(layer => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              style={{
                fontSize: '0.62rem',
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: activeLayer === layer.id ? 'var(--primary)' : 'transparent',
                color: activeLayer === layer.id ? 'white' : 'var(--text-muted)',
                fontWeight: 800
              }}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Zoom & Navigation controls */}
      <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button 
          onClick={recenterOnBus} 
          className="glass flex items-center justify-center" 
          title="Recenter on Bus"
          style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', color: 'white' }}
        >
          <Navigation size={12} fill="white" />
        </button>
        <button 
          onClick={() => handleZoom('in')} 
          className="glass flex items-center justify-center" 
          style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', color: 'white' }}
        >
          <ZoomIn size={14} />
        </button>
        <button 
          onClick={() => handleZoom('out')} 
          className="glass flex items-center justify-center" 
          style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', color: 'white' }}
        >
          <ZoomOut size={14} />
        </button>
        <button 
          onClick={() => handleZoom('fit')} 
          className="glass flex items-center justify-center" 
          style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', color: 'white' }}
        >
          <Maximize size={12} />
        </button>
      </div>

      <div 
        id="customer-leaflet-tracking-map" 
        style={{ 
          height: 220, 
          width: '100%', 
          background: '#070a13',
          border: '1px solid var(--glass-border)',
          zIndex: 1
        }} 
      />
    </div>
  );
};

export default function LiveVectorTrackingMap({ parcel }) {
  const { buses } = useSimulation();
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

  return (
    <div className="card" style={{ padding: 12, background: 'var(--input-bg)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
      
      {/* Mode Selector Row */}
      <div className="gps-mode-bar" style={{ margin: '-12px -12px 10px -12px', borderBottom: '1px solid var(--glass-border)' }}>
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
          highwayCoords={getRealRouteHighwayPath(bus ? bus.route : (parcel.destination.includes('Mysuru') ? 'Bengaluru - Mysuru' : parcel.destination.includes('Mangaluru') ? 'Bengaluru - Mangaluru' : 'Bengaluru - Hubli'))}
        />
      </div>

      {/* Live diagnostics banner */}
      {bus && (
        <div style={{ display: 'flex', justifycontent: 'space-between', padding: '8px 6px 0 6px', fontSize: '0.68rem', fontFamily: 'monospace', color: bus.status === 'Warning' ? 'var(--error)' : 'var(--success)' }}>
          <span>TELEMETRY: S:{bus.speed}km/h | T:{bus.temp}°C | F:{bus.fuel}%</span>
          <span style={{ marginLeft: 'auto' }}>GPS: {getRealRouteCoordinates(bus.route, bus.progress).lat.toFixed(4)}°N, {getRealRouteCoordinates(bus.route, bus.progress).lng.toFixed(4)}°E</span>
        </div>
      )}

      {/* Available Routes Selector - Horizontal Cards */}
      <div className="gps-route-options-list" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10 }}>
        {routeOptions.map(opt => (
          <div 
            key={opt.id}
            onClick={() => { playSound('click'); setSelectedRouteIdx(opt.id); }}
            className={`gps-route-card ${selectedRouteIdx === opt.id ? 'active' : ''}`}
            style={{ flexShrink: 0, width: 140 }}
          >
            <div className="flex justify-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-main)' }}>{opt.title}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--primary-light)', fontWeight: 800 }}>{opt.duration}</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6 }}>{opt.time}</p>
            <div className="flex">
              {opt.badges.map((b, i) => (
                <span key={i} className={`gps-line-badge ${b.color}`} style={{ marginRight: 4 }}>{b.label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
