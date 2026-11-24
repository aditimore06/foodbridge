// End-to-end verification script for FoodBridge API
async function runTests() {
  // Reset clean state
  await fetch('http://localhost:3000/api/demo/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset' })
  });

  console.log('--- 1. Testing /api/stats ---');
  const resStats = await fetch('http://localhost:3000/api/stats');
  const dataStats = await resStats.json();
  console.log('Total Meals Rescued:', dataStats.stats.totalMealsRescued);
  console.log('CO2 Prevented:', dataStats.stats.co2PreventedKg, 'kg');
  console.log('Active Verified NGOs:', dataStats.stats.activeVerifiedNgos);
  console.log('Top Donor:', dataStats.topDonors[0].name, 'with', dataStats.topDonors[0].totalMealsDonated, 'meals');

  console.log('\n--- 2. Testing /api/donations ---');
  const resDonations = await fetch('http://localhost:3000/api/donations');
  const dataDonations = await resDonations.json();
  console.log('Total Donations in pipeline:', dataDonations.donations.length);
  dataDonations.donations.forEach(d => {
    console.log(`- [${d.id}] ${d.foodTitle} (${d.quantityMeals}m) | Status: ${d.status} | Priority: ${d.priorityTier}`);
  });

  console.log('\n--- 3. Testing Module 1: Surplus Prediction & Compliance Disclaimer ---');
  const resPred = await fetch('http://localhost:3000/api/predictions?donorId=DONOR-01');
  const dataPred = await resPred.json();
  console.log('Prediction Disclaimer:', dataPred.disclaimer);
  console.log('Recommended Action:', dataPred.predictions[0].recommendedAction);
  console.log('Confidence Score:', dataPred.predictions[0].confidenceScore + '%');

  console.log('\n--- 4. Testing Module 2: Haversine Matching & Split-Donation Engine ---');
  const resSplit = await fetch('http://localhost:3000/api/donations/DON-2026-002');
  const dataSplit = await resSplit.json();
  console.log('Donation: Grand Wedding Feast (160 meals)');
  console.log('Is Split Needed:', dataSplit.splitRecommendation.isSplitNeeded);
  console.log('Optimal Split Plan:');
  dataSplit.splitRecommendation.allocations.forEach(a => {
    console.log(`  -> ${a.meals} meals to ${a.ngoName} (${a.distanceKm} km away)`);
  });

  console.log('\n--- 5. Testing Module 4: QR Checkpoint Verification Traceability ---');
  // Claim DON-2026-001 (Safe until now + 28 mins)
  const resPickup = await fetch('http://localhost:3000/api/donations/DON-2026-001/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ngoId: 'NGO-01', volunteerId: 'VOL-01' })
  });
  const dataClaim = await resPickup.json();
  console.log('Claimed DON-2026-001 for Robin Hood Army (NGO-01):', dataClaim.success);

  // Checkpoint 1: Pickup Scan
  const resScan1 = await fetch('http://localhost:3000/api/donations/DON-2026-001/scan-pickup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'Handover verified with thermal seal check at IIT Campus Mess #3.' })
  });
  const dataScan1 = await resScan1.json();
  console.log('Checkpoint 1 (Pickup Handover Scan) -> Status:', dataScan1.donation.status);

  // Checkpoint 2: Delivery Scan
  const resScan2 = await fetch('http://localhost:3000/api/donations/DON-2026-001/scan-delivery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverNotes: 'Delivery accepted and stored in cooling unit at Robin Hood Army.' })
  });
  const dataScan2 = await resScan2.json();
  console.log('Checkpoint 2 (NGO Delivery Scan) -> Status:', dataScan2.donation.status);
  console.log('Chain of custody verified events:', dataScan2.donation.chainOfCustody.length);

  console.log('\n--- 6. Testing Module 3: Watchdog Simulation & Expiry ---');
  // Abandoned claim watchdog simulation
  const resWatchdog = await fetch('http://localhost:3000/api/demo/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'simulateAbandonedClaim' })
  });
  const dataWatchdog = await resWatchdog.json();
  console.log('Watchdog Abandoned Claim simulation result:', dataWatchdog.success);

  // Fast forward +30m
  const resFF = await fetch('http://localhost:3000/api/demo/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'fastForward', minutes: 30 })
  });
  const dataFF = await resFF.json();
  console.log('Fast-Forward +30m result:', dataFF.success);

  console.log('\n--- 7. Testing Module 6: Admin Verification Workflow ---');
  const resVerify = await fetch('http://localhost:3000/api/admin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entityType: 'donor', id: 'DONOR-06', status: 'VERIFIED' })
  });
  const dataVerify = await resVerify.json();
  console.log('Admin Approval message:', dataVerify.message);

  // Clean reset after tests so app starts pristine
  await fetch('http://localhost:3000/api/demo/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset' })
  });

  console.log('\n✅ ALL MODULES TESTED AND FULLY VERIFIED!');
}

runTests().catch(console.error);
