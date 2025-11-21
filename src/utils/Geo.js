export async function getLatLongFromAddress(
    address1,
    address2,
    city,
    pincode,
    country
) {
    const POSITIONSTACK_KEY = "f4d1e546ecd0ee8a734fa189db8ef64f"; // <-- replace with your key

    // Positionstack accepts a single query string
    const query = `${address1} ${address2 || ""} ${city} ${pincode} ${country}`.trim();

    const url = `http://api.positionstack.com/v1/forward?access_key=${POSITIONSTACK_KEY}&query=${encodeURIComponent(query)}&limit=1`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("PositionStack request failed:", res.status);
            return null;
        }

        const data = await res.json();
        console.log("📍 PositionStack response:", data);

        if (!data || !data.data || data.data.length === 0) {
            console.warn("⚠️ No geocode results");
            return null;
        }

        const loc = data.data[0];

        return {
            lat: loc.latitude,
            lng: loc.longitude
        };

    } catch (err) {
        console.error("🌍 PositionStack geocode error:", err);
        return null;
    }
}
