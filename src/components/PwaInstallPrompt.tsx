/// <reference types="vite-plugin-pwa/react" />
import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'antd';
import { DownloadOutlined, DisconnectOutlined, SyncOutlined } from '@ant-design/icons';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {/* Offline Alert */}
      {isOffline && (
        <Alert
          message={
            <div className="flex items-center gap-2">
              <DisconnectOutlined className="text-amber-500" />
              <span>You are operating offline. Cached data is being served.</span>
            </div>
          }
          type="warning"
          showIcon={false}
          closable
          className="shadow-lg border-amber-200 bg-amber-50 rounded-xl"
        />
      )}

      {/* SW Update Banner */}
      {needRefresh && (
        <Alert
          message={
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SyncOutlined spin className="text-indigo-600" />
                <span className="text-sm font-medium">New update available!</span>
              </div>
              <Button
                type="primary"
                size="small"
                onClick={() => updateServiceWorker(true)}
                className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg"
              >
                Reload
              </Button>
            </div>
          }
          type="info"
          showIcon={false}
          className="shadow-lg border-indigo-200 bg-indigo-50 rounded-xl"
        />
      )}

      {/* Install PWA Prompt */}
      {isInstallable && (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-800 animate-slide-up">
          <div className="flex items-center gap-3">
            <img src="/risev-logo.png" alt="Risev Logo" className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1 shadow-md" />
            <div>
              <div className="font-semibold text-sm leading-snug">Install Risev Admin</div>
              <div className="text-xs text-slate-400">Quick access from desktop or home screen</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleInstallClick}
              className="bg-indigo-500 hover:bg-indigo-600 border-none font-medium rounded-lg px-3"
            >
              Install
            </Button>
            <button
              onClick={() => setIsInstallable(false)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
