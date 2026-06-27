import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useSimulation, playSound, sanitizeInput } from '../context/SimulationContext';
import Header from './Header';

export default function UserProfileView() {
  const {
    appLanguage, setAppLanguage,
    theme, setTheme,
    unlockedThemes, setUnlockedThemes,
    routeCoins, setRouteCoins,
    userBadge,
    addLog,
    t
  } = useSimulation();

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
}
