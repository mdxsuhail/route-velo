import React, { useEffect, useRef, useState } from 'react';
import { Layers, ZoomIn, ZoomOut, Maximize, Navigation, Search } from 'lucide-react';
import { useSimulation, getRealRouteCoordinates } from '../context/SimulationContext';

export default function AdminFleetMap() {
  const { buses } = useSimulation();
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef([]);

  const [activeLayer, setActiveLayer] = useState('dark');
  const [selectedBusId, setSelectedBusId] = useState('');

  useEffect(() => {
    if (!window.L) return;

    // Initialize Leaflet map centered on Karnataka
    const map = window.L.map('admin-leaflet-fleet-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([13.7, 76.1], 7);

    // Initial tile layer (Dark theme)
    const tileLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);
    
    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    // Draw NH route polylines
    const routesToDraw = [
      {
        name: 'Mysuru',
        color: 'var(--primary)',
        coords: [
          [12.97787, 77.57124], // Majestic
          [12.9177, 77.4839],  // Kengeri
          [12.7226, 77.3874],  // Bidadi
          [12.7214, 77.2801],  // Ramanagara
          [12.6518, 77.2006],  // Channapatna
          [12.5843, 77.0450],  // Maddur
          [12.5222, 76.8970],  // Mandya
          [12.4221, 76.6953],  // Srirangapatna
          [12.3117, 76.6570]   // Mysuru
        ]
      },
      {
        name: 'Mangaluru',
        color: 'var(--accent)',
        coords: [
          [12.97787, 77.57124], // Majestic
          [13.0232, 77.0298],  // Kunigal
          [12.9009, 76.3898],  // Channarayapatna
          [13.0063, 76.1026],  // Hassan
          [12.9427, 75.7865],  // Sakleshpur
          [12.8338, 75.5684],  // Gundya
          [12.8398, 75.2530],  // Uppinangady
          [12.8988, 75.0392],  // Bantwal
          [12.8751, 74.8427]   // Mangaluru
        ]
      },
      {
        name: 'Hubli',
        color: 'var(--success)',
        coords: [
          [12.97787, 77.57124], // Majestic
          [13.3402, 77.1006],  // Tumakuru
          [13.7431, 76.9056],  // Sira
          [13.9439, 76.6186],  // Hiriyur
          [14.2251, 76.4006],  // Chitradurga
          [14.4644, 75.9218],  // Davanagere
          [14.5098, 75.8034],  // Harihar
          [14.6231, 75.6212],  // Ranebennur
          [14.7958, 75.3998],  // Haveri
          [15.3524, 75.1381]   // Hubballi
        ]
      },
      {
        name: 'Shivamogga',
        color: '#38bdf8', // sky-400
        coords: [
          [12.97787, 77.57124], // Majestic
          [13.3402, 77.1006],  // Tumakuru
          [13.3101, 76.9402],  // Gubbi
          [13.2638, 76.4784],  // Tiptur
          [13.3151, 76.2570],  // Arsikere
          [13.5532, 76.0123],  // Kadur
          [13.5938, 75.9784],  // Birur
          [13.7118, 75.8142],  // Tarikere
          [13.9299, 75.5681]   // Shivamogga
        ]
      },
      {
        name: 'Belagavi',
        color: '#e879f9', // fuchsia-400
        coords: [
          [12.97787, 77.57124], // Majestic
          [13.3402, 77.1006],  // Tumakuru
          [14.4644, 75.9218],  // Davanagere
          [15.3524, 75.1381],  // Hubballi
          [15.4589, 75.0078],  // Dharwad
          [15.5984, 74.7890],  // Kittur
          [15.8497, 74.4977]   // Belagavi
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

  // Update bus markers dynamically when buses state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.L) return;

    const currentBusIds = buses.map(b => b.id);
    Object.keys(markersRef.current).forEach(id => {
      if (!currentBusIds.includes(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    buses.forEach(bus => {
      const { lat, lng } = getRealRouteCoordinates(bus.route, bus.progress);
      const isOverheated = bus.temp > 100;
      const isDelayed = bus.status === 'Delayed';
      const color = isOverheated ? 'var(--error)' : isDelayed ? 'var(--accent)' : 'var(--primary)';
      const shadowGlow = isOverheated ? 'var(--error-glow)' : isDelayed ? 'var(--accent-glow)' : 'var(--primary-glow)';

      // Premium pulsing ring effect underneath the bus icon marker
      const iconHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div class="animate-ping" style="
            position: absolute;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: ${color};
            opacity: 0.35;
          "></div>
          <div style="
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
            font-weight: 900;
            color: white;
            z-index: 10;
            font-family: inherit;
            transition: all 0.2s ease;
          ">
            ${bus.id.split('-')[1] || bus.id}
          </div>
        </div>
      `;

      const busIcon = window.L.divIcon({
        html: iconHtml,
        className: 'leaflet-bus-custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (markersRef.current[bus.id]) {
        markersRef.current[bus.id].setLatLng([lat, lng]);
        markersRef.current[bus.id].setIcon(busIcon);
      } else {
        const marker = window.L.marker([lat, lng], { icon: busIcon }).addTo(map);
        markersRef.current[bus.id] = marker;
      }

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

  // Focus View directly onto selected Bus coordinate
  const focusOnBus = (busId) => {
    setSelectedBusId(busId);
    const bus = buses.find(b => b.id === busId);
    if (bus && mapRef.current) {
      const { lat, lng } = getRealRouteCoordinates(bus.route, bus.progress);
      mapRef.current.setView([lat, lng], 10, { animate: true, duration: 1 });
    }
  };

  const handleZoom = (type) => {
    const map = mapRef.current;
    if (!map) return;
    if (type === 'in') map.zoomIn();
    else if (type === 'out') map.zoomOut();
    else map.setView([13.7, 76.1], 7);
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      
      {/* 1. Floating Map Utility Controls */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        right: 10, 
        zIndex: 1000, 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: 8,
        pointerEvents: 'none' 
      }}>
        {/* Layer selector */}
        <div className="glass flex" style={{ padding: 4, borderRadius: 8, gap: 2, pointerEvents: 'auto' }}>
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

        {/* Focus Bus Dropdown */}
        <div className="glass flex items-center" style={{ padding: '4px 8px', borderRadius: 8, gap: 4, pointerEvents: 'auto' }}>
          <Search size={10} color="var(--text-muted)" />
          <select 
            value={selectedBusId} 
            onChange={e => focusOnBus(e.target.value)} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              fontSize: '0.65rem', 
              color: 'var(--text-main)', 
              outline: 'none',
              padding: 0,
              margin: 0,
              height: 'auto',
              width: 'auto'
            }}
          >
            <option value="" style={{ background: '#111827' }}>Focus Vehicle...</option>
            {buses.map(b => (
              <option key={b.id} value={b.id} style={{ background: '#111827' }}>{b.id} ({b.route.split('-')[1]?.trim()})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Floating Zoom & Bounds controls */}
      <div style={{ 
        position: 'absolute', 
        bottom: 10, 
        right: 10, 
        zIndex: 1000, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 6 
      }}>
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

      {/* 3. Floating Map Legend indicator */}
      <div className="glass" style={{ 
        position: 'absolute', 
        bottom: 10, 
        left: 10, 
        zIndex: 1000, 
        padding: '6px 10px', 
        borderRadius: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4, 
        fontSize: '0.58rem' 
      }}>
        <div className="flex items-center gap-xs">
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-muted)' }}>En Route / Normal</span>
        </div>
        <div className="flex items-center gap-xs">
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Delayed Status</span>
        </div>
        <div className="flex items-center gap-xs">
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--error)' }} className="animate-ping" />
          <span style={{ color: 'var(--text-muted)' }}>Overheat Incident</span>
        </div>
      </div>

      {/* The Map Div */}
      <div 
        id="admin-leaflet-fleet-map" 
        style={{ 
          height: 320, 
          width: '100%', 
          background: '#070a13',
          border: '1px solid var(--glass-border)',
          zIndex: 1
        }} 
      />
    </div>
  );
}
