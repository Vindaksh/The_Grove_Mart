import Supabase from "./Database";

export async function saveAddressForUser(userId, address, coords = null) {
    const payload = {
        user_id: userId,
        address1: address.address1,
        address2: address.address2 || null,
        city: address.city,
        pincode: address.pincode,
        country: address.country,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null
    };

    const { data, error } = await Supabase
        .from('saved_addresses')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('Error saving address:', error);
        return null;
    }
    return data;
}

export async function getSavedAddresses(userId) {
    const { data, error } = await Supabase
        .from("saved_addresses")
        .select("*")
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching addresses:", error);
        return [];
    }

    return data;
}
