import React, { useState, useEffect, useRef } from 'react';
import { useSimulation, playSound, speakText, sanitizeInput } from '../context/SimulationContext';

export default function VeloBotChat({ parcel }) {
  const {
    buses,
    lockers,
    weather,
    appLanguage
  } = useSimulation();

  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaskara! I am VeloBot, your KSRTC Logistics assistant. How can I assist you with parcel ' + parcel.id + '?' }
  ]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  const handleSend = (textToSend) => {
    const msgText = textToSend || input;
    const sanitized = sanitizeInput(msgText, 150);
    if (!sanitized) return;

    playSound('click');
    const updated = [...messages, { sender: 'user', text: sanitized }];
    setMessages(updated);
    setInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);
      playSound('chime');
      let reply = "I'm checking the logs. Your cargo is currently stored safely in transit.";
      const busObj = buses.find(b => b.id === parcel.bus);
      const lockerObj = lockers.find(l => l.parcelId === parcel.id);

      const lower = msgText.toLowerCase();
      if (lower.includes('status') || lower.includes('where')) {
        reply = `Parcel ${parcel.id} is currently ${parcel.status.replace('_', ' ')} on Bus ${parcel.bus || 'Unassigned'}. Route: ${busObj ? busObj.route : 'Pending'}.`;
      } else if (lower.includes('eta') || lower.includes('arrive') || lower.includes('time')) {
        reply = busObj 
          ? `Bus ${busObj.id} is currently near ${busObj.location}. Estimated arrival is ${busObj.eta} (Progress: ${busObj.progress}%).`
          : `Conductor allocation is pending. We will notify you once departure commences.`;
      } else if (lower.includes('conductor') || lower.includes('driver') || lower.includes('contact')) {
        reply = `Conductor Manjunath K. is operating the bus. For secure handovers, please keep your OTP (${parcel.deliveryOtp}) ready.`;
      } else if (lower.includes('otp') || lower.includes('code') || lower.includes('pin')) {
        reply = `Your secure delivery confirmation passcode is ${parcel.deliveryOtp}. Present this code to verify delivery.`;
      } else if (lower.includes('policy') || lower.includes('cancel')) {
        reply = `Cancellations can be made up to 20 minutes before arrival. Standard terms limit recovery liability unless insured.`;
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('fog')) {
        reply = `The current simulated weather environment is ${weather.toUpperCase()}. Bus speeds are dynamically reduced by weather speed modifiers to ensure safe transit.`;
      } else if (lower.includes('locker') || lower.includes('depot') || lower.includes('box')) {
        if (lockerObj) {
          reply = `Your parcel is securely stored in Depot Locker ${lockerObj.id} at ${lockerObj.location.split(',')[0]}. Use verification PIN ${lockerObj.pin} to open it.`;
        } else {
          reply = `Upon arrival at the destination stand, your parcel will be assigned to a secure KSRTC depot locker box. A secure OTP will be issued automatically.`;
        }
      }

      setMessages([...updated, { sender: 'bot', text: reply }]);
    }, 1200);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 350, padding: 16 }}>
      <div className="flex items-center gap-sm" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 10, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
        <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>VeloBot AI Assistant</h4>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4, marginBottom: 12 }}>
        {messages.map((m, idx) => (
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
              border: m.sender === 'bot' ? '1px solid var(--glass-border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>{m.text}</span>
            {m.sender === 'bot' && (
              <button 
                onClick={(e) => { e.stopPropagation(); playSound('click'); speakText(m.text, appLanguage); }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}
                title="Speak reply"
              >
                🔊
              </button>
            )}
          </div>
        ))}
        {isBotTyping && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--input-bg)', padding: '10px 14px', borderRadius: '12px', display: 'flex', gap: 4, alignItems: 'center' }}>
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
        {['Check ETA', 'Locker PIN', 'Conductor Details', 'Weather Condition'].map(chip => (
          <button 
            key={chip} 
            onClick={() => handleSend(chip)}
            className="badge" 
            style={{ background: 'var(--surface-secondary)', color: 'var(--text-main)', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="flex gap-sm">
        <input 
          type="text" 
          placeholder="Ask VeloBot status..." 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ padding: '8px 12px', borderRadius: 20, fontSize: '0.8rem' }}
        />
        <button onClick={() => handleSend()} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 20, fontSize: '0.8rem' }}>Send</button>
      </div>
    </div>
  );
}
