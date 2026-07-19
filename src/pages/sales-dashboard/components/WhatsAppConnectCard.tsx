import React, { useState, useEffect, useRef, useCallback } from 'react';
import { message, Modal, Input } from 'antd';
import { pb } from '../../../lib/pocketbase';

export const WhatsAppConnectCard: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [phone, setPhone] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairPhone, setPairPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          clearTimeout(pollRef.current);
          pollRef.current = null;
        }
      } else if (res.qrcode) {
        setStatus('disconnected');
        setQrCode(res.qrcode);
      } else {
        // Still disconnected but no new QR — preserve existing QR so it doesn't flash
        setStatus('disconnected');
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
        clearTimeout(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await fetchStatus(true);
      setShowQrModal(true);
      // Poll with exponential backoff: 5s, 10s, 20s, 30s, 30s...
      let pollAttempt = 0;
      const pollFn = async () => {
        await fetchStatus(false);
        pollAttempt++;
        const delay = Math.min(5000 * Math.pow(2, pollAttempt), 30000);
        pollRef.current = setTimeout(pollFn, delay) as any;
      };
      pollRef.current = setTimeout(pollFn, 5000) as any;
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
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const handlePair = async () => {
    if (!pairPhone.trim()) {
      message.warning('Please enter your WhatsApp phone number.');
      return;
    }
    const cleanPhone = pairPhone.trim().replace(/[\s\-]/g, '');
    if (!/^(\+?60|0)?\d{8,12}$/.test(cleanPhone)) {
      message.error('Please enter a valid Malaysian phone number (e.g. 0123456789).');
      return;
    }

    setIsPairing(true);
    setPairingCode('');
    try {
      const res = await pb.send('/api/risev/agent/whatsapp/pair', {
        method: 'POST',
        body: { phone: cleanPhone },
        requestKey: null,
      });

      if (res.success && res.pairingCode) {
        setPairingCode(res.pairingCode);
        message.success('Pairing code generated! Enter it in WhatsApp → Linked Devices.');
      } else {
        message.error(res.message || 'Failed to generate pairing code.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.message || err?.message || 'Failed to generate pairing code.';
      message.error(errMsg);
    } finally {
      setIsPairing(false);
    }
  };

  const handleClosePairModal = () => {
    setShowPairModal(false);
    setPairPhone('');
    setPairingCode('');
    // Refresh status after closing (user may have paired)
    fetchStatus(false);
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
            <div className="flex flex-col gap-2">
              <button
                onClick={handleConnect}
                disabled={isConnecting || status === 'loading'}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-[#25D366]/20"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                {isConnecting ? 'Generating QR...' : 'Scan QR Code'}
              </button>
              <button
                onClick={() => setShowPairModal(true)}
                disabled={status === 'loading'}
                className="w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-on-surface px-4 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border border-black/5 dark:border-white/5 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
                Pair with Phone Number
              </button>
            </div>
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
                src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`}
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

      {/* Pair with Phone Number Modal */}
      <Modal
        title={null}
        open={showPairModal}
        onCancel={handleClosePairModal}
        footer={null}
        width="90%"
        style={{ maxWidth: 420 }}
        centered
        styles={{ body: { padding: '0' } }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#25D366] text-[20px]">phone_iphone</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface text-base">Pair with Phone Number</h3>
              <p className="text-xs text-on-surface-variant">No QR scanner needed</p>
            </div>
          </div>
          <button
            onClick={handleClosePairModal}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {!pairingCode ? (
            <>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  Your WhatsApp Phone Number
                </label>
                <Input
                  placeholder="e.g. 0123456789 or +60123456789"
                  value={pairPhone}
                  onChange={(e) => setPairPhone(e.target.value)}
                  size="large"
                  style={{ borderRadius: 12 }}
                  prefix={<span className="material-symbols-outlined text-[18px] text-outline">phone</span>}
                />
                <p className="text-xs text-on-surface-variant mt-1.5">
                  Enter the phone number registered with your WhatsApp. We'll generate a pairing code.
                </p>
              </div>

              {/* How it works */}
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">How it works</p>
                <ol className="text-xs text-on-surface-variant space-y-1.5 list-decimal list-inside">
                  <li>Enter your WhatsApp phone number above</li>
                  <li>Click "Get Pairing Code" — you'll get an 8-digit code</li>
                  <li>Open WhatsApp → Settings → Linked Devices → Link a Device</li>
                  <li>Tap "Pair with phone number" and enter the code</li>
                </ol>
              </div>

              <button
                onClick={handlePair}
                disabled={isPairing}
                className="w-full bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {isPairing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    Get Pairing Code
                  </>
                )}
              </button>
            </>
          ) : (
            /* Pairing code display */
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-on-surface-variant text-center">
                Enter this code in WhatsApp → Linked Devices → Link a Device → Pair with phone number:
              </p>
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl px-8 py-6">
                <p className="font-headline text-3xl font-black text-primary tracking-[0.2em] text-center">
                  {pairingCode}
                </p>
              </div>
              <button
                onClick={handlePair}
                disabled={isPairing}
                className="text-xs text-primary hover:text-primary-focus underline font-semibold bg-transparent border-none cursor-pointer disabled:opacity-50 -mt-2"
              >
                {isPairing ? 'Regenerating...' : 'Regenerate Code'}
              </button>
              <p className="text-xs text-on-surface-variant text-center">
                The code expires in a few minutes. Don't close this window until you've entered it.
              </p>
              <button
                onClick={handleClosePairModal}
                className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                I've Entered the Code
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};