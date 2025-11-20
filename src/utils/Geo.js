
export async function getLatLongFromAddress(address1, address2, city, pincode, country) {
    const query = encodeURIComponent(`${address1} ${address2 || ''} ${city} ${pincode} ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Live-MART-App/1.0 (contact@example.com)' // Nominatim asks for user-agent
            }
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || data.length === 0) return null;

        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };
    } catch (err) {
        console.error('Geocode error:', err);
        return null;
    }
}
