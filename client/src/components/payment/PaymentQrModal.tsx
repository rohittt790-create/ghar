import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { PAYMENT_CONFIG } from '../../constants/payment.js';
import { formatCurrency } from '../../utils/formatters.js';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  IndianRupee,
  CheckCircle2,
  FileCheck,
  Sparkles,
} from 'lucide-react';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialNote?: string;
  propertyName?: string;
  taskName?: string;
}

const PRESET_AMOUNTS = [550, 1000, 5000, 10000, 25000];

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  initialAmount,
  initialNote,
  propertyName,
  taskName,
}) => {
  const [amount, setAmount] = useState<number | string>(
    initialAmount !== undefined ? initialAmount : PAYMENT_CONFIG.defaultAmount
  );
  const [note, setNote] = useState<string>(
    initialNote || (taskName ? `Payment for ${taskName}` : PAYMENT_CONFIG.defaultNote)
  );
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const upiLink = PAYMENT_CONFIG.generateUpiLink(numAmount, note);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = PAYMENT_CONFIG.qrImageBase64;
    link.download = `kailash-bhawan-upi-qr-${numAmount || 550}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) return;

    setIsSubmittingUtr(true);
    setTimeout(() => {
      setIsSubmittingUtr(false);
      setPaymentConfirmed(true);

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#0284c7', '#f59e0b', '#8b5cf6'],
        });
      } catch (err) {}
    }, 600);
  };

  const handleReset = () => {
    setPaymentConfirmed(false);
    setUtrNumber('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Scan & Pay via UPI QR"
      subtitle="Instant, secure settlement with zero transaction charges"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {paymentConfirmed ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Payment Reference Submitted!</h3>
              <p className="text-sm text-slate-500 mt-1">
                Transaction Reference / UTR{' '}
                <strong className="text-slate-800 font-mono">{utrNumber}</strong> has been logged for{' '}
                {formatCurrency(numAmount)}.
              </p>
              {propertyName && (
                <span className="inline-block mt-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                  Property: {propertyName} {taskName ? `• ${taskName}` : ''}
                </span>
              )}
            </div>
            <div className="pt-4">
              <Button variant="primary" onClick={handleReset} className="bg-emerald-600 hover:bg-emerald-700">
                Done & Return to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Context Notice if Property / Task is specified */}
            {(propertyName || taskName) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                <span className="font-semibold">
                  Payment for: <strong>{propertyName || 'Estate'}</strong> {taskName ? `— ${taskName}` : ''}
                </span>
                <span className="font-bold text-amber-700">Milestone Settlement</span>
              </div>
            )}

            {/* Main QR Card */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              {/* Background ambient glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-bold text-amber-300 border border-white/10 mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified UPI Payment Receiver</span>
              </div>

              {/* QR Code Container with Frame */}
              <div className="relative p-4 bg-white rounded-3xl shadow-2xl border-4 border-amber-500/30 group">
                <img
                  src={PAYMENT_CONFIG.qrImagePublicUrl}
                  onError={(e) => {
                    // Fallback to embedded Base64 URI if static asset is unavailable
                    e.currentTarget.src = PAYMENT_CONFIG.qrImageBase64;
                  }}
                  alt="UPI Payment QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-2xl"
                />

                {/* Corner accent decorations */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-slate-900 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-slate-900 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-slate-900 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-slate-900 rounded-br-sm pointer-events-none" />
              </div>

              {/* Payee Details */}
              <div className="mt-5 space-y-1">
                <h4 className="text-xl font-black text-white tracking-tight">
                  {PAYMENT_CONFIG.payeeName}
                </h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xs text-amber-300 bg-white/10 px-2.5 py-1 rounded-lg">
                    {PAYMENT_CONFIG.upiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Supported UPI Apps */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 w-full flex items-center justify-center gap-3 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400">Works with any app:</span>
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Cred'].map((app) => (
                  <span
                    key={app}
                    className="text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {/* Amount Selection & Mobile Action Buttons */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Payment Amount (₹)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-9 pr-4 py-2.5 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleDownloadQr}
                    className="shrink-0 flex items-center gap-1.5 text-xs py-2.5"
                    title="Save QR Code image to device"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Save QR</span>
                  </Button>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-400 font-medium">Quick presets:</span>
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        numAmount === amt
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct UPI Mobile Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={upiLink}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open in UPI App (Mobile)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all border border-slate-200 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>{copiedUpi ? 'UPI ID Copied!' : 'Copy UPI ID'}</span>
                </button>
              </div>
            </div>

            {/* Optional UTR / Reference Number Submission Form */}
            <form onSubmit={handleRecordPayment} className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  Record UTR / Transaction Reference
                </span>
                <span className="text-[11px] text-slate-400">Optional for Audit Ledger</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter 12-digit UPI Ref / UTR No. (e.g. 428901234567)"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
                <Button
                  variant="primary"
                  type="submit"
                  size="sm"
                  disabled={!utrNumber.trim()}
                  loading={isSubmittingUtr}
                  className="bg-amber-600 hover:bg-amber-700 text-xs shrink-0"
                >
                  Confirm Payment
                </Button>
              </div>
              <p className="text-[11px] text-slate-400">
                Once paid via your banking app, submit the UTR number to attach payment proof to your project ledger.
              </p>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};
