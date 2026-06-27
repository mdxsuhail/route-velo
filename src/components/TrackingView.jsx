import React, { useState } from 'react';
import { ChevronRight, ShieldAlert, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useSimulation, playSound, speakText, sanitizeInput, getRealRouteStops, getRealRouteCoordinates 
} from '../context/SimulationContext';
import LiveVectorTrackingMap from './LiveVectorTrackingMap';
import VeloBotChat from './VeloBotChat';

export default function TrackingView() {
  const {
    selectedParcel,
    parcels, setParcels,
    buses, setBuses,
    weather,
    appLanguage,
    setActiveTab,
    setWalletBalance,
    setTransactions,
    addLog,
    t
  } = useSimulation();

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
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: 6 }}>
                <span>2:56 PM — 4:31 PM</span>
                <span style={{ color: 'var(--primary-light)', marginLeft: 'auto' }}>1 hr 34 min</span>
              </div>

              <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }} className="flex-wrap">
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>🚶 1.5 km</span>
                <span style={{ fontSize: '0.65rem' }}>➜</span>
                <span className="gps-line-badge violet">Violet Line</span>
                <span style={{ fontSize: '0.65rem' }}>➜</span>
                <span className="gps-line-badge red">Red Line</span>
                <span style={{ fontSize: '0.65rem' }}>➜</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>🚶 800m</span>
              </div>

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

              <div className="gps-timeline">
                <div style={{ position: 'relative', paddingBottom: 16 }}>
                  <div className="gps-timeline-node active" />
                  <div className="gps-timeline-segment-line violet" style={{ height: '100%', top: 6 }} />
                  <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-main)' }}>Start from: Majestic Kiosk</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>2:56 PM</span>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Walk 1.5 km (21 min) to platform stand.</p>
                </div>

                <div style={{ position: 'relative', paddingBottom: 16 }}>
                  <div className="gps-timeline-node active" />
                  <div className="gps-timeline-segment-line red" style={{ height: '100%', top: 6 }} />
                  
                  <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-main)' }}>Board Platform stand</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>3:18 PM</span>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--primary-light)', fontWeight: 700, marginTop: 2 }}>
                    Ride KSRTC bus {parcel.bus || 'AW-102'} (Violet Line transit)
                  </p>

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
                            <div key={i} style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.65rem' }}>
                              <span style={{ color: isPassed ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {isPassed ? '✅' : '⚪'} {stop.name}
                              </span>
                              <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{stop.time}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div className={`gps-timeline-node ${busObj && busObj.progress >= 100 ? 'active' : ''}`} />
                  <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-main)' }}>🏁 Locker Handover Kiosk</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>4:31 PM</span>
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
}
