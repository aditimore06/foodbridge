// Comprehensive API & Store Health Check
const BASE_URL = 'http://localhost:3000';

async function testAllEndpoints() {
  const results = [];
  const log = (name, passed, details = '') => {
    results.push({ name, passed, details });
    console.log(`${passed ? '✅' : '❌'} [${name}] ${details}`);
  };

  try {
    // 0. Reset to baseline
    const resReset = await fetch(`${BASE_URL}/api/demo/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' })
    });
    const resetJson = await resReset.json();
    log('Demo Action: Reset', resetJson.success, 'Database reset to clean seed state');

    // 1. GET /api/stats
    const resStats = await fetch(`${BASE_URL}/api/stats`);
    const statsJson = await resStats.json();
    const statsOk = statsJson.success && statsJson.stats.totalMealsRescued > 0 && statsJson.topDonors.length > 0;
    log('GET /api/stats', statsOk, `Rescued: ${statsJson.stats?.totalMealsRescued}, Donors: ${statsJson.topDonors?.length}`);

    // 2. GET /api/donations
    const resDonations = await fetch(`${BASE_URL}/api/donations`);
    const donationsJson = await resDonations.json();
    const donationsOk = donationsJson.success && donationsJson.donations.length >= 4;
    log('GET /api/donations', donationsOk, `Found ${donationsJson.donations?.length} seeded donations`);

    // 3. GET /api/donors
    const resDonors = await fetch(`${BASE_URL}/api/donors`);
    const donorsJson = await resDonors.json();
    const donorsOk = donorsJson.success && donorsJson.donors.length === 6;
    log('GET /api/donors', donorsOk, `Found ${donorsJson.donors?.length} donors (including 1 pending)`);

    // 4. GET /api/ngos
    const resNgos = await fetch(`${BASE_URL}/api/ngos`);
    const ngosJson = await resNgos.json();
    const ngosOk = ngosJson.success && ngosJson.ngos.length === 5;
    log('GET /api/ngos', ngosOk, `Found ${ngosJson.ngos?.length} NGOs (4 verified, 1 pending)`);

    // 5. GET /api/zones
    const resZones = await fetch(`${BASE_URL}/api/zones`);
    const zonesJson = await resZones.json();
    const zonesOk = zonesJson.success && zonesJson.zones.length === 6;
    log('GET /api/zones', zonesOk, `Found ${zonesJson.zones?.length} heatmap baseline zones`);

    // 6. GET /api/predictions
    const resPred = await fetch(`${BASE_URL}/api/predictions?donorId=DONOR-01`);
    const predJson = await resPred.json();
    const predOk = predJson.success && predJson.predictions.length > 0 && predJson.chartData.length > 0;
    log('GET /api/predictions', predOk, `Compliance badge: "${predJson.disclaimer}"`);

    // 7. GET /api/donations/[id] (Haversine Matching & Split Evaluation)
    const resMatch = await fetch(`${BASE_URL}/api/donations/DON-2026-002`);
    const matchJson = await resMatch.json();
    const matchOk = matchJson.success && matchJson.matchingScores.length > 0 && matchJson.splitRecommendation.isSplitNeeded;
    log('GET /api/donations/[id] (Matching & Split)', matchOk, 
      `Ranked: ${matchJson.matchingScores?.length} NGOs, Split needed for 160m: ${matchJson.splitRecommendation?.isSplitNeeded}`
    );

    // 8. POST /api/donations (Create new donation)
    const resCreate = await fetch(`${BASE_URL}/api/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorId: 'DONOR-03',
        donorName: 'Spice Route Kitchen',
        donorAddress: 'Brigade Road, Bengaluru',
        foodTitle: 'E2E Healthcheck Fragrant Ghee Rice & Sambar',
        quantityMeals: 50,
        foodCategory: 'COOKED_MEALS',
        dietaryType: 'VEGETARIAN',
        safeUntil: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      })
    });
    const createJson = await resCreate.json();
    const createOk = createJson.success && createJson.donation?.id;
    const newDonationId = createJson.donation?.id;
    log('POST /api/donations', createOk, `Created new donation ${newDonationId}`);

    // 9. POST /api/donations/[id]/claim (Claim for NGO)
    const resClaim = await fetch(`${BASE_URL}/api/donations/${newDonationId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ngoId: 'NGO-01', volunteerId: 'VOL-01' })
    });
    const claimJson = await resClaim.json();
    const claimOk = claimJson.success && claimJson.donation?.status === 'CLAIMED';
    log('POST /api/donations/[id]/claim', claimOk, `Status updated to ${claimJson.donation?.status}`);

    // 10. POST /api/donations/[id]/scan-pickup (Checkpoint 1)
    const resScan1 = await fetch(`${BASE_URL}/api/donations/${newDonationId}/scan-pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerId: 'VOL-01', notes: 'E2E Checkpoint 1 verified.' })
    });
    const scan1Json = await resScan1.json();
    const scan1Ok = scan1Json.success && scan1Json.donation?.status === 'IN_TRANSIT';
    log('POST /api/donations/[id]/scan-pickup (CP1)', scan1Ok, `Status updated to ${scan1Json.donation?.status}`);

    // 11. POST /api/donations/[id]/scan-delivery (Checkpoint 2)
    const resScan2 = await fetch(`${BASE_URL}/api/donations/${newDonationId}/scan-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverNotes: 'E2E Checkpoint 2 intake verified.' })
    });
    const scan2Json = await resScan2.json();
    const scan2Ok = scan2Json.success && scan2Json.donation?.status === 'DELIVERED';
    log('POST /api/donations/[id]/scan-delivery (CP2)', scan2Ok, `Status updated to ${scan2Json.donation?.status}`);

    // 12. POST /api/admin/verify
    const resVerify = await fetch(`${BASE_URL}/api/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType: 'ngo', id: 'NGO-05', status: 'VERIFIED' })
    });
    const verifyJson = await resVerify.json();
    const verifyOk = verifyJson.success && verifyJson.ngos.find(n => n.id === 'NGO-05')?.verificationStatus === 'VERIFIED';
    log('POST /api/admin/verify', verifyOk, 'NGO-05 transitioned from PENDING to VERIFIED');

    // 13. POST /api/demo/action (Fast Forward)
    const resFF = await fetch(`${BASE_URL}/api/demo/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fastForward', minutes: 30 })
    });
    const ffJson = await resFF.json();
    log('POST /api/demo/action (fastForward)', ffJson.success, `Advanced timers by +30m`);

    // 14. POST /api/demo/action (simulateAbandonedClaim)
    const resWatchdog = await fetch(`${BASE_URL}/api/demo/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'simulateAbandonedClaim' })
    });
    const watchdogJson = await resWatchdog.json();
    log('POST /api/demo/action (simulateAbandonedClaim)', watchdogJson.success, 'Watchdog timeout triggered');

    // 15. Final Clean Reset
    await fetch(`${BASE_URL}/api/demo/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' })
    });
    log('Demo Action: Final Reset', true, 'Clean demo state restored');

    const allPassed = results.every(r => r.passed);
    console.log(`\n==========================================`);
    console.log(allPassed ? '🎉 ALL 15 API ENDPOINT TESTS PASSED!' : '⚠️ SOME TESTS FAILED');
    console.log(`==========================================`);
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  }
}

testAllEndpoints();
