import React from 'react';
import { Wifi, Bell, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation, playSound } from '../context/SimulationContext';

export default function Header({ title }) {
  const {
    isOffline, setIsOffline,
    theme, setTheme,
    notificationsOpen, setNotificationsOpen,
    hasUnread, setHasUnread,
    menuOpen, setMenuOpen,
    notifications,
    currentUser, setCurrentUser
  } = useSimulation();

  return (
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
             onClick={() => { playSound('click'); setTheme(t => t === 'dark' ? 'light' : 'dark'); }} 
             style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}
          >
             {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {/* Connectivity toggle */}
          <button 
             onClick={() => { playSound('click'); setIsOffline(!isOffline); }} 
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
}
