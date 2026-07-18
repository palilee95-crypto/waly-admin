import React, { useState, useEffect, useRef, useCallback } from 'react';
import { message, Modal } from 'antd';
import { pb } from '../../../lib/pocketbase';

export const WhatsAppConnectCard: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [phone, setPhone] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async (generateQr = false) => {
    try {
      const url = generateQr
        ? '/api/risev/agent/whatsapp/status?generateQr=true'
        : '/api/risev/agent/whatsapp/status';
      const res = await pb.send(url, { method: 'GET', requestKey: null });

      if (res.status === 'connected') {
        setStatus('connected');
        setPhone(res.phone || '');
        setQrCode('');
        setShowQrModal(false);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } else if (res.qrcode) {
        setStatus('disconnected');
        setQrCode(res.qrcode);
      } else {
        setStatus('disconnected');
        setQrCode('');
      }
    } catch (err: any) {
      console.error('WhatsApp status error:', err);
      setStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await fetchStatus(true);
      setShowQrModal(true);
      pollRef.current = setInterval(async () => {
        await fetchStatus(false);
      }, 5000);
    } catch (err: any) {
      message.error('Failed to generate QR code. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await pb.send('/api/risev/agent/whatsapp/disconnect', { method: 'POST', requestKey: null });
      setStatus('disconnected');
      setPhone('');
      setQrCode('');
      message.success('WhatsApp disconnected successfully.');
    } catch (err: any) {
      message.error('Failed to disconnect. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const statusConfig = {
    connected: {
      dot: 'bg-green-500',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      label: 'Connected',
    },
    loading: {
      dot: 'bg-gray-400 animate-pulse',
      badge: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      label: 'Checking...',
    },
    disconnected: {
      dot: 'bg-red-500',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      label: 'Disconnected',
    },
  };

  const cfg = statusConfig[status];

  return (
    <>
      <div className="glass-panel p-5 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#25D366] text-[18px]">chat</span>
              </div>
              <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
                WhatsApp
              </h3>
            </div>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {status === 'connected' ? (
            <div className="flex items-center gap-2.5 mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[20px]">check_circle</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{phone || 'Connected'}</p>
                <p className="text-[10px] text-on-surface-variant">Ready to send prospect messages</p>
              </div>
            </div>
          ) : status === 'loading' ? (
            <div className="flex items-center gap-2.5 mt-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] animate-spin">progress_activity</span>
              <p className="text-sm text-on-surface-variant">Checking connection status...</p>
            </div>
          ) : (
            <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
              Connect your WhatsApp to automatically send referral links to prospects.
            </p>
          )}
        </div>

        <div className="mt-4 relative">
          {status === 'connected' ? (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border border-red-200 dark:border-red-800 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">link_off</span>
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting || status === 'loading'}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-[#25D366]/20"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              {isConnecting ? 'Generating QR...' : 'Connect WhatsApp'}
            </button>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        title={null}
        open={showQrModal}
        onCancel={handleCloseQrModal}
        footer={null}
        width="90%"
        style={{ maxWidth: 360 }}
        centered
        styles={{ body: { padding: '0' } }}
      >
        {/* Custom Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#25D366] text-[20px]">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface text-base">Scan QR Code</h3>
              <p className="text-xs text-on-surface-variant">Link your WhatsApp account</p>
            </div>
          </div>
          <button
            onClick={handleCloseQrModal}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
          </button>
        </div>

        {/* QR Body */}
        <div className="flex flex-col items-center p-5">
          <p className="font-body text-xs text-on-surface-variant mb-4 text-center leading-relaxed">
            Open WhatsApp → Settings → Linked Devices → Link a Device → Scan this QR
          </p>
          <div className="flex justify-center mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            {qrCode ? (
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="WhatsApp QR Code"
                className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px]"
              />
            ) : (
              <div className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-[48px] animate-spin">progress_activity</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Waiting for scan... Auto-closes when connected.
          </div>
        </div>
      </Modal>
    </>
  );
};