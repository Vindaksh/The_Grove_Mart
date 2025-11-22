import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AddressInterface } from "../utils/Interfaces";
import { deleteSavedAddress, getSavedAddresses, saveAddressForUser, updateSavedAddress } from "../utils/AdressDB";
import { useAuth } from "../context/AuthContext";
import { getLatLongFromAddress } from "../utils/Geo";
import { MapPin, Edit2, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProfileAddressesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<AddressInterface[]>([]);
    const [form, setForm] = useState({ address1: "", address2: "", city: "", pincode: "", country: "" });
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    const loadAddresses = async () => {
        if (!user) return;
        const data = await getSavedAddresses(user);
        setAddresses(data);
        setLoading(false);
    };

    useEffect(() => { setLoading(true); loadAddresses(); }, [user]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

    const startEdit = (addr: AddressInterface) => {
        setEditingId(addr.address_id);
        setForm({ address1: addr.address1, address2: addr.address2 || "", city: addr.city, pincode: addr.pincode, country: addr.country });
    };

    const handleDeleteAddress = async (id: string) => {
        if (!window.confirm("Delete this address?")) return;
        await deleteSavedAddress(id);
        setLoading(true);
        loadAddresses();
    };

    const handleSaveAddress = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        const coords = await getLatLongFromAddress(form.address1, form.address2, form.city, form.pincode, form.country);
        if (editingId) {
            await updateSavedAddress(editingId, { ...form, lat: coords?.lat, lng: coords?.lng });
            setEditingId(null);
        } else {
            await saveAddressForUser(user, { ...form, lat: coords?.lat ?? null, lng: coords?.lng ?? null });
        }
        setForm({ address1: "", address2: "", city: "", pincode: "", country: "" });
        setLoading(true);
        loadAddresses();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* BACK BUTTON */}
            <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Profile
            </button>

            <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Saved Addresses</h2>
                <p className="text-slate-500">Manage your shipping locations.</p>
            </div>

            {loading ? (
                <div className="text-center py-10 text-rose-400 font-medium animate-pulse">Loading addresses...</div>
            ) : addresses.length === 0 ? (
                <div className="bg-white p-8 rounded-[2rem] text-center border border-rose-100 shadow-sm">
                    <div className="bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="text-rose-500" size={24} />
                    </div>
                    <p className="text-slate-500">No addresses saved yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                        <div key={addr.address_id} className="bg-white rounded-[2rem] shadow-sm border border-rose-100 p-6 hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-rose-50 rounded-xl text-rose-500">
                                    <MapPin size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800">{addr.address1}</p>
                                    {addr.address2 && <p className="text-sm text-slate-500">{addr.address2}</p>}
                                    <p className="text-sm text-slate-500">{addr.city}, {addr.pincode}</p>
                                    <p className="text-sm text-slate-400 mt-1 uppercase font-bold tracking-wide">{addr.country}</p>
                                </div>
                            </div>
                            {addr.lat && addr.lng && <p className="text-xs text-slate-400 mt-4 pl-11">📍 {addr.lat}, {addr.lng}</p>}
                            <div className="flex gap-2 mt-6 justify-end">
                                <button onClick={() => startEdit(addr)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><Edit2 size={18} /></button>
                                <button onClick={() => handleDeleteAddress(addr.address_id!)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Form */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-rose-100/50 border border-rose-100 p-8 mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    {editingId ? <Edit2 size={20} className="text-rose-500" /> : <Plus size={20} className="text-rose-500" />}
                    {editingId ? "Edit Address" : "Add New Address"}
                </h3>
                <form className="space-y-4" onSubmit={handleSaveAddress}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="address1" placeholder="Address Line 1" value={form.address1} onChange={handleChange} required className="w-full p-4 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-medium" />
                        <input name="address2" placeholder="Address Line 2 (Optional)" value={form.address2} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-medium" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required className="w-full p-4 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-medium" />
                        <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required className="w-full p-4 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-medium" />
                        <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required className="w-full p-4 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-medium col-span-2 md:col-span-1" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 hover:-translate-y-0.5 transition-all">{editingId ? "Save Changes" : "Add Address"}</button>
                        {editingId && <button type="button" className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all" onClick={() => { setEditingId(null); setForm({ address1: "", address2: "", city: "", pincode: "", country: "" }); }}>Cancel</button>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileAddressesPage;