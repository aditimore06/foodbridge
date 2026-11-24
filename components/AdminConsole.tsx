'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { VerificationStatus } from '@/types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  UtensilsCrossed, 
  HeartHandshake, 
  MapPin,
  Lock
} from 'lucide-react';

export default function AdminConsole() {
  const { donors, ngos, refreshData, setToastMessage } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'verified_all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter pending donors and NGOs
  const pendingDonors = donors.filter((d) => d.verificationStatus === 'PENDING_VERIFICATION');
  const pendingNgos = ngos.filter((n) => n.verificationStatus === 'PENDING_VERIFICATION');
  const totalPending = pendingDonors.length + pendingNgos.length;

  const handleVerify = async (entityType: 'donor' | 'ngo', id: string, status: VerificationStatus) => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage({
          text: `Verification updated: ${entityType.toUpperCase()} marked as ${status}.`,
          type: status === 'VERIFIED' ? 'success' : 'alert',
        });
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-lg border border-[#E6E2D8] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-[#1B4332] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1C1917]">
                  Trust & Compliance Verification Registry
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F8F7F4] text-[#57534E] border border-[#E6E2D8]">
                  Audit Authority
                </span>
              </div>
              <p className="text-xs text-[#57534E] mt-0.5">
                Verify FSSAI licenses, municipal registrar filings, and thermal hygiene compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F8F7F4] px-3 py-1.5 rounded-md border border-[#E6E2D8] text-xs">
            <span className="text-[#57534E]">Pending Reviews:</span>
            <span className={`font-mono tabular-nums font-bold px-2 py-0.2 rounded ${
              totalPending > 0 ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]' : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
            }`}>
              {totalPending} Awaiting Action
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E6E2D8] pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            activeTab === 'pending'
              ? 'bg-[#1B4332] text-white'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#F8F7F4]'
          }`}
        >
          <span>Pending Verification Queue</span>
          {totalPending > 0 && (
            <span className="ml-1 font-mono tabular-nums px-1.5 py-0.2 rounded text-[10px] bg-white/20">
              {totalPending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('verified_all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            activeTab === 'verified_all'
              ? 'bg-[#1B4332] text-white'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#F8F7F4]'
          }`}
        >
          <span>All Network Partners</span>
          <span className="ml-1 font-mono tabular-nums px-1.5 py-0.2 rounded text-[10px] bg-white/20">
            {donors.length + ngos.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        <div className="space-y-4">
          {totalPending === 0 ? (
            <div className="bg-[#FFFFFF] rounded-lg border border-[#E6E2D8] p-8 text-center text-xs text-[#57534E]">
              All partner kitchens and shelters are verified. No pending compliance audits.
            </div>
          ) : (
            <>
              {/* Pending Donors */}
              {pendingDonors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#57534E] uppercase tracking-wider flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Donor Kitchens Awaiting Compliance Audit ({pendingDonors.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingDonors.map((d) => (
                      <div key={d.id} className="bg-[#FFFFFF] rounded-lg border border-[#E6E2D8] p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-[#1C1917]">{d.name}</h4>
                            <p className="text-xs text-[#57534E] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" strokeWidth={1.75} />
                              <span>{d.address}</span>
                            </p>
                          </div>
                          <span className="font-mono tabular-nums text-[11px] text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                            Pending Audit
                          </span>
                        </div>

                        <div className="bg-[#F8F7F4] p-2.5 rounded-md border border-[#E6E2D8] space-y-1 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-[#57534E]">FSSAI Certificate:</span>
                            <span className="font-bold text-[#1C1917]">{d.fssaiLicense}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#57534E]">Entity Category:</span>
                            <span className="text-[#1C1917] font-sans">{d.type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#57534E]">Inspection Status:</span>
                            <span className="text-[#B45309]">Field Check Required</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#E6E2D8]">
                          <button
                            onClick={() => handleVerify('donor', d.id, 'VERIFIED')}
                            disabled={processingId === d.id}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-[#1B4332] hover:bg-[#163829] text-white text-xs font-semibold transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            <span>Approve & Certify</span>
                          </button>
                          <button
                            onClick={() => handleVerify('donor', d.id, 'REJECTED')}
                            disabled={processingId === d.id}
                            className="px-3 py-1.5 rounded-md border border-[#FECACA] text-[#991B1B] hover:bg-[#FEF2F2] text-xs font-medium transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending NGOs */}
              {pendingNgos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#57534E] uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Shelters Awaiting Intake Certification ({pendingNgos.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingNgos.map((n) => (
                      <div key={n.id} className="bg-[#FFFFFF] rounded-lg border border-[#E6E2D8] p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-[#1C1917]">{n.name}</h4>
                            <p className="text-xs text-[#57534E] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" strokeWidth={1.75} />
                              <span>{n.address}</span>
                            </p>
                          </div>
                          <span className="font-mono tabular-nums text-[11px] text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                            Pending Audit
                          </span>
                        </div>

                        <div className="bg-[#F8F7F4] p-2.5 rounded-md border border-[#E6E2D8] space-y-1 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-[#57534E]">Govt Registration:</span>
                            <span className="font-bold text-[#1C1917]">{n.ngoRegNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#57534E]">Intake Capacity:</span>
                            <span className="text-[#1C1917] tabular-nums">{n.maxCapacity} meals</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#E6E2D8]">
                          <button
                            onClick={() => handleVerify('ngo', n.id, 'VERIFIED')}
                            disabled={processingId === n.id}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-[#1B4332] hover:bg-[#163829] text-white text-xs font-semibold transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            <span>Approve & Certify</span>
                          </button>
                          <button
                            onClick={() => handleVerify('ngo', n.id, 'REJECTED')}
                            disabled={processingId === n.id}
                            className="px-3 py-1.5 rounded-md border border-[#FECACA] text-[#991B1B] hover:bg-[#FEF2F2] text-xs font-medium transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Verified Network Directory */
        <div className="bg-[#FFFFFF] rounded-lg border border-[#E6E2D8] divide-y divide-[#E6E2D8]">
          {[...donors, ...ngos].map((entity: any) => {
            const isDonor = 'fssaiLicense' in entity;

            return (
              <div key={entity.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1C1917]">{entity.name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#F8F7F4] border border-[#E6E2D8] text-[#57534E]">
                      {isDonor ? 'Donor Kitchen' : 'Shelter Intake'}
                    </span>
                  </div>
                  <div className="text-[#57534E] flex items-center gap-2">
                    <span>{entity.address}</span>
                    <span className="text-[#E6E2D8]">•</span>
                    <span className="font-mono">
                      {isDonor ? `FSSAI: ${entity.fssaiLicense}` : `Govt Reg: ${entity.ngoRegNumber}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                    entity.verificationStatus === 'VERIFIED'
                      ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                      : entity.verificationStatus === 'REJECTED'
                      ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                      : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                  }`}>
                    {entity.verificationStatus === 'VERIFIED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" strokeWidth={1.75} />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#991B1B]" strokeWidth={1.75} />
                    )}
                    <span>{entity.verificationStatus}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
