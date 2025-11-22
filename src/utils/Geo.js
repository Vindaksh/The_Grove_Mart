export async function getLatLongFromAddress(
    address1,
    address2,
    city,
    pincode,
    country
) {
    const query = `${address1} ${address2 || ""} ${city} ${pincode} ${country}`.trim();

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        query
    )}&key=${import.meta.env.VITE_GMAP_KEY}`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            console.error("Google Maps Geocoding request failed:", res.status);
            return null;
        }

        const data = await res.json();
        console.log("📍 Google Geocoding response:", data);

        if (!data.results || data.results.length === 0) {
            console.warn("⚠️ No geocode results");
            return null;
        }

        const loc = data.results[0].geometry.location;

        return {
            lat: loc.lat,
            lng: loc.lng,
        };
    } catch (err) {
        console.error("🌍 Google Maps geocode error:", err);
        return null;
    }
}
