'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Share, X, Bell } from 'lucide-react';
import { savePushSubscription } from '@/app/actions/push';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad/.test(ua) && !/CriOS|FxiOS/.test(ua);
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

export function InstallButton() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTooltip, setShowIOSTooltip] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsStandalone(isStandaloneMode());
    setIsIOS(detectIOS());
    if ('Notification' in window) setNotifPermission(Notification.permission);

    // Check if previously installed (localStorage flag)
    const wasInstalled = localStorage.getItem('pwa-installed') === 'true';

    const handleBeforeInstall = (e: Event) => {
      // Do NOT call e.preventDefault() — that suppresses Chrome's native mini-infobar
      // and causes the "Banner not shown" console warning. We store the event so our
      // custom button can still call .prompt() when clicked, while Chrome's own UI
      // (address-bar install icon / mini-infobar) continues to work normally.
      localStorage.removeItem('pwa-installed');
      setDeferredPrompt(e);
      setIsInstalled(false);
    };
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // If standalone mode, mark as installed
    if (isStandaloneMode()) {
      localStorage.setItem('pwa-installed', 'true');
    }

    // If was installed but not in standalone = was uninstalled, wait for prompt
    if (wasInstalled && !isStandaloneMode()) {
      setIsInstalled(false); // show button once prompt fires
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Close iOS tooltip on outside click
  useEffect(() => {
    if (!showIOSTooltip) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowIOSTooltip(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showIOSTooltip]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    const prompt = deferredPrompt;
    setDeferredPrompt(null);
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'dismissed') {
        localStorage.removeItem('pwa-installed');
      }
    } catch {
      // Prompt was already consumed (e.g. user used Chrome's address-bar install)
      localStorage.removeItem('pwa-installed');
    }
  }

  async function handleEnableNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission !== 'granted') return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });
      const json = sub.toJSON();
      await savePushSubscription({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
    } catch (err) {
      console.error('Push subscription failed:', err);
    }
  }

  if (!mounted || isStandalone || isInstalled) return null;

  const showNotifButton = 'Notification' in window && notifPermission !== 'granted';

  // iOS Safari — no beforeinstallprompt support
  if (isIOS) {
    return (
      <div className="relative" ref={tooltipRef}>
        <button
          onClick={() => setShowIOSTooltip((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          aria-label="Install Apex Modular Construction app"
        >
          <Share className="h-3.5 w-3.5" />
          Install App
        </button>
        {showIOSTooltip && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/20 bg-[#3a1570] p-4 shadow-xl z-50 text-white text-sm">
            <div className="flex items-start justify-between mb-2">
              <span className="font-semibold">Add to Home Screen</span>
              <button onClick={() => setShowIOSTooltip(false)} className="text-white/60 hover:text-white ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
              Tap the <strong>Share</strong> button (⎋) at the bottom of your browser, then select <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {deferredPrompt && (
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          aria-label="Install Apex Modular Construction app"
        >
          <Download className="h-3.5 w-3.5" />
          Install App
        </button>
      )}
      {showNotifButton && (
        <button
          onClick={handleEnableNotifications}
          className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          aria-label="Enable notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          Notifications
        </button>
      )}
    </div>
  );
}
