import React, { useState, ChangeEvent } from 'react';
import { MapPin, ArrowLeft, Check } from 'lucide-react';

interface Step2Props {
    onNext: (e: React.FormEvent<HTMLFormElement>) => void;
    onPrev: () => void;
    onChange: (data: { [key: string]: string }) => void;
    initialFormData: { role: "Customer" | "Retailer" | "Wholesaler", name: string, latitude: number | null, longitude: number | null };
}

const Step2 = ({ onNext, onPrev, onChange, initialFormData }: Step2Props) => {
    const [formData, setFormData] = useState(initialFormData);
    const [locLoading, setLocLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        onChange({ [name]: value });
    };

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        onChange({ [name]: value });
    };

    const handleCurrentLocation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault(); // Prevent form submit
        setLocLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData({ ...formData, latitude, longitude });
                    onChange({ "latitude": String(latitude), "longitude": String(longitude) });
                    setLocLoading(false);
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    alert("Could not get location. Please enter manually.");
                    setLocLoading(false);
                }
            )
        } else {
            console.error("Geolocation not supported");
            setLocLoading(false);
        }
    }

    // Shared styles
    const labelClass = "block text-sm font-bold text-slate-700 mb-1";
    const inputClass = "appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm bg-slate-50/50 transition-all";

    return (
        <form className="space-y-6" onSubmit={onNext}>
            <div className="space-y-5">
                {/* Role Selection */}
                <div>
                    <label htmlFor="role" className={labelClass}>I am a:</label>
                    <div className="relative">
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleSelect}
                            className={inputClass}
                        >
                            <option value="Customer">Customer (I want to buy things)</option>
                            <option value="Retailer">Retailer (I own a shop)</option>
                            <option value="Wholesaler">Wholesaler (I supply in bulk)</option>
                        </select>
                    </div>
                </div>

                {/* Name Input */}
                <div>
                    <label htmlFor="name" className={labelClass}>
                        {formData.role !== 'Customer' ? `${formData.role} Name` : 'Full Name'}
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder={formData.role === 'Retailer' ? "e.g. Joe's Grocery" : "e.g. John Doe"}
                    />
                </div>

                {/* Location Section (Only for Sellers) */}
                {(formData.role !== 'Customer') && (
                    <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-rose-700">Business Location</h3>
                            <button
                                onClick={handleCurrentLocation}
                                type="button"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm"
                            >
                                {locLoading ? 'Locating...' : <><MapPin size={14} /> Get Current Location</>}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="latitude" className="block text-xs font-semibold text-slate-500 mb-1">Latitude</label>
                                <input
                                    id="latitude"
                                    type="number"
                                    step={0.000001}
                                    name="latitude"
                                    value={formData.latitude || ''}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="longitude" className="block text-xs font-semibold text-slate-500 mb-1">Longitude</label>
                                <input
                                    id="longitude"
                                    type="number"
                                    step={0.000001}
                                    name="longitude"
                                    value={formData.longitude || ''}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onPrev}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <button
                    type="submit"
                    className="flex-[2] flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-lg shadow-rose-200 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 hover:-translate-y-0.5 transition-all"
                >
                    Complete Registration <Check size={16} className="ml-2" />
                </button>
            </div>
        </form>
    );
};

export default Step2;