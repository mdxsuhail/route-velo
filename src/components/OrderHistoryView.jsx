import React, { useState } from 'react';
import { History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useSimulation, playSound, generateBarcodeHTML, generateBarcodeHTMLString 
} from '../context/SimulationContext';
import Header from './Header';

export default function OrderHistoryView() {
  const {
    parcels,
    selectedInvoice, setSelectedInvoice,
    addLog
  } = useSimulation();

  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const completedShipments = parcels;

  const printInvoice = (item) => {
    playSound('click');
    const printContent = `
      <html>
        <head>
          <title>RouteVelo Waybill - ${item.id}</title>
          <style>
            body {
              font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif;
              padding: 30px;
              background: #fff;
              color: #111827;
            }
            .invoice-card {
              max-width: 500px;
              margin: 0 auto;
              border: 2px dashed #dc2626;
              border-radius: 16px;
              padding: 24px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #dc2626;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .header h2 {
              color: #dc2626;
              margin: 0;
              font-size: 22px;
              font-weight: 900;
              letter-spacing: 1px;
            }
            .header p {
              margin: 4px 0 0;
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .section-title {
              font-size: 11px;
              font-weight: 800;
              color: #dc2626;
              text-transform: uppercase;
              margin: 14px 0 6px;
              letter-spacing: 0.5px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              margin: 6px 0;
            }
            .row span {
              color: #6b7280;
            }
            .row strong {
              color: #111827;
            }
            .divider {
              border-top: 1px dashed #e5e7eb;
              margin: 12px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 16px;
              padding-top: 12px;
              border-top: 2px solid #dc2626;
            }
            .total-label {
              font-weight: 800;
              font-size: 15px;
            }
            .total-amount {
              font-size: 22px;
              font-weight: 800;
              color: #dc2626;
            }
            @media print {
              body { padding: 0; }
              .invoice-card { border: 2px dashed #000; box-shadow: none; }
              .header h2, .total-amount, .section-title { color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="header">
              <h2>🚌 KSRTC SMART LOGISTICS</h2>
              <p>Official Digital Log Waybill Ticket</p>
            </div>
            <div class="row">
              <span>Waybill ID:</span>
              <strong>${item.id}</strong>
            </div>
            <div class="row">
              <span>Conductor Bus:</span>
              <strong>${item.bus}</strong>
            </div>
            <div class="row">
              <span>From Station:</span>
              <strong>${item.origin}</strong>
            </div>
            <div class="row">
              <span>To Station:</span>
              <strong>${item.destination}</strong>
            </div>
            
            <div class="divider"></div>
            <div class="section-title">Contact Manifest</div>
            <div class="row">
              <span>Sender Details:</span>
              <strong>${item.senderName} (${item.senderPhone})</strong>
            </div>
            <div class="row">
              <span>Receiver Details:</span>
              <strong>${item.receiverName} (${item.receiverPhone})</strong>
            </div>
            
            <div class="divider"></div>
            <div class="section-title">Cargo Specifications</div>
            <div class="row">
              <span>Service Tier:</span>
              <strong>${item.tier || 'Express'} Class</strong>
            </div>
            <div class="row">
              <span>Class Type:</span>
              <strong>${item.parcelCount || 1}x ${item.cargoClass || 'Standard Box'}</strong>
            </div>
            <div class="row">
              <span>Special Handling:</span>
              <strong>
                ${item.fragile ? 'Fragile 🛡️ ' : ''}
                ${item.insurance ? 'Insured Cargo ✅ ' : ''}
                ${!item.fragile && !item.insurance ? 'Standard' : ''}
              </strong>
            </div>
            
            <div class="divider"></div>
            <div class="section-title">Security OTP Codes</div>
            <div class="row">
              <span>Pickup OTP Code:</span>
              <strong>${item.pickupOtp || 'N/A'}</strong>
            </div>
            <div class="row">
              <span>Delivery Verification OTP:</span>
              <strong>${item.deliveryOtp}</strong>
            </div>
            
            <div class="divider"></div>
            <div class="row">
              <span>Carbon Saved Offset:</span>
              <strong>${((item.parcelCount || 1) * 0.35 + 0.1).toFixed(2)} kg CO2 Saved 🍃</strong>
            </div>
            
            <div class="divider"></div>
            <div class="section-title">Scan Dispatch Barcode</div>
            ${generateBarcodeHTMLString(item.id)}

            <div class="total-row">
              <span class="total-label">Total Fare Paid:</span>
              <span class="total-amount">₹${item.totalFare}</span>
            </div>

            <div style="text-align: center; font-size: 9px; color: #6b7280; margin-top: 20px; border-top: 1px dashed #e5e7eb; padding-top: 10px;">
              <p>Securely Dispatched via KSRTC RouteVelo Logistics Network</p>
              <p style="font-family: monospace; font-size: 8px; margin-top: 2px;">HASH-AUTH: RV-${item.id}-${item.deliveryOtp}-${item.totalFare}-SECURE</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="animate-fade-in pb-32">
      <Header title="Delivery Invoices" />
      
      <div className="flex flex-col gap-sm">
        {completedShipments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No completed invoice records in this session.</p>
        ) : (
          completedShipments.map(item => (
            <div key={item.id} className="card" onClick={() => { playSound('click'); setSelectedInvoice(item); }} style={{ padding: 16, cursor: 'pointer', opacity: 0.9 }}>
              <div className="flex justify-between items-center">
                <div>
                  <span className={`badge ${item.status === 'Delivered' || item.status === 'Ad_Hoc_Dropped' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.6rem' }}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: 4 }}>{item.id}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.05rem' }}>₹{item.totalFare}</span>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Conductor: {item.bus}</p>
                </div>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>To: {item.destination}</p>
            </div>
          ))
        )}
      </div>

      {/* Invoice Modal Overlay */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div className="card" style={{ borderRadius: '24px 24px 0 0', height: '90%', display: 'flex', flexDirection: 'column', margin: 0, border: '1px solid var(--glass-border)', background: 'var(--surface)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 800 }}>Digital Log Waybill</h3>
                <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>&times;</button>
              </div>

              <div style={{ flex: 1, background: 'var(--input-bg)', borderRadius: 12, padding: 16, border: '1px dashed var(--glass-border)', position: 'relative', overflowY: 'auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <h4 style={{ textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary-light)' }}>KSRTC smart logistics</h4>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Logistics Transaction Record</p>
                </div>
                
                <div className="flex flex-col gap-sm" style={{ fontSize: '0.8rem' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Waybill ID:</span>
                    <span style={{ fontWeight: 700 }}>{selectedInvoice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Conductor Bus:</span>
                    <span style={{ fontWeight: 700 }}>{selectedInvoice.bus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>From:</span>
                    <span style={{ fontWeight: 700 }}>{selectedInvoice.origin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>To:</span>
                    <span style={{ fontWeight: 700 }}>{selectedInvoice.destination.split(',')[0]}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Sender:</span>
                    <span style={{ fontWeight: 700 }}>{selectedInvoice.senderName} ({selectedInvoice.senderPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Receiver:</span>
                    <span style={{ fontWeight: 700 }}>{selectedInvoice.receiverName} ({selectedInvoice.receiverPhone})</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Class & Package:</span>
                    <span style={{ fontWeight: 700 }}>{selectedInvoice.tier || 'Express'} Class • {selectedInvoice.parcelCount || 1}x {selectedInvoice.cargoClass || 'Standard Box'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Special Handling:</span>
                    <span style={{ fontWeight: 700 }}>
                      {selectedInvoice.fragile ? 'Fragile 🛡️ ' : ''}
                      {selectedInvoice.insurance ? 'Insured ✅ ' : ''}
                      {!selectedInvoice.fragile && !selectedInvoice.insurance ? 'Standard' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Pickup / Delivery OTP:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedInvoice.pickupOtp || 'N/A'} / {selectedInvoice.deliveryOtp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>CO2 Carbon Offset:</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                      {((selectedInvoice.parcelCount || 1) * 0.35 + 0.1).toFixed(2)} kg Saved 🍃
                    </span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)' }} />
                  <div style={{ textAlign: 'center', margin: '8px 0' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>WAYBILL DISPATCH BARCODE</span>
                    {generateBarcodeHTML(selectedInvoice.id)}
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
                  <div className="flex justify-between items-end">
                    <span style={{ fontWeight: 800 }}>Amount Paid:</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>₹{selectedInvoice.totalFare}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-sm" style={{ marginTop: 16, marginBottom: 75 }}>
                <button className="btn btn-primary flex-1" onClick={() => printInvoice(selectedInvoice)}>
                  🖨️ Print Waybill PDF
                </button>
                <button className="btn btn-secondary flex-1" onClick={() => setSelectedInvoice(null)}>Close</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
