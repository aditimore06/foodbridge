# 🌉 FoodBridge — Surplus Food Rescue & Redistribution Network

> **A real-time logistics and coordination platform connecting cooked-food donors (hostel messes, restaurants, weddings, canteens) with nearby verified NGOs and volunteer couriers within strict safe-consumption windows.**

---

## 🌟 Executive Overview
Food waste and urban hunger coexist within kilometers of each other. **FoodBridge** bridges this gap through an intelligent, zero-friction civic coordination operating system. By fusing **Haversine geospatial routing**, **multi-factor capacity matching**, **cryptographic two-stage QR chain-of-custody tracking**, and **historical predictive surplus analytics**, FoodBridge ensures that hot, nutritious cooked food reaches hunger relief centers long before safe-consumption windows expire.

---

## 🚀 Key Feature Modules Built

### 1. 🍲 Donor Portal & Smart Food Surplus Prediction (Module 1)
- **Historical Surplus Modeling:** Analyzes pre-seeded historical logs (e.g., Friday night IIT hostel mess excess, Sunday wedding banquet spikes).
- **Actionable AI Recommendations:** *"Based on 6 weeks of Friday data, you average ~45 surplus meals between 9:30 PM – 10:30 PM. Pre-schedule a standby pickup with Robin Hood Army?"*
- **Visual Confidence Trends:** `Recharts` area chart showing historical volume vs. forward forecast with confidence intervals.
- **Mandatory Compliance Disclaimer:** Explicit badge: **"Statistical Estimate — Based on Historical Patterns"**.
- **1-Click Pre-Scheduling:** Translates forecasts into pre-populated donation listings.

### 2. ⚡ Intelligent NGO Matching & Split-Donation Engine (Module 2)
- **Geodesic Haversine Calculation:** Computes exact great-circle distance (km) and estimated urban transit minutes.
- **Multi-Factor Weighted Algorithm:**
  1. Geographic proximity (Haversine distance)
  2. Remaining daily / refrigeration capacity vs. donation volume
  3. Operational availability & cold-storage readiness
  4. Safe-until urgency alignment
- **Explainable AI/Logic Tags:** Rendered on every candidate card (e.g., `1.8 km away • Fits 80/100 capacity • 42 mins before expiry • ❄️ Cold storage equipped`).
- **Smart Donation Splitting:** When large catering excess (e.g., 160 wedding meals) exceeds any single shelter's intake capacity, the algorithm automatically clusters 2–3 nearby shelters into a balanced dispatch route with an **"Approve & Dispatch Split"** action.

### 3. ⏱️ Smart Expiry Management & Auto-Reopen Watchdog (Module 3)
- **Live Real-Time Countdowns:** Ticking countdown timers (`HH:MM:SS`) on every listing.
- **Dynamic Priority Tiers:**
  - `CRITICAL (< 45 mins left)`: Pulsing red badge, prioritized to top of dispatch feeds.
  - `URGENT (45–90 mins left)`: Amber badge.
  - `STANDARD (> 90 mins left)`: Emerald badge.
- **Hard Expiry Lock:** At `00:00:00`, listing automatically switches to `EXPIRED`, permanently disabling claims and locking custody to protect public health.
- **Abandoned Claim Watchdog:** If a courier claims a rescue (`CLAIMED`) but fails to scan the pickup QR within the deadline, the watchdog automatically reverts the status to `OPEN`, notifies the donor, and re-broadcasts to nearby couriers.

### 4. 🔐 QR-Based Chain-of-Custody Traceability (Module 4)
- **Cryptographic QR Code:** Generated automatically on donation creation (`qrcode.react`).
- **Two-Stage Checkpoint Scanning:**
  - **Checkpoint 1 (Donor Handover):** Courier scans QR at donor kitchen → transitions `CLAIMED` → `IN_TRANSIT` with timestamp and volunteer verification.
  - **Checkpoint 2 (NGO Delivery):** NGO coordinator scans QR at intake shelter → transitions `IN_TRANSIT` → `DELIVERED`, incrementing rescued meal metrics and crediting volunteer leaderboard stats.
- **Desktop Demo Scanner:** Built-in **"Simulate QR Scan (Demo)"** button alongside the camera scanner (`html5-qrcode`) for seamless 1-screen laptop judging.
- **Visual Audit Timeline:** Rendered on each card with actors, roles, timestamps, locations, and cryptographic badges.

### 5. 🗺️ Interactive Food Rescue Heatmap (Module 5)
- **Interactive Leaflet Map:** Powered by `react-leaflet` with OpenStreetMap tiles (no paid API keys required).
- **Live Visual Markers:**
  - **Donor Kitchens:** Custom pin markers displaying live portion surplus counts.
  - **Verified Shelters:** Shield markers displaying real-time daily intake capacity bars.
  - **Active Transit Corridors:** Animated dashed polylines connecting donor kitchens to destination shelters.
  - **Heatmap Baseline Overlays:** Circular zones highlighting Surplus Hotspots vs. High-Demand Hunger Zones.
- **Data Provenance Filter:** Switch between `All Data`, `Live Records Only`, and `Hotspot Baselines Only` with distinct visual styling and clear provenance labels.

### 6. 🛡️ Trust, Safety & Verification System (Module 6)
- **Admin Approval Workflow:** New registrations start as `PENDING_VERIFICATION` (e.g., *Royal Heritage Banquets* and *Asha Jyoti Shelter*).
- **Inspection Checklist:** Admins verify FSSAI licenses, municipal registration numbers, and hygienic cold-chain acknowledgments before clicking **Approve** or **Reject**.
- **Public Trust Profiles:** Real-time on-time pickup rates (%), zero-spoilage track records, and hygiene disclaimers.

### 7. 📊 Impact Hub & Community Leaderboard (Module 7)
- **Real-Time KPIs:** Total Meals Rescued, Completed Donations, Kg of CO₂ Prevented (~2.5 kg CO₂ / kg food diverted from landfills), Active Verified NGOs, and Active Volunteers.
- **Monthly Impact Trend Chart:** Area chart visualizing month-over-month rescue growth.
- **Dual Gamified Leaderboards:**
  - **Top Food Hero Donors** (ranked by meals saved & zero-spoilage rate)
  - **Rapid Rescue Volunteers** (ranked by completed missions & average pickup time)

---

## 🎮 Hackathon Demo Control Bar (Judge Simulator)
A built-in floating pill docked at the bottom of the screen allows judges to test real-time edge cases with one click:
- ⏩ **+30 Mins Fast-Forward:** Advances all expiry timers, shifting standard donations into urgent/critical tiers.
- ⏩ **+60 Mins Fast-Forward:** Triggers the hard safe-until lock on short-window meals.
- ⚠️ **Simulate Timeout:** Forces an unfulfilled courier claim to expire, triggering the **Abandoned Claim Watchdog** to auto-reopen the listing to the network.
- 🚨 **Live Surplus Alert:** Spawns an urgent fresh donation and broadcasts an instant alert banner.
- 🔄 **Reset State:** Restores the database to clean seed baseline.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **Mapping:** Leaflet & React-Leaflet + OpenStreetMap tiles
- **Analytics Charts:** Recharts
- **QR Engine:** `qrcode.react` (generation) + `html5-qrcode` (webcam scanning + desktop simulation)
- **State & Store:** In-memory persistent reactive store + Next.js REST API routes

---

## 🏃 Quickstart Guide

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm run dev

# 3. Or build and run production mode
npm run build
npm start
```

Open `http://localhost:3000` in your browser. Use the role-switching tabs in the navbar to test the Donor Portal, NGO Portal, Live Map & Impact Hub, and Admin Console!
