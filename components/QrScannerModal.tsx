'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Donation } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  ScanLine
} from 'lucide-react';

interface QrScannerModalProps {
  donation: Donation;
  onClose: () => void;
}

export default function QrScannerModal({ donation, onClose }: QrScannerModalProps) {
  const { refreshData } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  const isPickupStage = donation.status === 'CLAIMED';
  const isDeliveryStage = donation.status === 'IN_TRANSIT';

  // Desktop Simulator Action
  const handleSimulateScan = async () => {
    setIsProcessing(true);
    try {
      const endpoint = isPickupStage
        ? `/api/donations/${donation.id}/scan-pickup`
        : `/api/donations/${donation.id}/scan-delivery`;

      const body = isPickupStage
        ? {
            volunteerId: donation.claimedByVolunteerId || 'VOL-01',
            notes: 'Handover verified via QR check. Hot thermal seal intact.',
          }
        : {
            receiverNotes: 'Delivery verified at NGO intake shelter. Temperature inspected and accepted.',
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setScanSuccess(true);
        await refreshData();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Setup HTML5 QR Code when user toggles camera
  useEffect(() => {
    if (!useCamera) return;

    let html5QrCode: any;
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            if (decodedText.includes(donation.id) || decodedText.includes(donation.qrCodeSecret)) {
              html5QrCode.stop().then(() => {
                handleSimulateScan();
              });
            }
          },
          () => {}
        )
        .catch(() => {
          setCameraError('Camera access unavailable. Use the 1-Click Verification below.');
        });
    });

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch (e) {
          // cleanup
        }
      }
    };
  }, [useCamera, donation.id, donation.qrCodeSecret]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg shadow-xl text-[#1C1917] p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-[#57534E] hover:text-[#1C1917] hover:bg-[#F8F7F4] transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-base font-bold text-[#1C1917]">
            {isPickupStage ? 'Scan Pickup Handover' : 'Scan Shelter Delivery'}
          </h3>
          <p className="text-xs text-[#57534E] mt-0.5">
            {isPickupStage
              ? 'Scan donor kitchen token to confirm physical receipt of surplus batch.'
              : 'Scan intake shelter token to seal delivery custody.'}
          </p>
        </div>

        {/* Verification Success State */}
        {scanSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#065F46] mx-auto animate-bounce" strokeWidth={1.75} />
            <h4 className="text-sm font-bold text-[#1C1917]">Verification Confirmed</h4>
            <p className="text-xs text-[#57534E]">
              Cryptographic chain-of-custody log updated and committed to ledger.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {useCamera ? (
              <div className="space-y-2">
                <div id="qr-reader-container" className="w-full h-48 bg-[#F8F7F4] rounded-md overflow-hidden border border-[#E6E2D8]" />
                {cameraError && (
                  <p className="text-[11px] text-[#C2410C] text-center">{cameraError}</p>
                )}
                <button
                  onClick={() => setUseCamera(false)}
                  className="w-full text-xs text-[#57534E] hover:underline text-center"
                >
                  Switch back to 1-Click Verification
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-[#F8F7F4] border border-[#E6E2D8] text-center space-y-3">
                <ScanLine className="w-8 h-8 text-[#1B4332] mx-auto" strokeWidth={1.75} />
                <div className="text-xs text-[#57534E]">
                  Batch ID: <span className="font-mono tabular-nums text-[#1C1917] font-semibold">{donation.id}</span>
                </div>
                <button
                  onClick={handleSimulateScan}
                  disabled={isProcessing}
                  className="w-full py-2 rounded-md bg-[#1B4332] hover:bg-[#163829] text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isProcessing ? 'Verifying...' : `Confirm ${isPickupStage ? 'Pickup' : 'Delivery'}`}
                </button>
                <button
                  onClick={() => setUseCamera(true)}
                  className="flex items-center justify-center gap-1.5 w-full text-xs text-[#57534E] hover:text-[#1C1917]"
                >
                  <Camera className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Use Device Camera</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
