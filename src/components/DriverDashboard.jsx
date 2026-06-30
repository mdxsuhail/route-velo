import React from 'react';
import { Star, Camera, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useSimulation, playSound, speakText, sanitizeInput 
} from '../context/SimulationContext';
import Header from './Header';

export default function DriverDashboard() {
  const {
    buses, setBuses,
    parcels, setParcels,
    lockers,
    appLanguage,
    driverCheckedIn, setDriverCheckedIn,
    driverCashBalance,
    conductorBreakActive, setConductorBreakActive,
    conductorBreakTimer, setConductorBreakTimer,
    setBypassEvidenceList,
    driverBusId, setDriverBusId,
    driverScannerOpen, setDriverScannerOpen,
    driverScannerStage, setDriverScannerStage,
    scannedParcelId, setScannedParcelId,
    bypassCameraOpen, setBypassCameraOpen,
    geofenceActive,
    geofenceTimer,
    setSystemAlerts,
    troubleshootType, setTroubleshootType,
    troubleshootStep, setTroubleshootStep,
    addLog,
    toggleMic,
    micActive,
    voiceTranscript,
    processVoiceCommand,
    deliverParcel,
    adHocDropParcel,
    depositParcelInLocker,
    startOtpGeofence,
    t
  } = useSimulation();

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
    
    setTimeout(() => {
      playSound('beep');
      setDriverScannerStage('success');
    }, 1500);
  };

  const completeScanningTransition = () => {
    const p = parcels.find(item => item.id === scannedParcelId);
    if (p) {
      if (p.status === 'Pending') {
        setParcels(prev => prev.map(item => item.id === scannedParcelId ? {
          ...item,
          status: 'In_Transit',
          history: [...item.history, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg: `Scanned by conductor. Loaded on Bus ${activeBus.id}` }]
        } : item));
        addLog(`DRIVER: Scanned and loaded parcel ${scannedParcelId} on Bus ${activeBus.id}.`);
      } else if (p.status === 'In_Transit') {
        deliverParcel(scannedParcelId);
      }
    }
    setDriverScannerOpen(false);
    setDriverScannerStage('idle');
  };

  if (!driverCheckedIn) {
    return (
      <div className="animate-fade-in pb-32">
        <Header title="Driver Shift Sign-In" />
        <div className="card flex flex-col gap-md" style={{ padding: 18 }}>
          <h4 style={{ fontWeight: 800, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6 }}>Pre-Shift Safety Verification</h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confirm safety status before launching transit route schedules.</p>
          
          <div className="input-group" style={{ marginBottom: 4 }}>
            <label className="input-label" style={{ fontSize: '0.75rem' }}>Assigned KSRTC Bus ID</label>
            <select
              value={driverBusId}
              onChange={e => { playSound('click'); setDriverBusId(e.target.value); }}
              style={{ width: '100%', height: 38, fontSize: '0.8rem', padding: '8px 10px' }}
            >
              {buses.map(b => (
                <option key={b.id} value={b.id}>{b.id} ({b.type} - {b.route})</option>
              ))}
            </select>
          </div>

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
        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>Shift Active • Conductor {activeBus.driverName || 'Manjunath'}</span>
        <button 
          onClick={() => { playSound('click'); setDriverCheckedIn(false); addLog('DRIVER: Signed off shift.'); }}
          style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Sign Out Shift
        </button>
      </div>
      
      <Header title="Driver Console" />

      {/* === DRIVER ROUTE TIMELINE STRIP === */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 14, background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.06))', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: '0.62rem', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.07em' }}>ACTIVE ROUTE</span>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginTop: 2 }}>{activeBus.route}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>ETA</span>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: activeBus.eta && activeBus.eta.includes('Delayed') ? '#ef4444' : '#10b981' }}>{activeBus.eta}</div>
          </div>
        </div>
        
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#3b82f6,#10b981)', width: `${activeBus.progress || 35}%`, transition: 'width 1s ease' }} />
          </div>
          <div style={{ position: 'absolute', left: `${activeBus.progress || 35}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: '#3b82f6', border: '2.5px solid white', boxShadow: '0 0 8px rgba(59,130,246,0.6)', transition: 'left 1s ease' }} />
        </div>
        <div className="flex justify-between" style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
          <span>{activeBus.route.split('-')[0]?.trim() || 'Origin'}</span>
          <span style={{ color: '#3b82f6', fontWeight: 700 }}>{activeBus.progress || 35}% complete</span>
          <span>{activeBus.route.split('-')[1]?.trim() || 'Dest'}</span>
        </div>
      </div>

      {/* === DRIVER TODAY STAT BAR === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div className="card" style={{ padding: '10px 8px', textAlign: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{driverParcels.filter(p => p.status === 'Delivered').length}</div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Delivered</div>
        </div>
        <div className="card" style={{ padding: '10px 8px', textAlign: 'center', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{driverParcels.filter(p => p.status !== 'Delivered').length}</div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pending</div>
        </div>
        <div className="card" style={{ padding: '10px 8px', textAlign: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#3b82f6' }}>₹{driverCashBalance}</div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Revenue</div>
        </div>
      </div>

      {/* Bus selector */}
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
              setBuses(prev => prev.map(b => b.id === activeBus.id ? { ...b, speed: 8, eta: 'Delayed +45m', status: 'Delayed' } : b));
              
              setSystemAlerts(prev => [
                { id: Date.now(), title: `Traffic Alert: Bus ${activeBus.id}`, message: `Conductor reports heavy traffic delay. Expected ETA updated to +45 mins.`, type: 'alert', time: 'Just now' },
                ...prev
              ]);
              
              setToast({ title: 'Traffic Jam Delay Surcharge', message: `Bus ${activeBus.id} has reported heavy traffic jam on Mysuru Road.` });
              
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

        {activeBus.status === 'Delayed' && (
          <button
            className="btn btn-primary animate-fade-in"
            style={{ padding: '10px', fontSize: '0.75rem', background: 'var(--success)', border: 'none', color: 'white', fontWeight: 800 }}
            onClick={() => {
              playSound('chime');
              setBuses(prev => prev.map(b => b.id === activeBus.id ? { ...b, speed: 50, eta: 'Delayed +10m (Rerouted)', status: 'En Route (Rerouted)' } : b));
              
              setSystemAlerts(prev => [
                { id: Date.now(), title: `Reroute Active: Bus ${activeBus.id}`, message: `Conductor bypassed traffic via an alternative local route. Delay reduced.`, type: 'success', time: 'Just now' },
                ...prev
              ]);
              setToast({ title: 'Transit Rerouted', message: `Alternative route active. Delay minimized for ${activeBus.id}.` });
              
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
          
          <div className="flex items-center gap-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 6 }}>
            <input 
              type="text" 
              placeholder="Simulate voice command (e.g. traffic, break, guide)..." 
              style={{ padding: '6px 10px', fontSize: '0.68rem', height: 26, background: 'rgba(0,0,0,0.1)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const phrase = e.target.value.trim().toLowerCase();
                  addLog(`VOICE (SIMULATED): Heard command "${phrase}"`);
                  processVoiceCommand(phrase);
                  e.target.value = '';
                }
              }}
            />
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
            Supported commands: <strong>traffic</strong>, <strong>break</strong>, <strong>refuel</strong>, <strong>guide</strong>, <strong>clear</strong>, <strong>bypass</strong>.
          </div>
        </div>
      </div>

      {/* Telemetry Troubleshooting Alert */}
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
            <div key={p.id} className="card" style={{ padding: 14, border: p.status === 'Delivered' ? '1px solid rgba(16,185,129,0.25)' : p.status === 'In_Transit' ? '1px solid rgba(59,130,246,0.25)' : '1px solid var(--glass-border)' }}>
              <div className="flex justify-between items-start">
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-xs" style={{ marginBottom: 4 }}>
                    <span className={`badge ${p.status === 'Delivered' ? 'badge-success' : p.status === 'In_Transit' ? 'badge-primary' : 'badge-pending'}`} style={{ fontSize: '0.58rem' }}>{p.status.replace('_', ' ')}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{p.category || 'Standard'}</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{p.id}</h4>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.destination.split(',')[0]}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>OTP</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f59e0b', letterSpacing: 2 }}>{p.deliveryOtp}</div>
                </div>
              </div>

              {p.status === 'Pending' && (
                <button className="btn btn-primary w-full" style={{ padding: '8px 16px', fontSize: '0.8rem', marginTop: 10 }} onClick={() => triggerScanner(p.id)}>
                   <ScanLine size={16} /> Scan QR to Pickup Load
                </button>
              )}

              {p.status === 'In_Transit' && (
                <div style={{ marginTop: 10 }} className="flex flex-col gap-sm">
                  <div className="flex gap-sm">
                    <input 
                      type="text" 
                      placeholder="Enter OTP"
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

      {/* Geofence scheduler */}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 4600, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: 20 }}>
             <div className="card w-full" style={{ maxWidth: 360, textAlign: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', justify: 'center', gap: 6, fontWeight: 800 }}>
                  🔧 {troubleshootType === 'engine_heat' ? 'Radiator Coolant Troubleshoot' : 'Tire Inflation Troubleshoot'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '8px 0 16px' }}>
                  {troubleshootType === 'engine_heat' ? 'Perform manual radiator check and air bleed sequence.' : 'Connect emergency air compressor valve to low pressure tire.'}
                </p>
                
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
}
