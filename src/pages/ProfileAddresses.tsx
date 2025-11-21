import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AddressInterface } from "../utils/Interfaces";
import { deleteSavedAddress, getSavedAddresses, saveAddressForUser, updateSavedAddress } from "../utils/AdressDB";
import { useAuth } from "../context/AuthContext";
import { getLatLongFromAddress } from "../utils/Geo";


export const ProfileAddressesPage = () => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<AddressInterface[]>([]);
    const [form, setForm] = useState({
    address1: "",
    address2: "",
    city: "",
    pincode: "",
    country: ""
    });

    const loadAddresses = async () => {
        if (!user) return;
        const data = await getSavedAddresses(user);
        setAddresses(data);
    };

    useEffect(() => {
        loadAddresses();
    }, [user]);

    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const startEdit = (addr: AddressInterface) => {
        setEditingId(addr.address_id);
        setForm({
        address1: addr.address1,
        address2: addr.address2 || "",
        city: addr.city,
        pincode: addr.pincode,
        country: addr.country
        });
    };

    const handleDeleteAddress = async (id: string) => {
        if (!window.confirm("Delete this address?")) return;
        await deleteSavedAddress(id);
        loadAddresses();
    };

    const handleSaveAddress = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;
    
      // ---------------------------------
      // 1. Fetch coordinates first
      // ---------------------------------
      const coords = await getLatLongFromAddress(
        form.address1,
        form.address2,
        form.city,
        form.pincode,
        form.country
      );
    
      console.log("📍 Geocoded coords:", coords);
    
      // ---------------------------------
      // 2. SAVE OR UPDATE WITH COORDINATES
      // ---------------------------------
      if (editingId) {
        // Updating an existing address
        await updateSavedAddress(editingId, {
          ...form,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null
        });
    
        setEditingId(null);
    
      } else {
        // Creating a new address
        await saveAddressForUser(
          user,
          {
            ...form,
            lat: coords?.lat ?? null,
            lng: coords?.lng ?? null
          }
        );
      }
    
      // ---------------------------------
      // 3. Reset form & reload
      // ---------------------------------
      setForm({
        address1: "",
        address2: "",
        city: "",
        pincode: "",
        country: ""
      });
    
      loadAddresses();
    };

    
    const [editingId, setEditingId] = useState<string|null>(null);

    return (
        <div>
            <h2 className="section-title">Your Saved Addresses</h2>

            {addresses.length === 0 && <p>No saved addresses yet.</p>}

            <div className="address-list">
              {addresses.map(addr => (
                <div key={addr.address_id} className="address-card">
                  <p>{addr.address1}</p>
                  {addr.address2 && <p>{addr.address2}</p>}
                  <p>{addr.city}, {addr.pincode}</p>
                  <p>{addr.country}</p>

                  {addr.lat && addr.lng && (
                    <p className="coords">📍 {addr.lat}, {addr.lng}</p>
                  )}

                  <div className="address-buttons">
                    <button onClick={() => startEdit(addr)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteAddress(addr.address_id!)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ----- ADD/EDIT FORM ----- */}
            <h2 className="section-title">{editingId ? "Edit Address" : "Add New Address"}</h2>

            <form className="address-form" onSubmit={handleSaveAddress}>
              <input name="address1" placeholder="Address Line 1" value={form.address1} onChange={handleChange} required />
              <input name="address2" placeholder="Address Line 2" value={form.address2} onChange={handleChange} />
              <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
              <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required />
              <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required />

              <button type="submit">{editingId ? "Save Changes" : "Add Address"}</button>

              {editingId && (
                <button type="button" className="cancel-btn" onClick={() => {
                  setEditingId(null);
                  setForm({ address1: "", address2: "", city: "", pincode: "", country: "" });
                }}>
                  Cancel
                </button>
              )}
            </form>
        </div>
    );
};