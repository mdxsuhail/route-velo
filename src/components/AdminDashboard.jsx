import React from 'react';
import { Camera } from 'lucide-react';
import { useSimulation, playSound, speakText, sanitizeInput } from '../context/SimulationContext';
import AdminFleetMap from './AdminFleetMap';
import Header from './Header';

export default function AdminDashboard() {
  const {
    parcels,
    buses, setBuses,
    globalBroadcast, setGlobalBroadcast,
    appLanguage,
    bypassEvidenceList,
    incidentLogs,
    addLog,
    t,
    stopsList, setStopsList
  } = useSimulation();

  const [destMode, setDestMode] = React.useState('select'); // 'select' or 'custom'

  // Analytics calculations
  const totalRevenue = parcels.reduce((sum, p) => sum + p.totalFare, 0) + 142500;
  const activeParcelsCount = parcels.filter(p => p.status !== 'Delivered').length;
  const totalParcels = parcels.length + 8;
  const onTimeRate = 94.2;

  // Sparkline SVG data
  const sparkRevenue = [42,55,48,62,58,70,78,65,80,88,95,Math.min(totalRevenue/2000,110)];
  const sparkParcels = [800,920,870,1010,980,1100,1060,1180,1240,1200,1284,totalParcels];
  const maxRev = Math.max(...sparkRevenue);
  const maxP = Math.max(...sparkParcels);
  const revPoints = sparkRevenue.map((v,i) => `${i*(110/11)},${32-(v/maxRev)*28}`).join(' ');
  const parcelPoints = sparkParcels.map((v,i) => `${i*(110/11)},${32-(v/maxP)*28}`).join(' ');

  // Route performance
  const routePerf = [
    { route: 'BLR – Mysuru', parcels: 412, revenue: 18400, onTime: 96.1, trend: 'up' },
    { route: 'BLR – Mangaluru', parcels: 318, revenue: 15200, onTime: 91.8, trend: 'up' },
    { route: 'BLR – Hubli', parcels: 287, revenue: 12600, onTime: 93.5, trend: 'down' },
    { route: 'BLR – Belagavi', parcels: 198, revenue: 9100, onTime: 94.0, trend: 'up' },
    { route: 'BLR – Ballari', parcels: 69, revenue: 3100, onTime: 88.4, trend: 'down' },
  ];
  const barMax = Math.max(...routePerf.map(r=>r.parcels));

  // Activity feed
  const activityFeed = [
    { icon: '📦', label: 'Parcel RV-3821 departed', route: 'BLR→Mysuru', time: '2 min ago', color: '#3b82f6' },
    { icon: '✅', label: 'Parcel RV-3807 delivered', route: 'BLR→Mangaluru', time: '8 min ago', color: '#10b981' },
    { icon: '⚠️', label: 'Bus KA-44 fuel low (18%)', route: 'BLR→Hubli', time: '15 min ago', color: '#f59e0b' },
    { icon: '📦', label: 'Parcel RV-3799 in transit', route: 'BLR→Belagavi', time: '22 min ago', color: '#3b82f6' },
    { icon: '✅', label: 'Parcel RV-3795 delivered', route: 'BLR→Mysuru', time: '31 min ago', color: '#10b981' },
    { icon: '🔴', label: 'Locker L-04 door ajar', route: 'Majestic Hub', time: '45 min ago', color: '#ef4444' },
  ];

  return (
    <div className="animate-fade-in pb-32">
      <Header title="Admin CommandCenter" />

      {/* PREMIUM KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ padding: 14, background: 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(59,130,246,0.06))', border: '1px solid rgba(59,130,246,0.25)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>TOTAL PARCELS</div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'white', marginBottom: 2 }}>{totalParcels.toLocaleString()}</div>
          <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 600 }}>↑ +12% this week</div>
          <svg viewBox="0 0 110 36" style={{ position: 'absolute', bottom: 0, right: 0, width: 80, opacity: 0.5 }}>
            <polyline points={parcelPoints} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="card" style={{ padding: 14, background: 'linear-gradient(135deg,rgba(16,185,129,0.18),rgba(16,185,129,0.06))', border: '1px solid rgba(16,185,129,0.25)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>REVENUE TODAY</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: 2 }}>₹{totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 600 }}>↑ +8% vs yesterday</div>
          <svg viewBox="0 0 110 36" style={{ position: 'absolute', bottom: 0, right: 0, width: 80, opacity: 0.5 }}>
            <polyline points={revPoints} fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="card" style={{ padding: 14, background: 'linear-gradient(135deg,rgba(168,85,247,0.18),rgba(168,85,247,0.06))', border: '1px solid rgba(168,85,247,0.25)' }}>
          <div style={{ fontSize: '0.6rem', color: '#a855f7', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>ACTIVE ROUTES</div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'white', marginBottom: 2 }}>{buses.length + 4}</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fleet operational</div>
        </div>
        <div className="card" style={{ padding: 14, background: 'linear-gradient(135deg,rgba(245,158,11,0.18),rgba(245,158,11,0.06))', border: '1px solid rgba(245,158,11,0.25)', position: 'relative' }}>
          <div style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>ON-TIME RATE</div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'white', marginBottom: 2 }}>{onTimeRate}%</div>
          <svg viewBox="0 0 36 36" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 38 }}>
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="3"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="3"
              strokeDasharray={`${onTimeRate * 0.879} 87.9`} strokeLinecap="round"
              style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}/>
          </svg>
        </div>
      </div>

      {/* Global Fleet Map Tracker */}
      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Global Fleet Map Tracker</h4>
      <div className="card" style={{ padding: 12, marginBottom: 16 }}>
        <AdminFleetMap />
      </div>

      {/* Admin Custom Fleet Bus Dispatcher Form */}
      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Schedule & Dispatch Bus Ride</h4>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
         <form onSubmit={(e) => {
           e.preventDefault();
           const busId = sanitizeInput(e.target.busId.value.trim().toUpperCase(), 15);
           const busType = e.target.busType.value;
           const driverName = sanitizeInput(e.target.driverName.value.trim(), 50) || 'Chennappa G.';
           const depTime = sanitizeInput(e.target.depTime.value.trim(), 20) || '10:30 AM';
           
           let destination = '';
           if (destMode === 'custom') {
             destination = sanitizeInput(e.target.customDest.value.trim(), 100);
             if (!destination) {
               alert('Please enter a custom destination name');
               return;
             }
             // Add to stopsList if not already present
             if (!stopsList.includes(destination)) {
               setStopsList(prev => [...prev, destination]);
               addLog(`ADMIN: Added new destination kiosk ${destination} to stops database.`);
             }
           } else {
             destination = e.target.selectDest.value;
           }
           
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
           
           // Generate clean route name (e.g. Bengaluru - Mysuru)
           const destCity = destination.replace(' KSRTC Bus Stand', '').replace(' Central Bus Stand', '').replace(' Bus Depot', '').replace(' Transit Hub', '');
           const route = `Bengaluru - ${destCity}`;
           
           const newBus = {
             id: busId,
             route,
             type: busType,
             category,
             eta: `Departs at ${depTime}`,
             location: 'Kempegowda Bus Station (Majestic), Bengaluru',
             status: 'Scheduled',
             progress: 0,
             speed: 0,
             rpm: 800,
             temp: 75,
             fuel: 100,
             driverName,
             depTime,
             tirePressure: { fl: 35, fr: 35, rl: 36, rr: 36 }
           };
           
           playSound('chime');
           setBuses(prev => [...prev, newBus]);
           addLog(`ADMIN: Scheduled new bus ride ${busId} (${busType}) on route ${route} assigned to driver ${driverName} departing at ${depTime}.`);
           
           const text = appLanguage === 'Kannada'
             ? `ಹೊಸ ಬಸ್ ಸಂಖ್ಯೆ ${busId} ನಿಯೋಜಿಸಲಾಗಿದೆ.`
             : appLanguage === 'Hindi'
             ? `नया बस संख्या ${busId} तैनात किया गया है।`
             : `Scheduled bus ride ${busId} to ${destCity}`;
           speakText(text, appLanguage);
           e.target.reset();
           setDestMode('select');
         }} className="flex flex-col gap-md">
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
             <div className="input-group">
               <label className="input-label" style={{ fontSize: '0.72rem' }}>Bus ID / License Plate</label>
               <input type="text" name="busId" placeholder="e.g. KA-09-F-8899" required style={{ fontSize: '0.8rem', padding: '8px 10px' }} />
             </div>
             <div className="input-group">
               <label className="input-label" style={{ fontSize: '0.72rem' }}>Bus Service Tier</label>
               <select name="busType" style={{ fontSize: '0.8rem', padding: '8px 10px', height: 38 }}>
                 <option value="Airavat Club Class">Airavat Volvo (Express)</option>
                 <option value="Rajahamsa">Rajahamsa Express (Standard)</option>
                 <option value="Karnataka Sarige">Karnataka Sarige (Economy)</option>
               </select>
             </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
             <div className="input-group">
               <label className="input-label" style={{ fontSize: '0.72rem' }}>Assigned Driver/Conductor</label>
               <input type="text" name="driverName" placeholder="e.g. Ramesh Kumar" required style={{ fontSize: '0.8rem', padding: '8px 10px' }} />
             </div>
             <div className="input-group">
               <label className="input-label" style={{ fontSize: '0.72rem' }}>Departure Time</label>
               <input type="text" name="depTime" placeholder="e.g. 10:30 AM" required style={{ fontSize: '0.8rem', padding: '8px 10px' }} />
             </div>
           </div>

           <div className="input-group">
             <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
               <label className="input-label" style={{ fontSize: '0.72rem', marginBottom: 0 }}>Destination Stand</label>
               <button 
                 type="button" 
                 onClick={() => { playSound('click'); setDestMode(destMode === 'select' ? 'custom' : 'select'); }}
                 style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
               >
                 {destMode === 'select' ? '✍️ Add Custom City' : '📋 Choose Existing Stand'}
               </button>
             </div>

             {destMode === 'select' ? (
               <select name="selectDest" style={{ fontSize: '0.8rem', padding: '8px 10px', height: 38 }}>
                 {stopsList.filter(s => s !== "Kempegowda Bus Station (Majestic), Bengaluru" && s !== "Kengeri Transit Hub, Bengaluru").map(stop => (
                   <option key={stop} value={stop}>{stop}</option>
                 ))}
               </select>
             ) : (
               <input type="text" name="customDest" placeholder="e.g. Chikmagalur KSRTC Bus Stand" required style={{ fontSize: '0.8rem', padding: '8px 10px' }} />
             )}
           </div>

           <button type="submit" className="btn btn-primary w-full" style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: 700 }}>
             Schedule & Dispatch Bus Ride
           </button>
         </form>
      </div>

      {/* SVG Historical Area Chart */}
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
            <g>
              <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="20" y1="55" x2="280" y2="55" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="20" y1="90" x2="280" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </g>
            <path 
              d="M 20 90 Q 50 60 90 80 T 170 50 T 250 40 T 280 25 L 280 90 Z" 
              fill="url(#areaGradExpress)" 
            />
            <path 
              d="M 20 90 Q 50 60 90 80 T 170 50 T 250 40 T 280 25" 
              fill="none" 
              stroke="var(--primary)" 
              strokeWidth="2.5" 
              strokeLinejoin="round" 
            />
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
                 <div style={{ aspectRatio: '4/3', background: '#1e293b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 6 }}>
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
                 <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{log.time}</span>
               </div>
               <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{log.desc}</p>
             </div>
           ))}
         </div>
      </div>

      {/* Route Bar Chart */}
      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>Parcel Volume by Route</h4>
      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        {routePerf.map((r, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div className="flex justify-between" style={{ fontSize: '0.7rem', marginBottom: 3 }}>
              <span style={{ fontWeight: 600 }}>{r.route}</span>
              <span style={{ color: 'var(--text-muted)' }}>{r.parcels} parcels</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(r.parcels/barMax)*100}%`, borderRadius: 4,
                background: ['linear-gradient(90deg,#3b82f6,#60a5fa)','linear-gradient(90deg,#a855f7,#c084fc)','linear-gradient(90deg,#10b981,#34d399)','linear-gradient(90deg,#f59e0b,#fbbf24)','linear-gradient(90deg,#ef4444,#f87171)'][i],
                transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>Real-Time Activity</h4>
      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        {activityFeed.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: i < activityFeed.length-1 ? 10 : 0, marginBottom: i < activityFeed.length-1 ? 10 : 0, borderBottom: i < activityFeed.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.label}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.route} • {item.time}</div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, marginTop: 5, flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* Route Performance Table */}
      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>Route Performance</h4>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['Route','Pkgs','Revenue','On-Time','Trend'].map(h => (
                <th key={h} style={{ padding: '8px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routePerf.map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '8px 8px', fontWeight: 600 }}>{r.route}</td>
                <td style={{ padding: '8px 8px', color: '#3b82f6', fontWeight: 700 }}>{r.parcels}</td>
                <td style={{ padding: '8px 8px', color: '#10b981' }}>₹{r.revenue.toLocaleString()}</td>
                <td style={{ padding: '8px 8px' }}>
                  <span style={{ background: r.onTime >= 93 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: r.onTime >= 93 ? '#10b981' : '#f59e0b', padding: '2px 6px', borderRadius: 99, fontWeight: 700 }}>{r.onTime}%</span>
                </td>
                <td style={{ padding: '8px 8px', color: r.trend === 'up' ? '#10b981' : '#ef4444', fontWeight: 800 }}>{r.trend === 'up' ? '↑' : '↓'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live buses telemetry table */}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 10 }}>Active Fleet Monitors</h3>
      <div className="flex flex-col gap-sm">
         {buses.map(bus => (
           <div key={bus.id} className="card" style={{ padding: 14, border: bus.status === 'Warning' ? '1px solid rgba(239,68,68,0.35)' : '1px solid var(--glass-border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                 <div>
                   <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{bus.id}</span>
                   <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 6 }}>{bus.type}</span>
                 </div>
                 <span className={`badge ${bus.status === 'Warning' ? 'badge-error' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>{bus.status}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 8 }}>{bus.route}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                {[
                  { label: 'Fuel', val: bus.fuel, color: bus.fuel < 25 ? '#ef4444' : '#10b981', display: `${bus.fuel}%` },
                  { label: 'Speed', val: Math.round((bus.speed/120)*100), color: '#3b82f6', display: `${bus.speed}km/h` },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between" style={{ fontSize: '0.6rem', marginBottom: 2 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                      <span style={{ color: m.color, fontWeight: 700 }}>{m.display}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', width: `${m.val}%`, borderRadius: 2, background: m.color, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                ))}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
