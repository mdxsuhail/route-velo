import React, { useState } from 'react';
import { ChevronRight, PlusCircle, Leaf, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useSimulation, playSound, PRICING_TIERS, STOPS, sanitizeInput 
} from '../context/SimulationContext';
import Header from './Header';

export default function BookingFlow() {
  const {
    buses,
    parcels, setParcels,
    walletBalance, setWalletBalance,
    setTransactions,
    weather,
    coupons,
    savedContacts, setSavedContacts,
    addLog,
    setSelectedInvoice,
    setActiveTab,
    t
  } = useSimulation();

  const [step, setStep] = useState(1);
  const [searchStop, setSearchStop] = useState('');
  const [pricing, setPricing] = useState({ weight: 0, tier: 'Express', fragile: false, insurance: false });
  const [showWaybill, setShowWaybill] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [details, setDetails] = useState({ sName: 'Jane Doe', sPhone: '9876543210', rName: '', rPhone: '', origin: 'Bengaluru Majestic' });

  // Feature States:
  const [parcelCount, setParcelCount] = useState(1);
  const [cargoClass, setCargoClass] = useState('Standard Box');
  const [saveToContacts, setSaveToContacts] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState('');

  const cargoMultipliers = {
    'Document': 0.6,
    'Standard Box': 1.0,
    'Large Crate': 1.8,
    'Heavy Sack': 2.5
  };

  // Filter available buses departing from Bangalore for the route selection
  const availableBuses = buses.filter(b => b.route.includes(searchStop.replace(' KSRTC Bus Stand', '').replace(' Central Bus Stand', '').replace(' Bus Depot', '')));

  const calculateTotal = () => {
    const baseFare = PRICING_TIERS.busType[pricing.tier];
    const weightSurcharge = PRICING_TIERS.weight[pricing.weight].rate;
    const addOns = (pricing.fragile ? 30 : 0) + (pricing.insurance ? 50 : 0);
    
    const cargoMult = cargoMultipliers[cargoClass] || 1.0;
    let subtotal = (baseFare + weightSurcharge + addOns) * cargoMult;
    subtotal = subtotal * parcelCount;

    // Weather surge: ₹35
    const weatherSurge = (weather === 'Rainy' || weather === 'Foggy') ? 35 : 0;
    // Traffic surge: ₹25
    const trafficSurge = (buses.some(b => b.status === 'Delayed')) ? 25 : 0;
    const totalSurge = weatherSurge + trafficSurge;
    subtotal += totalSurge;

    // Bulk discount: 10% off subtotal if parcelCount > 1
    const bulkDiscount = parcelCount > 1 ? Math.round(subtotal * 0.1) : 0;
    
    // Coupon discount: 10% off subtotal
    const couponDiscount = (activeCoupon === 'SAVE10' && coupons.includes('SAVE10')) ? Math.round(subtotal * 0.1) : 0;
    
    const finalSubtotal = subtotal - bulkDiscount - couponDiscount;
    const gst = Math.round(finalSubtotal * 0.18);
    
    return { 
      baseFare, 
      weightSurcharge, 
      addOns, 
      subtotal: finalSubtotal, 
      gst, 
      total: Math.max(0, finalSubtotal + gst),
      weatherSurge,
      trafficSurge,
      bulkDiscount,
      couponDiscount
    };
  };

  const handlePayment = () => {
    const { total } = calculateTotal();
    if (walletBalance < total) {
      playSound('beep');
      alert("Insufficient wallet balance. Please top up funds.");
      return;
    }
    
    const ref = `RV-${Math.floor(1000 + Math.random() * 9000)}`;
    playSound('chime');
    setWalletBalance(w => w - total);
    setTransactions(prev => [
      { id: 'TXN-' + Math.floor(100 + Math.random()*900), type: 'Payment', amount: -total, date: 'Just now', desc: `Booking ${ref}`, status: 'Success' },
      ...prev
    ]);

    // Address Book Persistence: save receiver if checkbox checked
    if (saveToContacts) {
      setSavedContacts(prev => {
        if (prev.some(c => c.phone === details.rPhone)) return prev;
        return [...prev, { name: details.rName, phone: details.rPhone, kiosk: searchStop }];
      });
      addLog(`CONTACTS: Saved ${details.rName} to address book.`);
    }

    setBookingRef(ref);
    setShowWaybill(true);
  };

  const confirmBookingAllocation = (assignedBusId) => {
    const { total } = calculateTotal();
    
    const newParcel = {
      id: bookingRef,
      type: 'Sending',
      status: 'Pending',
      bus: assignedBusId,
      pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      origin: sanitizeInput(details.origin, 100),
      destination: sanitizeInput(searchStop, 100),
      senderName: sanitizeInput(details.sName, 50),
      senderPhone: sanitizeInput(details.sPhone, 20),
      receiverName: sanitizeInput(details.rName, 50),
      receiverPhone: sanitizeInput(details.rPhone, 20),
      totalFare: total,
      insurance: pricing.insurance,
      fragile: pricing.fragile,
      rating: 0,
      tier: pricing.tier,
      cargoClass,
      parcelCount,
      history: [
        { time: 'Now', msg: `Cargo booked. Assigned to conductor on Bus ${assignedBusId}.` }
      ]
    };

    setParcels(prev => [newParcel, ...prev]);
    addLog(`LOGISTICS: Registered package ${bookingRef} (${parcelCount} items, ${cargoClass}) on Bus ${assignedBusId}.`);
    
    setShowWaybill(false);
    setSelectedInvoice(newParcel);
    setActiveTab('history');
  };

  return (
    <div className="animate-slide-up pb-32">
      <Header title="New Cargo Booking" />
      
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[1,2,3,4].map(s => (
          <div key={s} style={{ height: 4, flex: 1, background: step >= s ? 'var(--primary)' : 'var(--input-bg)', borderRadius: 2 }} />
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-md">
          <div className="input-group">
            <label className="input-label">Destination Stop</label>
            <select value={searchStop} onChange={e => { playSound('click'); setSearchStop(e.target.value); }} style={{ width: '100%' }}>
              <option value="">Select destination stand...</option>
              {STOPS.filter(s => s !== "Kempegowda Bus Station (Majestic), Bengaluru" && s !== "Kengeri Transit Hub, Bengaluru").map(stop => (
                <option key={stop} value={stop}>{stop}</option>
              ))}
            </select>
          </div>

          {/* Bulk / Multi-Parcel Selector */}
          <div className="input-group">
            <label className="input-label">Number of Parcels in Shipment</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => { playSound('click'); setParcelCount(count); }}
                  className="btn btn-secondary flex-1"
                  style={{
                    border: parcelCount === count ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                    background: parcelCount === count ? 'var(--primary-glow)' : 'var(--input-bg)'
                  }}
                >
                  {count} {count > 1 ? 'Parcels (10% off)' : 'Parcel'}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" disabled={!searchStop} onClick={() => setStep(2)}>Add Contact Details <ChevronRight size={16} /></button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-md animate-fade-in">
          <div className="flex justify-between items-center">
            <h4 style={{ fontWeight: 800 }}>Sender & Receiver Contacts</h4>
            <div style={{ width: 150 }}>
              <select 
                onChange={e => {
                  const c = savedContacts.find(x => x.phone === e.target.value);
                  if (c) {
                    playSound('click');
                    setDetails(prev => ({ ...prev, rName: c.name, rPhone: c.phone }));
                  }
                }}
                style={{ padding: '6px 10px', fontSize: '0.75rem', height: 'auto' }}
              >
                <option value="">Saved Contacts</option>
                {savedContacts.map(c => (
                  <option key={c.phone} value={c.phone}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card flex flex-col gap-md" style={{ padding: 16 }}>
            <div className="input-group">
              <label className="input-label">Origin Kiosk</label>
              <input type="text" value={details.origin} onChange={e => setDetails({ ...details, origin: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="input-group flex-1">
                <label className="input-label">Sender Name</label>
                <input type="text" value={details.sName} onChange={e => setDetails({ ...details, sName: e.target.value })} />
              </div>
              <div className="input-group flex-1">
                <label className="input-label">Sender Phone</label>
                <input type="text" value={details.sPhone} onChange={e => setDetails({ ...details, sPhone: e.target.value })} />
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="input-group flex-1">
                <label className="input-label">Receiver Name</label>
                <input type="text" placeholder="John Doe" value={details.rName} onChange={e => setDetails({ ...details, rName: e.target.value })} />
              </div>
              <div className="input-group flex-1">
                <label className="input-label">Receiver Phone</label>
                <input type="text" placeholder="9845******" value={details.rPhone} onChange={e => setDetails({ ...details, rPhone: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-between items-center" style={{ marginTop: 4 }}>
              <label htmlFor="saveContactCheck" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Save receiver to Address Book</label>
              <input 
                type="checkbox" 
                id="saveContactCheck" 
                checked={saveToContacts}
                onChange={e => setSaveToContacts(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
              />
            </div>
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-secondary flex-1" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary flex-[2]" disabled={!details.rName || !details.rPhone} onClick={() => setStep(3)}>Select Transit Speed <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-md animate-fade-in">
          <h4 style={{ fontWeight: 800 }}>Delivery Speed & Cargo Classification</h4>
          
          <div className="input-group">
            <label className="input-label">Cargo Package Type</label>
            <select value={cargoClass} onChange={e => { playSound('click'); setCargoClass(e.target.value); }}>
              <option value="Document">📄 Document/Letter (x0.6 rate)</option>
              <option value="Standard Box">📦 Standard Box (x1.0 rate)</option>
              <option value="Large Crate">🚚 Large Crate (x1.8 rate)</option>
              <option value="Heavy Sack">⚠️ Heavy Sack (x2.5 rate)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Express', 'Standard', 'Economy'].map(tier => (
              <div 
                key={tier}
                onClick={() => { playSound('click'); setPricing({ ...pricing, tier }); }}
                className="card flex justify-between items-center"
                style={{ padding: 12, cursor: 'pointer', border: pricing.tier === tier ? '2px solid var(--primary)' : '1px solid var(--glass-border)', background: pricing.tier === tier ? 'var(--primary-glow)' : 'var(--surface-card)' }}
              >
                <div>
                  <h4 style={{ fontWeight: 800 }}>{tier} Class</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tier === 'Express' ? 'Airavat Volvo Club' : tier === 'Standard' ? 'Rajahamsa Express' : 'Karnataka Sarige'}</p>
                </div>
                <span style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: '1.1rem' }}>₹{Math.round(PRICING_TIERS.busType[tier] * (cargoMultipliers[cargoClass] || 1))}</span>
              </div>
            ))}
          </div>

          <div className="input-group">
            <label className="input-label">Package Weight Class</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {PRICING_TIERS.weight.map((w, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => { playSound('click'); setPricing({ ...pricing, weight: idx }); }}
                  className="btn btn-secondary flex-1"
                  style={{ 
                    padding: 10, 
                    fontSize: '0.75rem',
                    border: pricing.weight === idx ? '2.5px solid var(--primary)' : '1px solid var(--glass-border)',
                    background: pricing.weight === idx ? 'var(--primary-glow)' : 'var(--input-bg)'
                  }}
                >
                  {w.label} (+₹{w.rate})
                </button>
              ))}
            </div>
          </div>

          <div className="card flex flex-col gap-sm" style={{ padding: 12 }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Premium Care Add-ons</h4>
            <div className="flex justify-between items-center">
              <label htmlFor="fragileCheck" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Specialized Fragile Handling (+₹30)</label>
              <input 
                type="checkbox" 
                id="fragileCheck"
                checked={pricing.fragile}
                onChange={e => { playSound('click'); setPricing({ ...pricing, fragile: e.target.checked }); }}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
            </div>
            <div className="flex justify-between items-center" style={{ marginTop: 6 }}>
              <label htmlFor="insuranceCheck" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Cargo Liability Insurance (+₹50)</label>
              <input 
                type="checkbox" 
                id="insuranceCheck"
                checked={pricing.insurance}
                onChange={e => { playSound('click'); setPricing({ ...pricing, insurance: e.target.checked }); }}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
            </div>
          </div>

          <div className="flex gap-sm">
            <button className="btn btn-secondary flex-1" onClick={() => setStep(2)}>Back</button>
            <button className="btn btn-primary flex-[2]" onClick={() => setStep(4)}>Fare Breakdown <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {step === 4 && (() => {
        const { 
          baseFare, 
          weightSurcharge, 
          addOns, 
          subtotal, 
          gst, 
          total,
          weatherSurge,
          trafficSurge,
          bulkDiscount,
          couponDiscount
        } = calculateTotal();
        
        const carbonOffsetSaved = (parcelCount * 0.35 + (PRICING_TIERS.weight[pricing.weight].rate * 0.005)).toFixed(2);

        return (
          <div className="flex flex-col gap-md animate-fade-in">
            <div className="card flex flex-col gap-sm" style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 800, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6 }}>Bill Summary ({parcelCount}x {cargoClass})</h4>
              
              <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Base fare ({pricing.tier} Class)</span>
                <span>₹{baseFare * parcelCount}</span>
              </div>
              
              <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Weight surcharge</span>
                <span>₹{weightSurcharge * parcelCount}</span>
              </div>
              
              <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Cargo Multiplier ({cargoClass})</span>
                <span>x{(cargoMultipliers[cargoClass] || 1).toFixed(1)}</span>
              </div>

              <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Insurance & Fragile options</span>
                <span>₹{addOns * parcelCount}</span>
              </div>

              {(weatherSurge > 0 || trafficSurge > 0) && (
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                  <span>Environmental/Traffic Surge Surcharge</span>
                  <span>+₹{weatherSurge + trafficSurge}</span>
                </div>
              )}

              {bulkDiscount > 0 && (
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                  <span>Bulk booking bundle discount (10%)</span>
                  <span>-₹{bulkDiscount}</span>
                </div>
              )}
              
              {couponDiscount > 0 && (
                <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                  <span>Redeemed Coupon discount (10%)</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Taxes (GST 18%)</span>
                <span>₹{gst}</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
              
              {coupons.length > 0 && (
                <div className="input-group" style={{ margin: '4px 0' }}>
                  <label className="input-label" style={{ fontSize: '0.65rem' }}>Select Unlocked Coupon Discount</label>
                  <select value={activeCoupon} onChange={e => setActiveCoupon(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.75rem', height: 'auto' }}>
                    <option value="">Apply coupon...</option>
                    {coupons.map((code, idx) => (
                      <option key={idx} value={code}>{code} (10% Off)</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-between items-end">
                <span style={{ fontWeight: 800 }}>Total Fare Payable:</span>
                <span style={{ fontSize: '1.6rem', color: 'var(--primary-light)', fontWeight: 800 }}>₹{total}</span>
              </div>
            </div>

            <div className="card flex items-center gap-sm" style={{ padding: '10px 14px', border: '1.5px solid var(--success)', background: 'var(--success-glow)' }}>
              <Leaf size={20} color="var(--success)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 800 }}>ECO transit Saver</h4>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>You save **{carbonOffsetSaved} kg of CO2** by using existing public KSRTC bus route logistics instead of private courier vans.</p>
              </div>
            </div>

            <div className="card flex items-start gap-sm" style={{ padding: 12, border: '1px solid var(--error)', background: 'var(--error-glow)' }}>
              <input 
                type="checkbox" 
                id="policyAccept" 
                checked={policyAccepted}
                onChange={e => { playSound('click'); setPolicyAccepted(e.target.checked); }}
                style={{ width: 20, height: 20, cursor: 'pointer', marginTop: 2, accentColor: 'var(--primary)' }}
              />
              <label htmlFor="policyAccept" style={{ fontSize: '0.75rem', lineHeight: 1.3, cursor: 'pointer' }}>
                I accept that unless Insurance is purchased, RouteVelo holds zero liability for delays or damages. Unlawful items are seized immediately.
              </label>
            </div>

            <div className="flex gap-sm">
              <button className="btn btn-secondary flex-1" onClick={() => setStep(3)}>Back</button>
              <button className="btn btn-primary flex-[2]" disabled={!policyAccepted || walletBalance < total} onClick={handlePayment}>Pay & Confirm Slot</button>
            </div>
          </div>
        );
      })()}

      <AnimatePresence>
        {showWaybill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 4500, background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: 20 }}>
            <div className="card w-full" style={{ maxWidth: 360, textAlign: 'center' }}>
              <h3 style={{ color: 'var(--success)' }}>Slot Booking Success</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Select a departing bus from schedule:</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {availableBuses.length === 0 ? (
                  <div className="card" style={{ padding: 12, cursor: 'pointer', background: 'var(--primary-glow)', border: '1px solid var(--primary)' }} onClick={() => confirmBookingAllocation('AW-102')}>
                    <h4 style={{ fontSize: '0.85rem' }}>Auto-Allocate Airavat AW-102</h4>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>No other matching route schedule found.</p>
                  </div>
                ) : (
                  availableBuses.map(bus => (
                    <div 
                      key={bus.id} 
                      onClick={() => confirmBookingAllocation(bus.id)}
                      className="card flex justify-between items-center" 
                      style={{ padding: 10, cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'var(--input-bg)' }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{bus.id} ({bus.type})</span>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Status: {bus.location} • {bus.eta}</p>
                      </div>
                      <ChevronRight size={16} />
                    </div>
                  ))
                )}
              </div>

              <div style={{ background: 'white', padding: 12, borderRadius: 12, display: 'inline-block', marginBottom: 12 }}>
                <QrCode size={110} color="black" />
              </div>
              <div style={{ background: 'var(--input-bg)', padding: 10, borderRadius: 8 }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: 2 }}>{bookingRef}</span>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Present barcode at kiosk to dispatch parcel.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
