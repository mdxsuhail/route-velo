import React from 'react';
import { 
  Package, 
  User, 
  PlusCircle, 
  Activity, 
  History, 
  Wrench,
  Home,
  Signal,
  Wifi,
  Battery
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimulationProvider, useSimulation } from './context/SimulationContext';

// Import modular view components
import AuthPage from './components/AuthPage';
import CustomerDashboard from './components/CustomerDashboard';
import BookingFlow from './components/BookingFlow';
import OrderHistoryView from './components/OrderHistoryView';
import TrackingView from './components/TrackingView';
import UserProfileView from './components/UserProfileView';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const {
    currentUser, setCurrentUser,
    activeTab, setActiveTab,
    weather,
    globalBroadcast,
    toast, setToast,
    t,
    playSound,
    advanceSimulationTime,
    injectAlert,
    logs,
    showConfetti,
    confettiParticles,
    theme, setTheme
  } = useSimulation();

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
        
        {/* Mock Status Bar */}
        <div className="mock-status-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800 }}>9:30</span>
            <button 
              onClick={() => { playSound('click'); setTheme(t => t === 'dark' ? 'light' : 'dark'); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '0.9rem', 
                padding: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                outline: 'none',
                opacity: 0.85
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          <div className="status-icons">
            <Signal size={14} />
            <Wifi size={14} />
            <Battery size={16} />
          </div>
        </div>

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
              <nav className="floating-bottom-nav">
                {currentUser === 'Admin' ? (
                  <button className="nav-item-btn active">
                    <Activity size={20} />
                    <span className="nav-label">Command Center</span>
                  </button>
                ) : currentUser === 'Driver' ? (
                  <button className="nav-item-btn active">
                    <Package size={20} />
                    <span className="nav-label">Inventory Manifest</span>
                  </button>
                ) : (
                  <>
                    <button 
                      className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
                      onClick={() => { playSound('click'); setActiveTab('dashboard'); }}
                    >
                      <Home size={20} />
                      {activeTab === 'dashboard' && <span className="nav-label">Home</span>}
                    </button>
                    <button 
                      className={`nav-item-btn ${activeTab === 'booking' ? 'active' : ''}`} 
                      onClick={() => { playSound('click'); setActiveTab('booking'); }}
                    >
                      <PlusCircle size={20} />
                      {activeTab === 'booking' && <span className="nav-label">Book</span>}
                    </button>
                    <button 
                      className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`} 
                      onClick={() => { playSound('click'); setActiveTab('history'); }}
                    >
                      <History size={20} />
                      {activeTab === 'history' && <span className="nav-label">History</span>}
                    </button>
                    <button 
                      className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`} 
                      onClick={() => { playSound('click'); setActiveTab('profile'); }}
                    >
                      <User size={20} />
                      {activeTab === 'profile' && <span className="nav-label">Profile</span>}
                    </button>
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

         <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
           This deck enables operational simulation of peer-to-transit bus logistics, connecting Customer, Conductor, and Admin roles in a unified sandbox.
         </p>

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

export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}
