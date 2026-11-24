'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '@/context/AppContext';
import { ProvenanceFilter } from './LeafletMap';

interface LeafletMapInnerProps {
  filter: ProvenanceFilter;
}

export default function LeafletMapInner({ filter }: LeafletMapInnerProps) {
  const { donors, ngos, donations, heatmapZones } = useApp();

  // City Center: Bengaluru (Koramangala / Central)
  const centerPosition: [number, number] = [12.9600, 77.6200];

  // Custom DivIcon for Donors (Clean civic pin)
  const createDonorIcon = (mealsAvailable: number, hasSurplus: boolean) => {
    return L.divIcon({
      className: 'custom-donor-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: ${hasSurplus ? '#1B4332' : '#57534E'};
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            font-family: monospace;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            border: 1px solid white;
            white-space: nowrap;
          ">
            ${hasSurplus ? `${mealsAvailable} meals` : 'Kitchen'}
          </div>
          <div style="
            width: 0; 
            height: 0; 
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 5px solid ${hasSurplus ? '#1B4332' : '#57534E'};
            margin-top: -1px;
          "></div>
        </div>
      `,
      iconSize: [40, 36],
      iconAnchor: [20, 32],
    });
  };

  // Custom DivIcon for NGOs (Clean shelter pin)
  const createNgoIcon = (name: string, current: number, max: number) => {
    return L.divIcon({
      className: 'custom-ngo-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: #B45309;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            font-family: monospace;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            border: 1px solid white;
            white-space: nowrap;
          ">
            ${current}/${max}
          </div>
          <div style="
            width: 0; 
            height: 0; 
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 5px solid #B45309;
            margin-top: -1px;
          "></div>
        </div>
      `,
      iconSize: [40, 36],
      iconAnchor: [20, 32],
    });
  };

  // Find In-Transit donations with active routes
  const inTransitDonations = useMemo(() => {
    return donations.filter(
      (d) => d.status === 'IN_TRANSIT' && d.targetNgoLat && d.targetNgoLng
    );
  }, [donations]);

  // Compute active surplus per donor
  const donorSurplusMap = useMemo(() => {
    const map: Record<string, number> = {};
    donations.forEach((d) => {
      if (d.status === 'OPEN' || d.status === 'CLAIMED') {
        map[d.donorId] = (map[d.donorId] || 0) + d.quantityMeals;
      }
    });
    return map;
  }, [donations]);

  const showLiveRecords = filter === 'ALL' || filter === 'LIVE_PLATFORM';
  const showBaselines = filter === 'ALL' || filter === 'SIMULATED_BASELINE';

  return (
    <MapContainer
      center={centerPosition}
      zoom={12}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%', background: '#F4F1EA' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 1. Hotspot Baseline Heatmap Overlays */}
      {showBaselines &&
        heatmapZones.map((zone) => {
          const isSurplus = zone.type === 'HOTSPOT_SURPLUS';
          const color = isSurplus ? '#B45309' : '#C2410C';

          return (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radiusMeters}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '3 3',
              }}
            >
              <Popup>
                <div className="p-2 text-xs text-[#1C1917] max-w-xs font-sans">
                  <div className="flex items-center gap-1.5 font-bold mb-1" style={{ color }}>
                    <span>{isSurplus ? 'Surplus Hotspot Corridor' : 'High-Demand Distribution Zone'}</span>
                  </div>
                  <h4 className="font-bold text-[#1C1917] mb-1">{zone.name}</h4>
                  <p className="text-[11px] text-[#57534E] mb-2">{zone.description}</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-[#F8F7F4] text-[#57534E] font-medium border border-[#E6E2D8]">
                    Regional Baseline
                  </span>
                </div>
              </Popup>
            </Circle>
          );
        })}

      {/* 2. Active Transit Corridors (Polylines) */}
      {showLiveRecords &&
        inTransitDonations.map((d) => {
          const positions: [number, number][] = [
            [d.donorLat, d.donorLng],
            [d.targetNgoLat!, d.targetNgoLng!],
          ];

          return (
            <Polyline
              key={`route-${d.id}`}
              positions={positions}
              pathOptions={{
                color: '#C2410C',
                weight: 3,
                dashArray: '6 6',
                opacity: 0.85,
              }}
            >
              <Popup>
                <div className="p-2 text-xs text-[#1C1917]">
                  <div className="font-bold text-[#C2410C] flex items-center gap-1 mb-1">
                    <span>Active Courier Transit</span>
                  </div>
                  <div className="font-semibold">{d.foodTitle}</div>
                  <div className="text-[11px] text-[#57534E] mt-1">
                    Courier: {d.claimedByVolunteerName}
                  </div>
                  <div className="text-[11px] text-[#57534E]">
                    Destination: {d.claimedByNgoName}
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

      {/* 3. Donors (Kitchen Markers) */}
      {showLiveRecords &&
        donors.map((donor) => {
          const surplus = donorSurplusMap[donor.id] || 0;
          return (
            <Marker
              key={donor.id}
              position={[donor.lat, donor.lng]}
              icon={createDonorIcon(surplus, surplus > 0)}
            >
              <Popup>
                <div className="p-2 text-xs text-[#1C1917] max-w-xs font-sans">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                      {donor.type}
                    </span>
                    <span className="text-[10px] text-[#57534E] font-mono">
                      FSSAI Verified
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1C1917] mb-0.5">{donor.name}</h4>
                  <p className="text-[11px] text-[#57534E] mb-2">{donor.address}</p>

                  <div className="bg-[#F8F7F4] p-2 rounded border border-[#E6E2D8] text-[11px] space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Active Surplus:</span>
                      <span className="font-bold text-[#1B4332] font-mono tabular-nums">
                        {surplus > 0 ? `${surplus} meals ready` : 'None active'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Lifetime Rescued:</span>
                      <span className="font-semibold text-[#1C1917] font-mono tabular-nums">{donor.totalMealsDonated} meals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">On-Time Rate:</span>
                      <span className="font-semibold text-[#1B4332] font-mono tabular-nums">{donor.onTimePickupRate}%</span>
                    </div>
                  </div>

                  <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-medium border border-[#A7F3D0]">
                    Verified Kitchen Node
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* 4. Verified NGOs & Shelters */}
      {showLiveRecords &&
        ngos.map((ngo) => {
          return (
            <Marker
              key={ngo.id}
              position={[ngo.lat, ngo.lng]}
              icon={createNgoIcon(ngo.name, ngo.currentCapacity, ngo.maxCapacity)}
            >
              <Popup>
                <div className="p-2 text-xs text-[#1C1917] max-w-xs font-sans">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                      Intake Shelter
                    </span>
                    <span className="text-[10px] text-[#57534E] font-mono">
                      Reg Verified
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1C1917] mb-0.5">{ngo.name}</h4>
                  <p className="text-[11px] text-[#57534E] mb-2">{ngo.address}</p>

                  <div className="bg-[#F8F7F4] p-2 rounded border border-[#E6E2D8] text-[11px] space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Current Intake Capacity:</span>
                      <span className="font-bold text-[#B45309] font-mono tabular-nums">
                        {ngo.currentCapacity} / {ngo.maxCapacity} meals
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Lifetime Distributed:</span>
                      <span className="font-semibold text-[#1C1917] font-mono tabular-nums">{ngo.totalMealsReceived} meals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Operating Hours:</span>
                      <span className="font-semibold text-[#1C1917] font-mono tabular-nums">{ngo.operatingHours}</span>
                    </div>
                  </div>

                  <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] font-medium border border-[#FDE68A]">
                    Verified Shelter Node
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
