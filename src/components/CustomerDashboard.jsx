import React, { useState } from 'react';
import { 
  Search, Sun, CloudRain, CloudFog, Lock, Star, Coins, HelpCircle, 
  Package, CreditCard, MapPin, Activity, History, Bell, User, ArrowRightLeft, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useSimulation, playSound, speakText 
} from '../context/SimulationContext';
import userAvatar from '../user_avatar.png';

export default function CustomerDashboard() {
  const {
    parcels, setParcels,
    buses,
    walletBalance, setWalletBalance,
    transactions, setTransactions,
    weather,
    lockers, setLockers,
    routeCoins, setRouteCoins,
    unlockedThemes, setUnlockedThemes,
    userBadge, setUserBadge,
    coupons, setCoupons,
    appLanguage,
    setActiveTab,
    setSelectedParcel,
    addLog,
    triggerConfettiEffect,
    hasUnread, setHasUnread,
    notificationsOpen, setNotificationsOpen,
    notifications,
    t
  } = useSimulation();

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
  const [activeLockerClaim, setActiveLockerClaim] = useState(null);

  const activeOrdersList = parcels
    .filter(p => filter === 'All' || p.type === filter)
    .filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.destination.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fade-in pb-32">
       {/* Mockup Top Header Row */}
       <div className="dashboard-premium-header">
         <div className="header-profile-section">
           <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
             <img src={userAvatar} alt="Muhammad Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           </div>
           <div>
             <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Hello,</div>
             <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>Muhammad</div>
           </div>
         </div>
         
         <div className="flex items-center gap-sm" style={{ position: 'relative' }}>
           <div className="header-credit-badge" onClick={() => { playSound('click'); setShowTopUp(true); }}>
             <Coins size={14} color="var(--primary)" />
             <span className="header-credit-amount">₹{walletBalance.toLocaleString()}</span>
             <span className="header-credit-label">Top up</span>
           </div>
           
           <button 
             className="header-bell-button"
             onClick={() => { playSound('click'); setNotificationsOpen(!notificationsOpen); setHasUnread(false); }}
           >
             <Bell size={18} />
             {hasUnread && <div className="header-bell-unread-dot" />}
           </button>

           <AnimatePresence>
             {notificationsOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                 className="card" style={{ position: 'absolute', top: 50, right: 0, zIndex: 100, width: 280, padding: 16, maxHeight: 300, overflowY: 'auto' }}
               >
                 <h4 style={{ fontWeight: 800, marginBottom: 12, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6, fontSize: '0.82rem' }}>Operational Alerts</h4>
                 {notifications.map(n => (
                   <div key={n.id} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--glass-border)' }}>
                     <div className="flex justify-between items-start">
                       <span style={{ fontWeight: 800, fontSize: '0.75rem', color: n.type === 'alert' ? 'var(--accent)' : 'var(--success)' }}>{n.title}</span>
                       <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{n.time}</span>
                     </div>
                     <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</p>
                   </div>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
         </div>
       </div>

       {/* Mockup Title Header */}
       <div style={{ marginBottom: 20 }}>
         <span style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>RouteVelo Logistics</span>
         <h1 style={{ fontSize: '1.9rem', fontWeight: 900, marginTop: 4, color: 'var(--text-main)', lineHeight: 1.2 }}>Hello Muhammad,<br/>Where to send?</h1>
       </div>
       
       {/* Search Destination bar linking to Booking Flow */}
       <div className="card flex items-center justify-between" style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--input-bg)', borderRadius: '20px' }}>
         <div className="flex items-center gap-sm w-full" onClick={() => { playSound('click'); setActiveTab('booking'); }} style={{ cursor: 'pointer' }}>
           <Search color="var(--text-muted)" size={18} />
           <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Enter destination stop...</span>
         </div>
         <div 
           className="flex items-center justify-center" 
           style={{ background: 'var(--primary)', width: 34, height: 34, borderRadius: '12px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 8px var(--primary-glow)' }}
           onClick={() => { playSound('click'); setActiveTab('tracking'); }}
         >
           <Compass size={18} />
         </div>
       </div>

       {/* Mockup Category Bubble List */}
        <div className="categories-container" style={{ justifyContent: 'center', gap: 20 }}>
          {[
            { id: 'All', label: 'All Cargo', icon: '📦' },
            { id: 'Sending', label: 'Sending', icon: '📤' },
            { id: 'Receiving', label: 'Receiving', icon: '📥' }
          ].map(cat => {
            const isActive = filter === cat.id;
            return (
              <div 
                key={cat.id} 
                className={`category-item ${isActive ? 'active' : ''}`}
                onClick={() => { playSound('click'); setFilter(cat.id); }}
                style={{ flex: '0 1 80px' }}
              >
                <div className="category-bubble">
                  <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                </div>
                <span className="category-tag-label">{cat.label}</span>
              </div>
            );
          })}
        </div>

       {/* Journey Node Card */}
       <div className="journey-card">
         <div className="journey-node-row">
           <div className="journey-node">
             <div className="journey-node-label">From</div>
             <div className="journey-node-value">BLR</div>
             <div className="journey-node-sub">Kempegowda Majestic</div>
           </div>
           
           <div className="journey-divider-line" onClick={() => { playSound('click'); setActiveTab('booking'); }}>
             <ArrowRightLeft size={16} style={{ transform: 'rotate(90deg)', color: 'var(--primary)' }} />
           </div>

           <div className="journey-node" style={{ textAlign: 'right' }}>
             <div className="journey-node-label">To</div>
             <div className="journey-node-value">MYS</div>
             <div className="journey-node-sub">Mysuru Central</div>
           </div>
         </div>

         <div className="journey-details-row">
           <div className="journey-detail-item" onClick={() => setActiveTab('booking')} style={{ cursor: 'pointer' }}>
             <label>Departing on</label>
             <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Select Date</span>
           </div>
           <div className="journey-detail-item" onClick={() => setActiveTab('booking')} style={{ cursor: 'pointer' }}>
             <label>Cargo load</label>
             <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>1 Passenger / Item</span>
           </div>
         </div>

         <button 
           className="journey-search-btn-black" 
           onClick={() => { playSound('click'); setActiveTab('booking'); }}
         >
           Search
         </button>
       </div>

       {/* Weather & Locker Quick Actions Row */}
       <div className="flex gap-md" style={{ marginBottom: 20 }}>
         <div className="card flex-1 flex items-center gap-sm" style={{ padding: '12px', background: 'var(--input-bg)' }}>
           {weather === 'Clear' && <Sun color="var(--accent)" size={22} />}
           {weather === 'Rainy' && <CloudRain color="var(--primary-light)" size={22} className="animate-pulse" />}
           {weather === 'Foggy' && <CloudFog color="var(--text-muted)" size={22} />}
           <div>
             <h4 style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800 }}>Weather: {weather}</h4>
             <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
               {weather === 'Clear' ? 'Schedules active' : weather === 'Rainy' ? '30% Transit Delay' : '50% Visibility Delay'}
             </span>
           </div>
         </div>

         <button className="btn btn-secondary flex-1" style={{ padding: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 48, borderRadius: 16 }} onClick={() => { playSound('click'); setActiveLockerClaim('select_locker'); }}>
           <Lock size={14} color="var(--accent)" /> Locker Pickup
         </button>
       </div>

       {/* Streaks, Coins and FAQ widgets */}
       <div className="flex gap-md" style={{ marginBottom: 20 }}>
         {/* Streak Widget */}
         <div className="card flex-1 flex flex-col justify-center items-center" style={{ border: '1.5px solid var(--primary)', background: 'var(--primary-glow)', cursor: 'pointer', padding: '10px' }} onClick={() => { playSound('click'); setShowStreak(true); }}>
            <Star color="var(--primary)" fill="var(--primary)" size={16} style={{ marginBottom: 4 }} />
            <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '0.7rem' }}>{t.streakTitle}</h4>
            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Claim rewards</span>
         </div>

         {/* RouteCoins Shop Widget */}
         <div className="card flex-1 flex flex-col justify-center items-center" style={{ padding: '10px', border: '1px solid var(--glass-border)', cursor: 'pointer' }} onClick={() => { playSound('click'); setShowCoinsShop(true); }}>
            <Coins color="var(--accent)" size={16} style={{ marginBottom: 4 }} />
            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-main)' }}>Shop</h4>
            <span style={{ fontSize: '0.58rem', color: 'var(--accent)', fontWeight: 700 }}>₹{routeCoins} Coins</span>
         </div>

         {/* Help Desk Widget */}
         <div className="card flex-1 flex flex-col justify-center items-center" style={{ padding: '10px', cursor: 'pointer' }} onClick={() => { playSound('click'); setShowFAQ(true); }}>
            <HelpCircle color="var(--primary-light)" size={16} style={{ marginBottom: 4 }} />
            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.7rem' }}>FAQ Help</h4>
            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Depot rules</span>
         </div>
       </div>

       {/* Kiosk Locator Button */}
       <button className="btn w-full" style={{ background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', marginBottom: 20, borderRadius: 16, height: 48 }} onClick={() => { playSound('click'); setShowKiosks(true); }}>
          <MapPin size={16} /> Find Nearby KSRTC Kiosk
       </button>

       {/* Active Cargo Section */}
       <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={16} /> Active Cargo Manifest</h3>
       
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
                           
                           setParcels(prev => prev.map(p => p.id === targetLocker.parcelId ? {
                             ...p,
                             status: 'Delivered',
                             history: [...p.history, { time: 'Now', msg: `Retrieved by customer from secure depot Locker ${targetLocker.id}` }]
                           } : p));
                           
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
}
