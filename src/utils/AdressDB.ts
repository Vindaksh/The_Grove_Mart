import Supabase from "./Database";
import { AddressInterface, UserInterface } from "./Interfaces";

type AddressInputInterface = {
    formatted_address: string,
    lat: number,
    lng: number
}
export async function saveAddressForUser(user: UserInterface, address: AddressInputInterface) {
    const payload = {
        user_id: user.id,
        ...address
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

export async function getSavedAddresses(user: UserInterface) {
    const { data, error } = await Supabase
        .from("saved_addresses")
        .select("*")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching addresses:", error);
        return [];
    }

    return data;
}

type AddressUpdateInterface = {
    formatted_address?: string,
    lat?: number,
    lng?: number
}
export async function updateSavedAddress(addressId: string, updates: AddressUpdateInterface) {
    const { data, error } = await Supabase
        .from("saved_addresses")
        .update(updates)
        .eq("address_id", addressId)
        .select()
        .single();

    if (error) {
        console.error("Error updating address:", error);
        return null;
    }

    return data;
}

export async function deleteSavedAddress(addressId: string) {
    const { error } = await Supabase
        .from("saved_addresses")
        .delete()
        .eq("address_id", addressId);

    if (error) {
        console.error("Error deleting address:", error);
        return false;
    }
    return true;
}

export async function updateOrderLatLng(orderId:number, lat:number, lng:number) {
    const { data, error } = await Supabase
        .from("orders")
        .update({
            lat: lat,
            lng: lng,
        })
        .eq("order_id", orderId)
        .select();

    if (error) {
        console.error("Failed to update order location:", error);
        return null;
    }

    return data;
}
