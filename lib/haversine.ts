/**
 * Haversine Formula for exact great-circle distance between two geographic coordinates on Earth.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Return rounded to 2 decimal places
  return Math.round(distance * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimate urban delivery transit time in minutes based on distance and city speed profile (~20 km/h avg urban speed + 5 min buffer).
 */
export function estimateTransitMinutes(distanceKm: number): number {
  const avgUrbanSpeedKmH = 22;
  const bufferMins = 6;
  const transitMinutes = Math.round((distanceKm / avgUrbanSpeedKmH) * 60 + bufferMins);
  return Math.max(8, transitMinutes);
}
