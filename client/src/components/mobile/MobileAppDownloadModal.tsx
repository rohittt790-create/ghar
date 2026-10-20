import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Apple,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  QrCode,
  Layers,
  ArrowRight,
  HardHat,
} from 'lucide-react';

interface MobileAppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppDownloadModal: React.FC<MobileAppDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'pwa'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handlePwaInstall = async () => {
    if (!deferredPrompt) {
      alert('PWA installation is ready! If on Chrome/Edge, click the install icon in your browser address bar.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white my-8">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-800 p-6 sm:p-7 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shrink-0">
              <HardHat className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Mobile App
                </span>
                <span className="text-xs text-white/80 font-medium">Android & iOS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                Download KAILASH BHAWAN App
              </h2>
              <p className="text-xs sm:text-sm text-brand-100 mt-0.5">
                Install on your phone or tablet for instant access, offline mode & native camera
              </p>
            </div>
          </div>

          {/* Platform Selector Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-black/20 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setActivePlatform('android')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'android'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android (Play Store / APK)</span>
            </button>

            <button
              onClick={() => setActivePlatform('ios')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'ios'
                  ? 'bg-white text-slate-950 shadow-md font-black'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>Apple iOS (App Store)</span>
            </button>

            <button
              onClick={() => setActivePlatform('pwa')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'pwa'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Install</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* ANDROID TAB */}
          {activePlatform === 'android' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Highlight Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-800/60 to-slate-800/40 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">Android Native Application Package</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Ready for the Google Play Store and direct installation on any Samsung, Xiaomi, OnePlus, Vivo, Oppo, or Pixel phone.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <span>Package: com.kailashbhawan.app</span>
                      <span>•</span>
                      <span>Target: Android 14+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Install Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  How to Install on Android:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center mb-2">
                      1
                    </div>
                    <p className="text-xs font-semibold text-slate-200">Download APK</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Download the signed Android APK or bundle from GitHub Releases.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center mb-2">
                      2
                    </div>
                    <p className="text-xs font-semibold text-slate-200">Tap Install</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Open the downloaded file. When prompted, tap "Allow install from source".
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center mb-2">
                      3
                    </div>
                    <p className="text-xs font-semibold text-slate-200">Enjoy Kailash Bhawan</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Full fullscreen app with native camera photo capture and UPI deep linking!
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://github.com/rohitkumar790/ghar/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm text-center shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Android APK / Builds</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <button
                  type="button"
                  onClick={handlePwaInstall}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Direct Web Install</span>
                </button>
              </div>
            </div>
          )}

          {/* APPLE IOS TAB */}
          {activePlatform === 'ios' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Highlight Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-800/50 to-slate-900 border border-slate-700/80">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">Apple iOS & iPadOS App</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Full native Xcode workspace generated in <code className="text-brand-300">client/ios</code>. You can publish to TestFlight or App Store Connect with bundle identifier:
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-slate-200 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700 inline-block">
                      Bundle ID: com.kailashbhawan.app
                    </div>
                  </div>
                </div>
              </div>

              {/* iPhone 5-Second Install Guide */}
              <div className="p-4 rounded-2xl bg-brand-950/30 border border-brand-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300">
                    Instant 5-Second iPhone / iPad Install (No App Store wait):
                  </h4>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <span>
                      Open this URL in <strong>Safari</strong> on your iPhone or iPad.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <span>
                      Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-sky-400 mx-1" /> at the bottom of the screen.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <span>
                      Scroll down and tap <strong>Add to Home Screen</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span className="text-emerald-300 font-medium">
                      Done! The KAILASH BHAWAN app icon will appear on your iPhone screen and run fullscreen like an App Store app.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1-CLICK PWA TAB */}
          {activePlatform === 'pwa' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-800/60 to-slate-800/40 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">Progressive Web App (PWA)</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Installed directly to your device home screen or desktop application launcher. Loads instantly with offline asset caching and zero waiting.
                    </p>
                  </div>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Kailash Bhawan is already installed on this device!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePwaInstall}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm text-center shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Install KAILASH BHAWAN to Device</span>
                </button>
              )}

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Works seamlessly across Android, iPhone, Windows, and Mac</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic background updates — always latest features</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full camera access for uploading floor and room photos</span>
                </div>
              </div>
            </div>
          )}

          {/* Security & Quality Guarantee Badge */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Secure & Private</span>
            </div>
            <span>v2.1.0 • Built with Capacitor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
