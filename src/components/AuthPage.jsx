import React, { useState, useRef } from 'react';
import { Package } from 'lucide-react';
import { useSimulation, playSound, speakText } from '../context/SimulationContext';

export default function AuthPage() {
  const {
    appLanguage,
    setCurrentUser,
    setToast,
    addLog
  } = useSimulation();

  const [selectedRole, setSelectedRole] = useState('Customer'); // Customer, Driver, Admin
  const [loginStep, setLoginStep] = useState('phone'); // phone, otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [driverBadge, setDriverBadge] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [isShake, setIsShake] = useState(false);
  
  const otpRef0 = useRef(null);
  const otpRef1 = useRef(null);
  const otpRef2 = useRef(null);
  const otpRef3 = useRef(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

  const handleSendOtp = (overrideNum) => {
    const activeNum = typeof overrideNum === 'string' ? overrideNum : phoneNumber;
    if (activeNum.length !== 10) {
      playSound('warning');
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    playSound('chime');
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedOtp(randomOtp);
    setLoginStep('otp');
    addLog(`AUTH: Generated OTP ${randomOtp} for verification of phone +91 ${activeNum}`);
    speakText(`Your code is ${randomOtp.split('').join(' ')}`, appLanguage);
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val !== '' && index < 3) {
      otpRefs[index + 1].current.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 4) {
      if (fullCode === simulatedOtp || fullCode === '1234') {
        playSound('chime');
        setCurrentUser('Customer');
        addLog(`AUTH: Customer successfully verified via OTP (+91 ${phoneNumber})`);
        setToast({ title: 'Welcome Back', message: 'Logged in securely as Customer.' });
        speakText("Welcome back to Route Velo", appLanguage);
      } else {
        playSound('warning');
        setIsShake(true);
        setTimeout(() => setIsShake(false), 500);
        setOtpDigits(['', '', '', '']);
        otpRefs[0].current.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleDriverLogin = (e) => {
    e.preventDefault();
    if (!driverBadge.trim()) {
      playSound('warning');
      alert('Please enter your Driver/Conductor Badge ID.');
      return;
    }
    playSound('chime');
    setCurrentUser('Driver');
    addLog(`AUTH: Conductor ${driverBadge} checked in.`);
    setToast({ title: 'Shift Started', message: `Driver Badge ${driverBadge} active.` });
    speakText("Shift session initialized", appLanguage);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasskey === 'KSRTC-ADMIN-2026' || adminPasskey === 'admin') {
      playSound('chime');
      setCurrentUser('Admin');
      addLog(`AUTH: System administrator logged in.`);
      setToast({ title: 'Command Center Active', message: 'Admin dashboard initialized.' });
      speakText("System Administrator authorized", appLanguage);
    } else {
      playSound('warning');
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      alert('Invalid System Passkey.');
    }
  };

  const handleSocialLogin = (platform) => {
    playSound('chime');
    setCurrentUser('Customer');
    addLog(`AUTH: Frictionless ${platform} login successful.`);
    setToast({ title: 'Google/Apple Sign-In', message: 'Instant frictionless login completed.' });
    speakText("Authenticated via social login", appLanguage);
  };

  return (
    <div className="auth-container animate-fade-in w-full">
      <div className="auth-header">
        <div className="auth-logo-glow">
          <Package size={32} color="var(--primary)" />
        </div>
        <h1 className="auth-title">RouteVelo</h1>
        <p className="auth-subtitle">KSRTC Smart Logistics</p>
      </div>

      <div className={`auth-card ${isShake ? 'animate-shake' : ''}`}>
        <div className="auth-tabs">
          {['Customer', 'Driver', 'Admin'].map(role => (
            <button
              key={role}
              className={`auth-tab ${selectedRole === role ? 'active' : ''}`}
              onClick={() => { playSound('click'); setSelectedRole(role); setLoginStep('phone'); }}
            >
              {role === 'Driver' ? 'Conductor' : role}
            </button>
          ))}
        </div>

        {selectedRole === 'Customer' && (
          <div className="animate-slide-up">
            {loginStep === 'phone' ? (
              <div className="flex flex-col gap-md">
                <div className="input-group">
                  <label className="input-label">Enter Mobile Number</label>
                  <div className="flex gap-xs items-center">
                    <span style={{ padding: '14px 0 14px 12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>+91</span>
                    <input
                      type="tel"
                      maxLength="10"
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPhoneNumber(val);
                        if (val.length === 10) {
                          handleSendOtp(val);
                        }
                      }}
                      style={{ paddingLeft: '6px' }}
                    />
                  </div>
                </div>
                <button className="btn btn-primary w-full" onClick={() => handleSendOtp()}>
                  Get Verification OTP
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                <div className="input-group">
                  <label className="input-label" style={{ textAlign: 'center' }}>Enter 4-Digit OTP Code</label>
                  <div className="otp-box">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        maxLength="1"
                        className="otp-digit"
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                      />
                    ))}
                  </div>
                </div>

                {simulatedOtp && (
                  <div className="sim-info-box">
                    <span style={{ fontSize: '1.2rem' }}>💬</span>
                    <div>
                      <strong>Simulated SMS Code:</strong> {simulatedOtp}
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-secondary w-full"
                  onClick={() => { playSound('click'); setLoginStep('phone'); setOtpDigits(['', '', '', '']); }}
                >
                  Change Phone Number
                </button>
              </div>
            )}

            <div className="divider-container">or continue with</div>

            <div className="social-login-grid">
              <button className="social-btn" onClick={() => handleSocialLogin('Google')}>
                <span>🌐</span> Google
              </button>
              <button className="social-btn" onClick={() => handleSocialLogin('Apple')}>
                <span>🍎</span> Apple
              </button>
            </div>
          </div>
        )}

        {selectedRole === 'Driver' && (
          <form onSubmit={handleDriverLogin} className="flex flex-col gap-md animate-slide-up">
            <div className="input-group">
              <label className="input-label">Conductor Badge ID</label>
              <input
                type="text"
                placeholder="e.g. DRV-9932"
                value={driverBadge}
                onChange={e => setDriverBadge(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Verify Badge
            </button>
            <div className="sim-info-box">
              <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
              <div>
                Enter badge ID (e.g. <strong>DRV-9932</strong>) to start a shift manifest simulation.
              </div>
            </div>
          </form>
        )}

        {selectedRole === 'Admin' && (
          <form onSubmit={handleAdminLogin} className="flex flex-col gap-md animate-slide-up">
            <div className="input-group">
              <label className="input-label">System Admin Passkey</label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPasskey}
                onChange={e => setAdminPasskey(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Access CommandCenter
            </button>
            <div className="sim-info-box">
              <span style={{ fontSize: '1.2rem' }}>🔑</span>
              <div>
                Enter passcode: <strong>KSRTC-ADMIN-2026</strong>
              </div>
            </div>
          </form>
        )}

        <div style={{ marginTop: 20, borderTop: '1px dashed var(--glass-border)', paddingTop: 16, textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Presentation / Demo Bypass
          </span>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
            <span
              className="dev-bypass-link"
              style={{ marginTop: 0 }}
              onClick={() => {
                playSound('chime');
                setCurrentUser('Customer');
                addLog('AUTH: Demo bypassed to Customer dashboard.');
                setToast({ title: 'Welcome Back', message: 'Logged in as Customer.' });
              }}
            >
              Customer
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
            <span
              className="dev-bypass-link"
              style={{ marginTop: 0 }}
              onClick={() => {
                playSound('chime');
                setCurrentUser('Driver');
                addLog('AUTH: Demo bypassed to Conductor dashboard.');
                setToast({ title: 'Shift Started', message: 'Logged in as Conductor.' });
              }}
            >
              Conductor
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
            <span
              className="dev-bypass-link"
              style={{ marginTop: 0 }}
              onClick={() => {
                playSound('chime');
                setCurrentUser('Admin');
                addLog('AUTH: Demo bypassed to Admin dashboard.');
                setToast({ title: 'Command Center Active', message: 'Logged in as Admin.' });
              }}
            >
              Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
