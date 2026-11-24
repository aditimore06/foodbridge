'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Donation } from '@/types';
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface QrModalProps {
  donation: Donation;
  onClose: () => void;
}

export default function QrModal({ donation, onClose }: QrModalProps) {
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { refreshData } = useApp();

  const qrPayload = JSON.stringify({
    donationId: donation.id,
    secret: donation.qrCodeSecret,
    meals: donation.quantityMeals,
    donor: donation.donorName,
    safeUntil: donation.safeUntil,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(donation.qrCodeSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateHandover = async () => {
    setScanning(true);
    try {
      const res = await fetch(`/api/donations/${donation.id}/scan-pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: 'VOL-01',
          notes: 'Simulated Desktop Scan: Physical handover verified at donor dispatch kitchen.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

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

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-medium mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#065F46]" strokeWidth={1.75} />
            <span>Cryptographic Handover Token</span>
          </div>
          <h3 className="text-base font-bold text-[#1C1917] font-mono tabular-nums">
            {donation.id}
          </h3>
          <p className="text-xs text-[#57534E] mt-0.5">
            Present this QR code to the volunteer courier at physical kitchen handover
          </p>
        </div>

        {/* QR Code Presentation */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg mb-4 mx-auto w-fit">
          <QRCodeSVG
            value={qrPayload}
            size={180}
            level="H"
            includeMargin={true}
          />
          <div className="mt-2 text-[#57534E] font-mono tabular-nums text-[10px] tracking-wider uppercase">
            SHA256: {donation.qrCodeSecret.substring(0, 16)}...
          </div>
        </div>

        {/* Secret fallback & copy */}
        <div className="bg-[#F8F7F4] p-2.5 rounded-md border border-[#E6E2D8] mb-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#57534E]">Secret Code:</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-[#1C1917]">{donation.qrCodeSecret}</span>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-[#EFECE6] rounded text-[#57534E] hover:text-[#1C1917]"
                title="Copy secret"
              >
                {copied ? <Check className="w-3 h-3 text-[#065F46]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={handleSimulateHandover}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#1B4332] hover:bg-[#163829] text-white text-xs font-semibold transition disabled:opacity-50"
          >
            <span>{scanning ? 'Verifying...' : 'Simulate Physical Handover'}</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
          <p className="text-[10px] text-center text-[#57534E]">
            Transitions batch status to IN_TRANSIT with courier cryptographic stamp
          </p>
        </div>

      </div>
    </div>
  );
}
