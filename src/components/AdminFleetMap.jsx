import React, { useEffect, useRef } from 'react';
import { useSimulation, getRealRouteCoordinates } from '../context/SimulationContext';

export default function AdminFleetMap() {
  const { buses } = useSimulation();
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef([]);

  useEffect(() => {
    if (!window.L) return;

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
    if (!map || !window.L) return;

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
}
